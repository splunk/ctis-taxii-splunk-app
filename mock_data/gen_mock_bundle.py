from typing import List
import argparse
import stix2
import random

ANIMALS = '''
dog
cat
horse
cow
lion
tiger
elephant
bear
wolf
fox
rabbit
deer
monkey
gorilla
chimpanzee
giraffe
zebra
hippopotamus
rhinoceros
kangaroo
koala
panda
polar bear
penguin
dolphin
whale
shark
octopus
crocodile
alligator
snake
turtle
frog
eagle
owl
parrot
duck
chicken
pig
goat
sheep
camel
donkey
mouse
rat
squirrel
bee
butterfly
spider
fish
'''.strip().split()

COLORS = '''
red
blue
green
yellow
orange
purple
pink
black
white
gray
brown
cyan
magenta
teal
navy
gold
silver
maroon
lime
violet
'''.strip().split()

TLDS = ['com', 'io', 'org', 'edu']


def generate_url(labels: List[str]) -> str:
    return f"https://{'.'.join(labels)}"


IDENTITY_ID_1 = 'identity--9325530c-b4a5-4078-8a4e-67b0f097e765'
STATIC_IDENTITY = stix2.Identity(
    id=IDENTITY_ID_1,
    name='Mock Identity 1',
    identity_class='individual'
)


def generate_indicator():
    a_color = random.choice(COLORS)
    an_animal = random.choice(ANIMALS)
    tld = random.choice(TLDS)
    url = generate_url([a_color, an_animal, tld])
    pattern = f"[url:value = '{url}']"
    name = f"{a_color} {an_animal} {tld}"
    confidence = random.randint(1, 100)
    indicator = stix2.Indicator(pattern=pattern,
                                pattern_type='stix',
                                name=name,
                                created_by_ref=IDENTITY_ID_1,
                                labels=["mock-data"],
                                confidence=confidence)
    return indicator


def generate_identity():
    animal = random.choice(ANIMALS)
    color = random.choice(COLORS)
    return stix2.Identity(
        name=f'{color} {animal} Company'.title(),
        identity_class='organization'
    )


def generate_bundle_of_indicators(num: int = 10):
    indicators = []
    for _ in range(num):
        indicators.append(generate_indicator())
    return stix2.Bundle(objects=indicators)


def generate_bundle_of_identities(num: int = 10, include_static_identity: bool = True):
    identities = []
    num_to_generate = num - (1 if include_static_identity else 0)
    for _ in range(num_to_generate):
        identity = generate_identity()
        identities.append(identity)
    if include_static_identity:
        identities.append(STATIC_IDENTITY)
    return stix2.Bundle(objects=identities)


parser = argparse.ArgumentParser()
parser.add_argument('--model', choices=['indicator', 'identity'], default='indicator')
parser.add_argument('--num-objects', '-n', type=int, default=10)

if __name__ == '__main__':
    args = parser.parse_args()
    if args.model == 'indicator':
        bundle = generate_bundle_of_indicators(num=args.num_objects)
        print(bundle.serialize(pretty=True))
    elif args.model == 'identity':
        bundle = generate_bundle_of_identities(num=args.num_objects)
        print(bundle.serialize(pretty=True))
    else:
        raise NotImplementedError
