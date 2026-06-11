import json
import logging
import os
import pathlib
import subprocess
import tempfile
import time
from util import random_alnum_string
from taxii_server_connection_info import Taxii2ServerConnectionInfo

import pytest
import requests

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# This should be specified when running Splunk as Docker container
TAXII_SERVER_HOST = os.environ.get('TAXII_SERVER_HOST', 'localhost')
TAXII_SERVER_URL = f"http://{TAXII_SERVER_HOST}:5000"


MEDALLION_ADMIN_USERNAME = "admin"
MEDALLION_ADMIN_PASSWORD = random_alnum_string()

MEDALLION_USERS_JSON = {
    "users" : {
        MEDALLION_ADMIN_USERNAME: MEDALLION_ADMIN_PASSWORD
    }
}


# TODO: Since we are now using a fork of the original cti-taxii-server repo, we can remove some of the overrides
TAXII_SERVER_REPO = "https://github.com/bliew-splunk/cti-taxii-server.git"
DOCKER_COMPOSE_PROJECT_NAME = "test-medallion-taxii2-server"

OVERRIDE_YAML = """
---
services:
  medallion:
    command: [sh, -c, "medallion --host 0.0.0.0 --log-level=DEBUG --debug-mode"]
    environment:
      AUTH_TYPE: basic
"""


def run_subprocess_and_log_output(cmd, **kwargs):
    logger.info(f"Running command: {cmd}")
    process = subprocess.run(cmd, capture_output=True, text=True, **kwargs)
    logger.info(process.stdout)
    if process.stderr:
        logger.error(process.stderr)
    process.check_returncode()
    return process


@pytest.fixture(scope='module')
def taxii2_server():
    MONGO_DB_PORT = os.environ.get('MONGO_DB_PORT', '27017')
    MONGO_DB_USERNAME = os.environ['MONGO_DB_USERNAME']
    MONGO_DB_PASSWORD = os.environ['MONGO_DB_PASSWORD']
    MEDALLION_BACKEND_CONFIG = {
        "backend": {
            "module_class": "MongoBackend",
            "uri": f"mongodb://{MONGO_DB_USERNAME}:{MONGO_DB_PASSWORD}@mongo:{MONGO_DB_PORT}/",
            "filename": "medallion/test/data/default_data.json"
        }
    }
    with tempfile.TemporaryDirectory() as tmpdirname:
        logger.info(f'Created temporary directory: {tmpdirname}')
        run_subprocess_and_log_output(["git", "clone", "--depth=1", TAXII_SERVER_REPO, tmpdirname])

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
        try:
            run_subprocess_and_log_output(docker_compose_up_cmd)
        except subprocess.CalledProcessError:
            logger.exception("Error spinning up docker compose project")
            run_subprocess_and_log_output(["docker", "compose", "--project-name", DOCKER_COMPOSE_PROJECT_NAME, "logs", "medallion"])
        run_subprocess_and_log_output(["docker", "compose", "--project-name", DOCKER_COMPOSE_PROJECT_NAME, "ps", "--all"])

        yield Taxii2ServerConnectionInfo(server_url=TAXII_SERVER_URL,
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
    MAX_ATTEMPTS = 15
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
