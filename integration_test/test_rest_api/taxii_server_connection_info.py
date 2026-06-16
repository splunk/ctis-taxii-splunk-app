from dataclasses import dataclass

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
