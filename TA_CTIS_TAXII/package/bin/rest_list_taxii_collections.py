import os
import sys


sys.stderr.write(f"original sys.path: {sys.path}\n")
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "lib")))
sys.stderr.write(f"updated sys.path: {sys.path}\n")

try:
    from common import get_logger_for_script, AbstractRestHandler, NAMESPACE
    from solnlib._utils import get_collection_data
    from solnlib import conf_manager, log
    import remote_pdb
    from const import ADDON_NAME, ADDON_NAME_LOWER
    from taxii2client.v21 import ApiRoot
except ImportError as e:
    sys.stderr.write(f"ImportError: {e}\n")
    raise e

logger = get_logger_for_script(__file__)

def get_config(session_key: str, stanza_name: str):
    conf_name = f"{ADDON_NAME_LOWER}_taxii_config"
    cfm = conf_manager.ConfManager(
        session_key,
        ADDON_NAME,
        realm=f"__REST_CREDENTIAL__#{ADDON_NAME}#configs/conf-{conf_name}",
    )
    taxii_config_conf = cfm.get_conf(conf_name)
    return taxii_config_conf.get(stanza_name)

class ListTaxiiCollectionsHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        if "config_name" not in query_params:
            raise ValueError("config_name is a required query parameter")
        config_name = query_params.get("config_name")[0]
        self.logger.info(f"config_name: {config_name}")
        config = get_config(session_key=session_key, stanza_name=config_name)
        api_root = ApiRoot(url=config["api_root_url"], user=config["username"], password=config["password"])
        collections = api_root.collections
        return {"collections" : [x._raw for x in collections]}


Handler = ListTaxiiCollectionsHandler(logger=logger).generate_splunk_server_class()
