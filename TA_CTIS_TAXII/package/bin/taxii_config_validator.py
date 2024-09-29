from splunktaucclib.rest_handler.admin_external import AdminExternalHandler
from splunktaucclib.rest_handler.error import RestError

from solnlib import conf_manager, log
import logging
from const import ADDON_NAME_LOWER

logger = log.Logs().get_logger(f"{ADDON_NAME_LOWER}.{__name__}")
logger.setLevel(logging.INFO)


# https://github.com/oasis-open/cti-taxii-client/tree/master
def _validate_connection(api_root_url: str, username, password):
    logger.info(f"Validating connection to {api_root_url} with username={username}")
    try:
        from taxii2client.v21 import ApiRoot
        api_root = ApiRoot(url=api_root_url, user=username, password=password)
        collections = api_root.collections
        logger.info(f"Connection to TAXII server ({api_root_url}) successful. Collections: {collections}")
    except Exception as e:
        logger.exception(f"Connection to {api_root_url} failed: {e}")
        raise RestError(message=f"Connection to {api_root_url} failed: {e}", status=400)


API_ROOT_URL = "api_root_url"

class CustomConnectionValidator(AdminExternalHandler):
    def __init__(self, *args, **kwargs):
        AdminExternalHandler.__init__(self, *args, **kwargs)

    def handleList(self, confInfo):
        AdminExternalHandler.handleList(self, confInfo)

    def handleEdit(self, confInfo):
        _validate_connection(api_root_url=self.payload.get(API_ROOT_URL), username=self.payload.get("username"),
                             password=self.payload.get("password"))
        AdminExternalHandler.handleEdit(self, confInfo)

    def handleCreate(self, confInfo):
        _validate_connection(api_root_url=self.payload.get(API_ROOT_URL), username=self.payload.get("username"),
                             password=self.payload.get("password"))
        AdminExternalHandler.handleCreate(self, confInfo)

    def handleRemove(self, confInfo):
        AdminExternalHandler.handleRemove(self, confInfo)
