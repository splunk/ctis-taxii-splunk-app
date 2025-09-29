from common import AbstractRestHandler, get_logger_for_script

logger = get_logger_for_script(__file__)


class ListTaxiiCollectionsHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        if "config_name" not in query_params:
            raise ValueError("config_name is a required query parameter")
        config_name = query_params.get("config_name")[0]
        self.logger.info(f"config_name: {config_name}")
        config = self.get_taxii_config(session_key=session_key, stanza_name=config_name)
        api_root = self.get_api_root(url=config["api_root_url"], user=config["username"], password=config["password"])
        collections = api_root.collections
        return {"collections": [x._raw for x in collections]}
