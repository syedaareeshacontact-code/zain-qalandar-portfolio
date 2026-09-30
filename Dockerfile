# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY package.json ./
RUN npm install

# ---- builder ----
FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build


# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app

# copy only what Next needs at runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules



EXPOSE 8080
CMD ["npm", "start", "--", "-p", "8080"]
