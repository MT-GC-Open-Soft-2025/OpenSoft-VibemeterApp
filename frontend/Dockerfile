# Stage 1: Build with Bun
FROM oven/bun:1-alpine AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source and build
COPY . .

# Build-time API base URL (optional). Vite only exposes VITE_* vars.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN bun run build

# Stage 2: Serve with nginx
FROM nginx:alpine AS runtime

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy Vite build output (dist/, not build/)
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
