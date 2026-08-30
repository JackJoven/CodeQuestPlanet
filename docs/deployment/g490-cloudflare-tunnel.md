# G490 Cloudflare Tunnel Deployment

Target domain:

```text
ebu.de5.net
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

The service root on G490 is:

```text
/home/jack/services/codequestplanet
```

The live application is a Git working tree at:

```text
/home/jack/services/codequestplanet/app
```

The production environment file remains outside Git and is linked into the
working tree:

```text
/home/jack/services/codequestplanet/.env
/home/jack/services/codequestplanet/app/.env -> ../.env
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

The deployed Git working tree is under:

```text
/home/jack/services/codequestplanet/app
```

Deploy the latest `main` branch with:

```sh
cd /home/jack/services/codequestplanet/app
git fetch --tags --prune
git checkout main
git pull --ff-only origin main
docker compose up -d --build
```

Deploy or roll back to an exact release with:

```sh
cd /home/jack/services/codequestplanet/app
git fetch --tags --prune
git checkout --detach <tag-or-commit>
docker compose up -d --build
```

The Compose project name is fixed as `codequestplanet`, so switching the Git
revision does not replace the existing PostgreSQL, Caddy, or configuration
volumes. Do not edit tracked files directly on G490; make changes locally,
commit and push them, then update this working tree.

Services:

```text
codequestplanet-caddy-1  127.0.0.1:8088 -> 80
codequestplanet-api-1    internal port 3001
codequestplanet-db-1     PostgreSQL, internal port 5432
```

The existing `openwebui-cloudflared` tunnel config should have this ingress entry:

```yaml
- hostname: ebu.de5.net
  service: http://codequestplanet-caddy-1:80
```

## Cloudflare DNS

`ebu.de5.net` is routed to the existing tunnel. The former
`code.ebu.de5.net` record and ingress route are disabled:

```text
Type: CNAME
Name: @
Target: 735ef54c-31bd-4212-ab0d-b2770f9c2cb6.cfargotunnel.com
Proxy: enabled
```

The `ebu.de5.net` zone is hosted separately in Cloudflare. Create or update the DNS record in that zone, not through a `kir.us.ci` scoped `cloudflared tunnel route dns` certificate:

```sh
node /Users/jack/Documents/Codex/TmpMail/cf-api.mjs dns upsert \
  --zone ebu.de5.net \
  --name ebu.de5.net \
  --type CNAME \
  --content 735ef54c-31bd-4212-ab0d-b2770f9c2cb6.cfargotunnel.com \
  --proxied true
```

Verify:

```sh
curl -i https://ebu.de5.net/api/health
curl -I https://ebu.de5.net/
```

If Cloudflare returns `530`, check that the G490 `openwebui-cloudflared` container is online and connected to the tunnel. The DNS record alone is not enough; the tunnel must have an active connection from G490.

## Account, progress, and admin

Frontend:

```text
https://ebu.de5.net/
```

Admin:

```text
https://ebu.de5.net/admin.html
```

The admin interface follows a shadcn-admin style information architecture: sidebar navigation, compact stat cards, user tables, learning progress records, audit logs, and reserved course/order workspaces.

Environment variables:

```text
OWNER_EMAILS=
OWNER_SETUP_TOKEN=
PASSWORD_RECOVERY_TOKEN=
```

`OWNER_EMAILS` is a comma-separated allowlist. Matching users are promoted to `owner` when they register or log in.

`OWNER_SETUP_TOKEN` enables the one-time owner bootstrap form on the admin page. The bootstrap API refuses to create another owner after one owner account exists.

`PASSWORD_RECOVERY_TOKEN` enables the administrator password recovery form. If it is empty, the backend falls back to `OWNER_SETUP_TOKEN` for existing deployments. A successful recovery replaces the password hash and revokes every existing session for that administrator account.

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
