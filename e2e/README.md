# End-to-end tests

They click through the real frontend against a real API.

```bash
# prokolpo-backend: database, migrations and the API on :5000
docker compose up -d db && go run ./cmd/migrate up && go run ./cmd/api
# prokolpo: the app on :3200
pnpm dev --port 3200
pnpm test:e2e
```

Each run registers new accounts with random phone numbers, so tests do not depend on each other or on old data.
