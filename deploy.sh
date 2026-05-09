#!/bin/bash
# Deploy to Fly.io

set -e

echo "🚀 Deploying Geolocation Broadcast System to Fly.io"
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl is not installed. Please install it from: https://fly.io/docs/getting-started/installing-flyctl"
    exit 1
fi

# Check if user is logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "📝 Please login to Fly.io"
    flyctl auth login
fi

# Check if app exists
APP_NAME=${1:-findme}
if ! flyctl apps list | grep -q "^$APP_NAME"; then
    echo "🆕 Creating new app: $APP_NAME"
    flyctl app create "$APP_NAME" || true
fi

echo "📦 Deploying app: $APP_NAME"
flyctl deploy --app "$APP_NAME"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Useful commands:"
echo "   View logs:     flyctl logs --app $APP_NAME"
echo "   Check status:  flyctl status --app $APP_NAME"
echo "   Open app:      flyctl open --app $APP_NAME"
echo "   Scale:         flyctl scale count 3 --app $APP_NAME"
