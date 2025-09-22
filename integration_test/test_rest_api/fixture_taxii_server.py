import json
import logging
import os
import pathlib
import random
import string
import subprocess
import tempfile
import pytest
from dataclasses import dataclass

import requests

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

MONGO_DB_PORT = os.environ.get('MONGO_DB_PORT', '27017')
MONGO_DB_USERNAME = os.environ['MONGO_DB_USERNAME']
MONGO_DB_PASSWORD = os.environ['MONGO_DB_PASSWORD']

def generate_password(size=20, chars=string.ascii_lowercase + string.ascii_uppercase + string.digits):
    return ''.join(random.choice(chars) for _ in range(size))

MEDALLION_ADMIN_USERNAME = "admin"
MEDALLION_ADMIN_PASSWORD = generate_password()

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
    def readable_and_writable_collection_url(self) -> str:
        # https://github.com/oasis-open/cti-taxii-server/blob/39e76bf18be5371e9570de7e5f340c3937b69c0d/medallion/test/data/default_data.json#L106C24-L106C60
        return f"{self.server_url}/trustgroup1/365fed99-08fa-fdcd-a1b3-fb247eb41d01"

@pytest.fixture(scope='class')
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
        logger.info(f"Running docker compose with: {docker_compose_up_cmd}")

        subprocess.run(docker_compose_up_cmd, check=True)

        process_list_containers = subprocess.run(["docker", "compose", "--project-name", DOCKER_COMPOSE_PROJECT_NAME, "ps", "--all"], check=True)
        logger.info(process_list_containers.stdout)

        yield Taxii2ServerConnectionInfo(server_url="http://localhost:5000",
                                        username=MEDALLION_ADMIN_USERNAME,
                                        password=MEDALLION_ADMIN_PASSWORD)

        docker_compose_down_cmd = ["docker", "compose", "--project-name", DOCKER_COMPOSE_PROJECT_NAME, "down"]
        subprocess.run(docker_compose_down_cmd, check=True)

@pytest.fixture(scope='class')
def taxii2_server_session(taxii2_server):
    session = requests.Session()
    session.auth = (taxii2_server.username, taxii2_server.password)
    session.headers.update({
        "Accept": "application/taxii+json;version=2.1",
    })
    return session
