FROM node:20-alpine

WORKDIR /app

# Cài curl chỉ để healthcheck
RUN apk add --no-cache curl

# Copy package trước để tối ưu layer cache
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s \
  CMD curl -f http://localhost:3000/health || exit 1

# Không dùng USER node (vì curl sẽ lỗi)
# USER node

CMD ["node", "index.js"]
