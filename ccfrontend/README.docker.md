Docker usage for frontend

Build image locally:

```bash
docker build -t cuentas-claras-frontend:latest --build-arg VITE_API_URL=http://host.docker.internal:3000 .
```

Run with docker-compose (map to port 5173):

```bash
VITE_API_URL=http://host.docker.internal:3000 docker-compose up --build
```

Notes:
- Vite exposes env variables only when they start with `VITE_`. We pass `VITE_API_URL` at build time so the built app points to your backend.
- If your backend runs in another container in compose, change `VITE_API_URL` to the backend service name (e.g. `http://backend:3000`).
- The image uses nginx to serve the built `dist/` folder.
