# Stage 1: Build
FROM node:23-alpine AS builder
WORKDIR /app

# Install dependencies via Yarn lockfile
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy configs and source
COPY tsconfig*.json ./
COPY prisma ./prisma
COPY src ./src

# Build and generate Prisma Client
RUN yarn build
RUN npx prisma generate

# Stage 2: Runtime
FROM node:23-alpine
WORKDIR /app

# Copy package metadata (для npx, если понадобится)
COPY package.json yarn.lock ./

# Copy built artifacts and modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma       ./prisma
COPY --from=builder /app/dist          ./dist

ENV NODE_ENV=production

# Apply migrations, seed, then start compiled app
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main.js"]
