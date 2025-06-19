#!/usr/bin/env bash

pip install splunk-add-on-ucc-framework

pip freeze # for debugging purposes

# Build the component library
cd packages/my-react-component
npm install && yarn setup

cd integration_test && ./package.sh

