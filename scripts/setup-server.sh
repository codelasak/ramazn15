#!/bin/bash
# One-time setup script for Hayati server
# Run: ssh hayati "bash -s" < scripts/setup-server.sh

set -euo pipefail

APP_DIR="$HOME/apps/ramazan15"
REPO="https://github.com/codelasak/ramazn15.git"
PORT=3010

echo "=== Ramazan15 Server Setup ==="

# 1. Clone repo
if [ -d "$APP_DIR" ]; then
  echo "App directory exists, pulling latest..."
  cd "$APP_DIR"
  git pull origin main
else
  echo "Cloning repo..."
  mkdir -p "$HOME/apps"
  git clone "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# 2. Install Node.js if not available
if ! command -v node &>/dev/null; then
  echo "Installing Node.js 22 LTS..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

echo "Node: $(node --version)"
echo "npm: $(npm --version)"

# 3. Create .env if not exists
if [ ! -f "$APP_DIR/.env" ]; then
  cat > "$APP_DIR/.env" << 'ENVEOF'
DATABASE_URL=postgresql://neondb_owner:npg_l0NmknM9hqLu@ep-dawn-resonance-ad2cr8dk-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
NEXTAUTH_SECRET=15temmuz-aihl-prod-secret-2026
NEXTAUTH_URL=https://15temmuz.fennaver.tech
NODE_ENV=production
ENVEOF
  echo ".env created"
else
  echo ".env already exists, skipping"
fi

# 4. Install deps & build
echo "Installing dependencies..."
npm install

echo "Building..."
npm run build

# Copy static assets to standalone
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public 2>/dev/null || true

# 5. Create systemd service
sudo tee /etc/systemd/system/ramazan15.service > /dev/null << EOF
[Unit]
Description=Ramazan15 Next.js App
After=network.target

[Service]
Type=simple
User=hayati
WorkingDirectory=$APP_DIR
EnvironmentFile=$APP_DIR/.env
ExecStart=/usr/bin/node $APP_DIR/.next/standalone/server.js
Restart=always
RestartSec=5
Environment=PORT=$PORT
Environment=HOSTNAME=0.0.0.0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ramazan15
sudo systemctl restart ramazan15

echo ""
echo "=== Setup Complete ==="
echo "App running on port $PORT"
echo "Check: sudo systemctl status ramazan15"
echo ""
echo "Next steps:"
echo "1. Add route to /etc/cloudflared/config.yml"
echo "2. Add CNAME DNS record for 15temmuz.fennaver.tech"
