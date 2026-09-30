FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY public ./public

RUN addgroup -S app && adduser -S app -G app
RUN chown -R app:app /app
USER app

ENV NODE_ENV=production
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8080/api/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/index.js"]
