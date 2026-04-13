#!/bin/bash

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo ".env was copied from example"
fi
