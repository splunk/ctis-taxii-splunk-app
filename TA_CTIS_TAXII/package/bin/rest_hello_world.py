import sys
from splunk.persistconn.application import PersistentServerConnectionApplication

def log(string):
    sys.stderr.write(string + '\n')


class HelloWorld(PersistentServerConnectionApplication):
    def __init__(self, _command_line, _command_arg):
        super(PersistentServerConnectionApplication, self).__init__()
        log(f"HelloWorld.__init__ called with command_line: {_command_line} and command_arg: {_command_arg}")

    # Handle a synchronous request from splunkd.
    def handle(self, in_string):
        """
        Called for a simple synchronous request.
        @param in_string: request data passed in
        @rtype: string or dict
        @return: String to return in response.  If a dict was passed in,
                 it will automatically be JSON encoded before being returned.
        """
        payload = {
            "text": "Hello world!"
        }
        return {'payload': payload, 'status': 200}

    def handleStream(self, handle, in_string):
        """
        For future use
        """
        raise NotImplementedError(
            "PersistentServerConnectionApplication.handleStream")

    def done(self):
        """
        Virtual method which can be optionally overridden to receive a
        callback after the request completes.
        """
        pass
