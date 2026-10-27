# Multi-stage Dockerfile for FairShift - UN SDG 8 Decent Work Platform
# Stage 1: Build the React + Vite frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json package-lock.json* ./

# Install all dependencies for build
RUN npm ci || npm install

# Copy application sources
COPY . .

# Build production assets
RUN npm run build

# Stage 2: Minimal runtime image for Google Cloud Run
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prod-server.js ./prod-server.js

# Expose target port (defaults to 8080 for Cloud Run)
EXPOSE 8080

# Run production server
CMD ["node", "prod-server.js"]
