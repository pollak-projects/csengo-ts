FROM node:22-alpine AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine

RUN apk add --no-cache openssl

# Set the OpenSSL environment variable
ENV OPENSSL_DIR=/usr/lib/ssl

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/template ./template

RUN echo "http://dl-cdn.alpinelinux.org/alpine/edge/community" >> /etc/apk/repositories && \
    apk add --no-cache ffmpeg yt-dlp

EXPOSE 3300
CMD [ "npm", "run", "start:migrate:prod" ]
