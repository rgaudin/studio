#!/bin/bash

python contentcuration/manage.py setup

echo "now starting CMD"
exec "$@"
