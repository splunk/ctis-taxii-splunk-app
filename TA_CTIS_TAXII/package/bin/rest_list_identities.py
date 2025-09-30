from common import AbstractRestHandler
from models import CollectionName

class ListIdentitiesHandler(AbstractRestHandler):
    def handle(self, input_json: dict, query_params: dict, session_key: str) -> dict:
        return self.handle_query_collection(input_json=input_json, query_params=query_params, session_key=session_key, collection_name=CollectionName.IDENTITIES)


