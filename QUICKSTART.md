# Quick Start Guide

Get up and running with the Geolocation Broadcast System in 5 minutes.

## 1. Start the Server

```bash
deno task dev
```

You should see:

```
🦕 Deno server running on http://localhost:3000
📍 Create a room: POST /api/rooms
📊 View rooms: GET /api/rooms
🔗 Connect via WebSocket: ws://localhost:3000/ws/:roomId
```

## 2. Create a Room

In a new terminal:

```bash
curl -X POST http://localhost:3000/api/rooms
```

Response:

```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "wsUrl": "ws://localhost:3000/ws/550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

Save the `roomId` - you'll need it for clients to join.

## 3. Try the Web Client

Open this file in your browser:

```
examples/client.html
```

Paste the room ID and click "Create/Join Room".

## 4. Open Multiple Browser Tabs

Open `examples/client.html` in another browser tab to simulate multiple clients in the same room.

Both tabs will now be connected to the same room and can share locations.

## 5. Send Locations

In each tab:

1. Enter latitude and longitude
2. Click "📍 Send Location"
3. See the location appear in the other tabs

Or click "📡 Use Current Location" to use your device's GPS.

## API Summary

### Create Room

```
POST /api/rooms
→ { roomId, wsUrl }
```

### Get All Rooms

```
GET /api/rooms
→ { rooms: [...], count: N }
```

### Get Room Info

```
GET /api/rooms/:roomId
→ { roomId, clientCount, clients: [...], uptime }
```

### Connect via WebSocket

```
ws://localhost:3000/ws/:roomId
```

Send:

```json
{
  "type": "location",
  "latitude": 40.7128,
  "longitude": -74.006,
  "accuracy": 10
}
```

## Tips

- Room IDs are UUIDs, so they're unique and hard to guess
- Rooms auto-delete when the last client disconnects
- Clients don't receive their own location updates
- Use the browser's Geolocation API with the "📡 Use Current Location" button
- Check the Activity Log to see all events

## Run the Deno Example Client

```bash
deno run --allow-net examples/client.ts
```

This will:

1. Create a room
2. Simulate 2 clients connecting
3. Send location updates
4. Auto-disconnect after 5 seconds
