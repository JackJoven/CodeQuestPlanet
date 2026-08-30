FROM node:22-alpine AS site-builder

WORKDIR /src
COPY . .
RUN npm run build

FROM caddy:2-alpine

COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=site-builder /src/dist/client /srv/codequestplanet
