import argparse

from conftest import new_session
from util import create_new_identity, clear_identities_collection

SAMPLE_IDENTITIES = [
    {"name": "org1", "identity_class": "organization"},
    {"name": "org2", "identity_class": "organization"},
    {"name": "user1", "identity_class": "individual"},
]
def create_identities(session, n=5):
    for i in range(n):
        name = f"org{i+1}"
        identity_class = "organization"
        create_new_identity(session, {"name": name, "identity_class": identity_class,
                                      "confidence": 100, "tlp_v2_rating": "TLP:GREEN"})

def confirmation_prompt():
    _ = input("Press enter to continue or control+c to cancel...")

parser = argparse.ArgumentParser(
                    prog='CLI Manual Testing',
                    description='Utilities to help generate test data for Splunk CTIS TAXII app')
parser.add_argument('operation', choices=['create-identities', 'delete-identities'])
parser.add_argument('--n', type=int, default=5,
                    help='Number of entities to create')

if __name__ == '__main__':
    args = parser.parse_args()
    print(vars(args))
    session = new_session()
    if args.operation == 'create-identities':
        create_identities(session, n=args.n)
    elif args.operation == 'delete-identities':
        print("This will delete all identities in the collection.")
        confirmation_prompt()
        clear_identities_collection(session)

