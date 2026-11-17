FROM node:24-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build
ENV NODE_ENV=production
RUN mkdir -p /app/storage && chown -R node:node /app/storage /app/.next
USER node
EXPOSE 3000
CMD ["npm", "start"]
