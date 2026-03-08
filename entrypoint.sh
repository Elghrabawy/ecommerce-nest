#!/bin/sh
set -e

echo "Running database migrations..."
node ./node_modules/typeorm/cli.js migration:run -d ./dist/database/data-source.js

echo "Running database seeds..."
node ./node_modules/typeorm-extension/bin/cli.cjs seed:run -d ./dist/database/data-source.js

echo "Starting application..."
exec node dist/main
