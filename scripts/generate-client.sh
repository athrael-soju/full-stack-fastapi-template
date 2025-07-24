#! /usr/bin/env bash
set -e
set -x
cd backend
python -c "import app.main; import json; print(json.dumps(app.main.app.openapi()))" > ../openapi.json

mv openapi.json ../frontend/

cd frontend
npm run generate-client
npx biome format --write ./src/client

cd ..