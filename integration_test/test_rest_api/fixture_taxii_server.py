import json
import logging
import os
import pathlib
import subprocess
import tempfile
import time
from dataclasses import dataclass
from util import random_alnum_string

import pytest
import requests

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

MONGO_DB_PORT = os.environ.get('MONGO_DB_PORT', '27017')
MONGO_DB_USERNAME = os.environ['MONGO_DB_USERNAME']
MONGO_DB_PASSWORD = os.environ['MONGO_DB_PASSWORD']


MEDALLION_ADMIN_USERNAME = "admin"
MEDALLION_ADMIN_PASSWORD = random_alnum_string()

MEDALLION_USERS_JSON = {
    "users" : {
        MEDALLION_ADMIN_USERNAME: MEDALLION_ADMIN_PASSWORD
    }
}

MEDALLION_BACKEND_CONFIG = {
  "backend": {
    "module_class": "MongoBackend",
    "uri": f"mongodb://{MONGO_DB_USERNAME}:{MONGO_DB_PASSWORD}@mongo:{MONGO_DB_PORT}/",
    "filename": "medallion/test/data/default_data.json"
  }
}

TAXII_SERVER_REPO = "https://github.com/oasis-open/cti-taxii-server.git"
DOCKER_COMPOSE_PROJECT_NAME = "test-medallion-taxii2-server"

OVERRIDE_YAML = """
---
services:
  medallion:
    command: [sh, -c, "medallion --host 0.0.0.0 --log-level=DEBUG --debug-mode"]
"""

@dataclass
class Taxii2ServerConnectionInfo:
    server_url: str
    username: str
    password: str

    @property
    def server_discovery_url(self) -> str:
        return f"{self.server_url}/taxii2"

    @property
    def default_api_root_url(self) -> str:
        return f"{self.server_url}/trustgroup1"

    @property
    def readable_and_writable_collection_id(self) -> str:
        return "365fed99-08fa-fdcd-a1b3-fb247eb41d01"

    @property
    def readable_and_writable_collection_url(self) -> str:
        # https://github.com/oasis-open/cti-taxii-server/blob/39e76bf18be5371e9570de7e5f340c3937b69c0d/medallion/test/data/default_data.json#L106C24-L106C60
        return f"{self.server_url}/trustgroup1/{self.readable_and_writable_collection_id}"

def run_subprocess_and_log_output(cmd, **kwargs):
    logger.info(f"Running command: {' '.join(cmd)}")
    process = subprocess.run(cmd, capture_output=True, text=True, **kwargs)
    logger.info(process.stdout)
    logger.error(process.stderr)
    process.check_returncode()
    return process


@pytest.fixture(scope='module')
def taxii2_server():
    with tempfile.TemporaryDirectory() as tmpdirname:
        logger.info(f'Created temporary directory: {tmpdirname}')
        git_clone_process = subprocess.run(["git", "clone", "--depth=1", TAXII_SERVER_REPO, tmpdirname], check=True)
        logger.info(git_clone_process.stdout)
        if git_clone_process.stderr:
            logger.error(git_clone_process.stderr)

        repo_path = pathlib.Path(tmpdirname)

        # Override medallion command to run in debug mode.
        with open(repo_path / 'docker-compose.override.yml', 'w') as f:
            f.write(OVERRIDE_YAML)

        medallion_docker_utils_path = pathlib.Path(tmpdirname) / 'docker_utils'
        medallion_config_path = medallion_docker_utils_path / 'config.d'
        with open(medallion_config_path / 'users.json', 'w') as f:
            json.dump(MEDALLION_USERS_JSON, f)

        with open(medallion_config_path / 'backend.json', 'w') as f:
            json.dump(MEDALLION_BACKEND_CONFIG, f)

        docker_compose_up_cmd = ["docker", "compose", "--project-name", DOCKER_COMPOSE_PROJECT_NAME,
                                 "-f", str(repo_path / "docker-compose.yml"),
                                 "-f", str(repo_path / "docker-compose.override.yml"),
                                 "up", "--detach", "--wait", "--build"]
        run_subprocess_and_log_output(docker_compose_up_cmd)

        run_subprocess_and_log_output(["docker", "compose", "--project-name", DOCKER_COMPOSE_PROJECT_NAME, "ps", "--all"])

        yield Taxii2ServerConnectionInfo(server_url="http://localhost:5000",
                                        username=MEDALLION_ADMIN_USERNAME,
                                        password=MEDALLION_ADMIN_PASSWORD)

        docker_compose_down_cmd = ["docker", "compose", "--project-name", DOCKER_COMPOSE_PROJECT_NAME, "down"]
        run_subprocess_and_log_output(docker_compose_down_cmd)

@pytest.fixture(scope='module')
def taxii2_server_session(taxii2_server):
    session = requests.Session()
    session.auth = (taxii2_server.username, taxii2_server.password)
    session.headers.update({
        "Accept": "application/taxii+json;version=2.1",
    })
    return session

@pytest.fixture(scope='module')
def taxii2_server_is_reachable(taxii2_server_session, taxii2_server):
    MAX_ATTEMPTS = 30
    POLL_INTERVAL_SECONDS = 2
    attempts = 0
    while attempts < MAX_ATTEMPTS:
        try:
            resp = taxii2_server_session.get(taxii2_server.server_discovery_url)
            resp.raise_for_status()
            logger.info(f"TAXII2 server at {taxii2_server.server_discovery_url} is reachable.")
            return
        except requests.exceptions.RequestException:
            logger.exception("TAXII2 server not reachable yet, retrying soon...")
            time.sleep(POLL_INTERVAL_SECONDS)
            attempts += 1
    raise RuntimeError(f"TAXII2 server at {taxii2_server.server_discovery_url} not reachable within the given time (max_attempts and poll interval).")
