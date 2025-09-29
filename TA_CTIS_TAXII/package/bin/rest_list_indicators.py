from common import AbstractRestHandler, get_logger_for_script
from models import CollectionName

logger = get_logger_for_script(__file__)


class ListIndicatorsHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        return self.handle_query_collection(input_json=input_json, query_params=query_params, session_key=session_key,
                                            collection_name=CollectionName.INDICATORS)
