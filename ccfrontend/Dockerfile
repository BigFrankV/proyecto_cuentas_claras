### Multi-stage Dockerfile for Vite React app
FROM node:18-alpine AS build
WORKDIR /app

# install deps
COPY package.json package-lock.json ./
RUN npm ci

# copy sources
COPY . .

# allow passing API url at build time (VITE_ prefix required by Vite)
ARG VITE_API_URL=http://host.docker.internal:3000
ENV VITE_API_URL=${VITE_API_URL}

# build
RUN npm run build

### Production stage: nginx serving static files
FROM nginx:stable-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html

# custom nginx config (if present)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
