# G490 Cloudflare Tunnel Deployment

Target domain:

```text
code.ebu.de5.net
```

Runtime layout:

```text
Cloudflare Tunnel
  -> Docker network: codequestplanet_default
  -> http://codequestplanet-caddy-1:80
  -> Caddy container
      /      static frontend
      /api/* Node API
  -> PostgreSQL container
```

The app should live on G490 at:

```text
/home/jack/services/codequestplanet
```

The Compose stack binds Caddy only to:

```text
127.0.0.1:8088
```

That keeps the site private to the host and lets Cloudflare Tunnel provide the public HTTPS endpoint.

The `openwebui-cloudflared` container must also be attached to the external Docker network:

```text
codequestplanet_default
```

## Current G490 setup

The deployed stack is under:

```text
/home/jack/services/codequestplanet
```

Services:

```text
codequestplanet-caddy-1  127.0.0.1:8088 -> 80
codequestplanet-api-1    internal port 3001
codequestplanet-db-1     PostgreSQL, internal port 5432
```

The existing `openwebui-cloudflared` tunnel config should have this ingress entry:

```yaml
- hostname: code.ebu.de5.net
  service: http://codequestplanet-caddy-1:80
```

## Cloudflare DNS

`code.ebu.de5.net` is routed to the existing tunnel:

```text
Type: CNAME
Name: code
Target: 735ef54c-31bd-4212-ab0d-b2770f9c2cb6.cfargotunnel.com
Proxy: enabled
```

The `ebu.de5.net` zone is hosted separately in Cloudflare. Create or update the DNS record in that zone, not through a `kir.us.ci` scoped `cloudflared tunnel route dns` certificate:

```sh
node /Users/jack/Documents/Codex/TmpMail/cf-api.mjs dns upsert \
  --zone ebu.de5.net \
  --name code.ebu.de5.net \
  --type CNAME \
  --content 735ef54c-31bd-4212-ab0d-b2770f9c2cb6.cfargotunnel.com \
  --proxied true
```

Verify:

```sh
curl -i https://code.ebu.de5.net/api/health
curl -I https://code.ebu.de5.net/
```

If Cloudflare returns `530`, check that the G490 `openwebui-cloudflared` container is online and connected to the tunnel. The DNS record alone is not enough; the tunnel must have an active connection from G490.

## Account, progress, and admin

Frontend:

```text
https://code.ebu.de5.net/
```

Admin:

```text
https://code.ebu.de5.net/admin.html
```

The admin interface follows a shadcn-admin style information architecture: sidebar navigation, compact stat cards, user tables, learning progress records, audit logs, and reserved course/order workspaces.

Environment variables:

```text
OWNER_EMAILS=
OWNER_SETUP_TOKEN=
```

`OWNER_EMAILS` is a comma-separated allowlist. Matching users are promoted to `owner` when they register or log in.

`OWNER_SETUP_TOKEN` enables the one-time owner bootstrap form on the admin page. The bootstrap API refuses to create another owner after one owner account exists.

Learning progress is stored in PostgreSQL through:

```text
GET /api/progress
POST /api/progress
DELETE /api/progress
```

The browser still keeps a local copy as a fallback and merges it with cloud progress after login.

Admin APIs:

```text
GET /api/admin/summary
GET /api/admin/users
GET /api/admin/progress
GET /api/admin/events
PATCH /api/admin/users/:id/role
POST /api/admin/bootstrap
```
