from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from splunktaucclib.rest_handler.error import RestError

from solnlib import conf_manager, log
import logging
from const import ADDON_NAME_LOWER

logger = log.Logs().get_logger(f"{ADDON_NAME_LOWER}.{__name__}")
logger.setLevel(logging.INFO)


# https://github.com/oasis-open/cti-taxii-client/tree/master
def _validate_connection(server_base_url: str, username, password):
    logger.info(f"Validating connection to {server_base_url} with username={username}")
    try:
        from taxii2client.v21 import Server
        server = Server(url=server_base_url, user=username, password=password)
        server_title = server.title
        logger.info(f"Connected to TAXII server: {server_title}")
    except Exception as e:
        logger.exception(f"Connection to {server_base_url} failed: {e}")
        raise RestError(message=f"Connection to {server_base_url} failed: {e}", status=400)


class CustomConnectionValidator(AdminExternalHandler):
    def __init__(self, *args, **kwargs):
        AdminExternalHandler.__init__(self, *args, **kwargs)

    def handleList(self, confInfo):
        AdminExternalHandler.handleList(self, confInfo)

    def handleEdit(self, confInfo):
        _validate_connection(server_base_url=self.payload.get("server_base_url"), username=self.payload.get("username"),
                             password=self.payload.get("password"))
        AdminExternalHandler.handleEdit(self, confInfo)

    def handleCreate(self, confInfo):
        _validate_connection(server_base_url=self.payload.get("server_base_url"), username=self.payload.get("username"),
                             password=self.payload.get("password"))
        AdminExternalHandler.handleCreate(self, confInfo)

    def handleRemove(self, confInfo):
        AdminExternalHandler.handleRemove(self, confInfo)
