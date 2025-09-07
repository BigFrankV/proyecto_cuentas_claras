FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (use package-lock.json when available)
COPY package*.json ./
# Install production deps and skip lifecycle scripts (avoid running husky prepare in the container)
# --omit=dev removes devDependencies, --ignore-scripts prevents running prepare/hooks
RUN npm ci --omit=dev --ignore-scripts

# Copy source
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
