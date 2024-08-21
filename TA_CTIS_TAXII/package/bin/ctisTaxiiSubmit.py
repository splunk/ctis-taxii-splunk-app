import sys
import json


# TODO: use ModularAction?
#  https://github.com/splunk/addonfactory-ucc-library/blob/main/splunktaucclib/cim_actions.py

def log(msg, *args):
    sys.stderr.write(msg + " ".join([str(a) for a in args]) + "\n")


if __name__ == '__main__':
    log("INFO Running python %s" % (sys.version_info[0]))
    if len(sys.argv) > 1 and sys.argv[1] == "--execute":
        payload = json.loads(sys.stdin.read())
        params = payload["configuration"]
        log(f"INFO payload: {payload}")
        log(f"INFO params: {params}")
        sys.exit(0)
    else:
        log("Unsupported execution mode (expected --execute flag)")
        sys.exit(1)
