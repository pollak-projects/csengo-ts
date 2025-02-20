FROM node:23-alpine AS builder

WORKDIR /usr/src/app
ENV PATH=/usr/src/node_modules/.bin:$PATH

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_COOKIE_DOMAIN
ENV VITE_COOKIE_DOMAIN=$VITE_COOKIE_DOMAIN

ARG VITE_TEST
ENV VITE_TEST=$VITE_TEST

COPY ./package*.json ./

RUN npm install --ignore-scripts

COPY ./ ./

RUN npm run build-only

FROM nginx:1.27.3 AS prod

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

COPY ./config/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]