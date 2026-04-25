#!/bin/bash
# Add ramazan15 route to existing Cloudflare Tunnel
# Run: ssh hayati "bash -s" < scripts/setup-cloudflare.sh

set -euo pipefail

CONFIG="/etc/cloudflared/config.yml"

echo "=== Cloudflare Tunnel Route Setup ==="

# Check if route already exists
if sudo grep -q "15temmuz.fennaver.tech" "$CONFIG" 2>/dev/null; then
  echo "Route already exists in $CONFIG"
  exit 0
fi

# Backup current config
sudo cp "$CONFIG" "${CONFIG}.bak.$(date +%s)"

# Add the new route before the catch-all (last entry)
# Insert before the last line if it's a catch-all, or append to ingress
sudo python3 -c "
import yaml, sys

with open('$CONFIG') as f:
    config = yaml.safe_load(f)

ingress = config.get('ingress', [])

# New route entry
new_route = {
    'hostname': '15temmuz.fennaver.tech',
    'service': 'http://localhost:3010'
}

# Insert before the catch-all (last entry which is usually service: http_status:404)
if ingress and 'hostname' not in ingress[-1]:
    ingress.insert(-1, new_route)
else:
    ingress.append(new_route)

config['ingress'] = ingress

with open('$CONFIG', 'w') as f:
    yaml.dump(config, f, default_flow_style=False)
"

echo "Route added to $CONFIG"
echo ""
echo "Restarting cloudflared..."
sudo systemctl restart cloudflared

echo ""
echo "=== Done ==="
echo "Now add CNAME in Cloudflare DNS:"
echo "  15temmuz.fennaver.tech -> 17b57d44-26d6-4d67-b4c7-7f46a4220ebe.cfargotunnel.com"
