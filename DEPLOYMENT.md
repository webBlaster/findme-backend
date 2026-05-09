# Deployment Guide - fly.io

This guide explains how to deploy the Geolocation Broadcast System to fly.io.

## Prerequisites

1. **Fly.io Account**: Sign up at [fly.io](https://fly.io)
2. **Fly CLI**: Install from [fly.io/docs/getting-started/installing-flyctl](https://fly.io/docs/getting-started/installing-flyctl)
3. **Docker** (optional): For local testing

## Files Added for Deployment

- **Dockerfile**: Multi-stage build optimized for Deno
- **fly.toml**: Fly.io configuration with health checks and services setup
- **.dockerignore**: Excludes unnecessary files from Docker build

## Deployment Steps

### 1. Login to Fly.io

```bash
flyctl auth login
```

### 2. Create App on Fly.io

If you haven't created the app yet:

```bash
flyctl app create findme
```

If you already have `fly.toml` configured:

```bash
flyctl launch
```

### 3. Deploy to Fly.io

```bash
flyctl deploy
```

### 4. Monitor Deployment

```bash
flyctl logs
flyctl status
```

## Configuration Details

### Environment Variables

- **PORT**: Automatically set to `8080` in fly.toml
- The app reads PORT from environment variables

### Health Checks

- Endpoint: `GET /health`
- Interval: 30 seconds
- Response: `{ "status": "ok", "timestamp": "..." }`

### Services

- **HTTP**: Ports 80 and 443 (auto HTTPS)
- **WebSocket**: Works over both HTTP and HTTPS upgrades
- **Auto-scaling**: Configured with auto_stop_machines and min_machines_running

## Key Features in Production

✅ **WebSocket Support**: Works on fly.io with proper protocol handling
✅ **Dynamic URLs**: The app now generates proper WebSocket URLs based on request host
✅ **Health Checks**: Fly.io can verify app is running correctly
✅ **Multi-region Support**: Can scale to multiple regions (edit fly.toml)
✅ **Auto-restart**: Failed instances automatically restart

## Testing Locally with Docker

```bash
# Build locally
docker build -t findme:latest .

# Run locally
docker run -p 8080:8080 -e PORT=8080 findme:latest

# Test the app
curl http://localhost:8080/health
```

## Scale Your App

To increase machine count:

```bash
flyctl scale count 3
```

To change region:

```bash
flyctl regions set [region-code]
```

View available regions:

```bash
flyctl platform regions
```

## Custom Domain

To use a custom domain:

```bash
flyctl certs create yourdomain.com
# Then add DNS records as instructed
```

## Monitoring

View real-time logs:

```bash
flyctl logs --follow
```

Check app status:

```bash
flyctl status
```

View metrics:

```bash
flyctl metrics
```

## Troubleshooting

**App won't start?**

- Check logs: `flyctl logs`
- Verify PORT is set to 8080: `flyctl config`

**WebSocket connections failing?**

- Ensure protocol is `ws://` or `wss://` (not http)
- Check that the Host header matches your fly.io domain

**High memory usage?**

- Adjust machine size: `flyctl scale vm [size]`
- Check available sizes: `flyctl platform vm-sizes`

## CI/CD Deployment

For automatic deployments on git push, see [fly.io CI/CD docs](https://fly.io/docs/app-guides/continuous-deployment-with-github-actions/).
