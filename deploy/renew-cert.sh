#!/usr/bin/env bash
# Renew the Let's Encrypt certificate.
#
# The TLS-ALPN-01 challenge answers on 443, which our own proxy holds, so the
# proxy steps aside for the ~20 seconds acme.sh needs and comes straight back.
# acme.sh decides whether a renewal is actually due, so running this weekly is
# cheap and a no-op most of the time.
set -euo pipefail
cd "$(dirname "$0")"

DC="docker compose -f docker-compose.prod.yml --env-file .env.prod"
CERTDIR=acme/147-224-178-246.nip.io_ecc

log() { echo "[$(date -u +%FT%TZ)] $*"; }

restore_proxy() { $DC up -d proxy >/dev/null 2>&1 || true; }
trap restore_proxy EXIT   # never leave the site down because renewal failed

log "stopping proxy to free :443"
$DC stop proxy >/dev/null 2>&1

log "running acme.sh"
if docker run --rm -p 443:443 -v "$PWD/acme:/acme.sh" \
      neilpang/acme.sh --cron --home /acme.sh; then
  log "acme.sh finished"
else
  log "acme.sh reported nothing to do or failed; leaving existing cert in place"
fi

if [ -f "$CERTDIR/fullchain.cer" ]; then
  # Only reinstall when the issued cert is actually newer than the one nginx has.
  if [ "$CERTDIR/fullchain.cer" -nt nginx/certs/server.crt ]; then
    cp "$CERTDIR/fullchain.cer" nginx/certs/server.crt
    cp "$CERTDIR/147-224-178-246.nip.io.key" nginx/certs/server.key
    chmod 644 nginx/certs/server.crt; chmod 600 nginx/certs/server.key
    log "installed refreshed certificate"
  else
    log "certificate unchanged"
  fi
fi

log "starting proxy"
restore_proxy
trap - EXIT
log "done; expiry now $(openssl x509 -in nginx/certs/server.crt -noout -enddate)"
