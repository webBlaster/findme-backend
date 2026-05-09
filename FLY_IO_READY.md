# Fly.io Deployment Checklist & Summary

## ✅ What Has Been Prepared

Your Geolocation Broadcast System is now ready for fly.io deployment. Here's what was added:

### Deployment Files

- ✅ **Dockerfile** - Multi-stage Docker build optimized for Deno
- ✅ **fly.toml** - Complete Fly.io configuration with health checks
- ✅ **.dockerignore** - Optimized build context
- ✅ **deploy.sh** - Quick deployment script
- ✅ **DEPLOYMENT.md** - Comprehensive deployment guide
- ✅ **.env.md** - Environment variable documentation

### Code Updates

- ✅ **src/handlers.ts** - Fixed dynamic WebSocket URL generation for remote deployments
- ✅ **examples/client-remote.ts** - Added example for connecting to remote servers

## 📋 Pre-Deployment Checklist

- [ ] Install Fly.io CLI: `brew install flyctl` (macOS) or see https://fly.io/docs/getting-started/installing-flyctl
- [ ] Create a Fly.io account at https://fly.io
- [ ] Login to Fly.io: `flyctl auth login`
- [ ] Review your app name in `fly.toml` (currently: `app = "findme"`)
- [ ] Update `primary_region` in `fly.toml` if desired (currently: `sjc` - San Jose)

## 🚀 Deployment Steps

### Option 1: Quick Deployment Script

```bash
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# Create app if first time
flyctl launch

# Deploy
flyctl deploy

# Monitor
flyctl logs --follow
```

## 🧪 Testing Before Deployment

### Test Locally with Docker

```bash
# Build image
docker build -t findme:latest .

# Run container
docker run -p 8080:8080 -e PORT=8080 findme:latest

# Test in another terminal
curl http://localhost:8080/health
```

### Test the API

```bash
# Health check
curl https://yourapp.fly.dev/health

# Create a room
curl -X POST https://yourapp.fly.dev/api/rooms

# Use the returned wsUrl to connect
```

## 📊 Key Production Features Enabled

✅ **Auto-scaling** - Machines start/stop automatically based on load
✅ **Health Checks** - Fly.io monitors `/health` endpoint every 30 seconds
✅ **HTTPS** - Automatic SSL certificates for your domain
✅ **WebSocket Support** - Full WebSocket support over WSS (secure)
✅ **Graceful Restarts** - Failed instances automatically restart
✅ **Region Selection** - Can be deployed to multiple regions globally

## 🔧 Common Post-Deployment Commands

```bash
# View logs in real-time
flyctl logs --follow

# Check app status
flyctl status

# Get app URL
flyctl open

# Scale up/down
flyctl scale count 3

# Change machine size
flyctl scale vm shared-cpu-2x

# View metrics
flyctl metrics

# SSH into machine
flyctl ssh console
```

## 🌍 Using Your Deployed App

Once deployed, your app will be available at: `https://findme.fly.dev` (or your custom domain)

### Test with Remote Client

```bash
SERVER_URL="https://findme.fly.dev" deno run --allow-net examples/client-remote.ts
```

### API Endpoints

- **Health**: `GET https://findme.fly.dev/health`
- **Create Room**: `POST https://findme.fly.dev/api/rooms`
- **List Rooms**: `GET https://findme.fly.dev/api/rooms`
- **Room Stats**: `GET https://findme.fly.dev/api/rooms/{roomId}`
- **WebSocket**: `wss://findme.fly.dev/ws/{roomId}`

## 🆘 Troubleshooting

### App won't start

```bash
flyctl logs
```

Common issues:

- Port not correctly exposed (should be 8080)
- Missing environment variables

### WebSocket connections fail

- Ensure you're using `wss://` (not `ws://`)
- Check that the host matches your Fly.io domain
- Verify firewall isn't blocking WebSocket upgrades

### High CPU/Memory usage

```bash
# View metrics
flyctl metrics

# Upgrade machine
flyctl scale vm shared-cpu-4x
```

### Need to restart app

```bash
flyctl apps restart
```

## 📚 Additional Resources

- [Fly.io Documentation](https://fly.io/docs/)
- [Deno Deployment Guide](https://deno.land/manual/tools/deployment)
- [Fly.io Pricing](https://fly.io/pricing)
- [WebSocket on Fly.io](https://fly.io/docs/app-guides/websockets/)

## 💡 Pro Tips

1. **Multiple Regions**: Add regions for global coverage

   ```bash
   flyctl regions add lhr cdg syd
   ```

2. **Custom Domain**: Use your own domain

   ```bash
   flyctl certs create yourdomain.com
   ```

3. **Environment Variables**: Store secrets securely

   ```bash
   flyctl secrets set API_KEY=your-secret-key
   ```

4. **Monitoring**: Set up alerts in Fly.io dashboard

5. **Backup**: Data is ephemeral - design accordingly or add persistent volume

---

**Ready to deploy?** Run `./deploy.sh` or `flyctl deploy` to get started!
