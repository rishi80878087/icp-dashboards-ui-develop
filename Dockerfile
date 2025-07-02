# -------- Stage 1: Build Stage --------
FROM node:18.18.1-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock .npmrc ./
RUN yarn install --frozen-lockfile

# Copy the app source and build it
COPY . .
RUN yarn build

# Clean cache during build (when still root)
RUN rm -rf .next/cache


# -------- Stage 2: Production Stage --------
FROM node:18.18.1-alpine AS runner

WORKDIR /app

# Create a non-root user
RUN addgroup -S appgroup && \
    adduser -S appuser -G appgroup && \
    mkdir /app/.next && \
    chown -R appuser:appgroup /app

COPY --from=builder /app .

# Use non-root user
USER appuser

EXPOSE 3000
CMD ["yarn", "start"]