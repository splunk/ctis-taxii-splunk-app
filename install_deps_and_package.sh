#!/usr/bin/env bash
set -e
working_dir=$(pwd)
pip install splunk-add-on-ucc-framework

pip freeze # for debugging purposes

# Build the component library
cd packages/my-react-component && npm install

cd "$working_dir"
yarn setup

cd integration_test && ./package.sh

