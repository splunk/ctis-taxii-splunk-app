class ServerException(Exception):
    def __init__(self, message:str, errors: list):
        self.errors = errors
        super().__init__(message)
