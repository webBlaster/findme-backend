# Geolocation Broadcast System

A real-time geolocation broadcasting server built with Deno, using WebSockets for live client location updates. Multiple clients can join rooms and broadcast their location to others in the same room.

## Features

- 🌍 Real-time geolocation broadcasting via WebSockets
- 🚀 Zero-authentication design (session-based rooms)
- 🔄 In-memory data storage (auto-cleanup on session end)
- 🆔 Automatic client and room ID generation
- 🔌 Clients don't receive their own location updates
- ⚡ Lightweight and fast

## Prerequisites

- [Deno](https://deno.land) (v1.30+)

## Project Structure

```
.
├── main.ts                      # Entry point
├── deno.json                    # Deno configuration
├── src/
│   ├── routes/
│   │   ├── router.ts           # Route definitions
│   │   └── handlers.ts         # Route handlers
│   ├── services/
│   │   └── roomManager.ts      # Room and client management
│   ├── websocket/
│   │   └── handler.ts          # WebSocket connection handler
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   └── utils/
│       └── helpers.ts          # Utility functions
└── README.md
```

## Getting Started

### Install Dependencies

```bash
deno cache deno.json
```

### Run Development Server

```bash
deno task dev
```

The server will start on `http://localhost:3000`

### Start Production Server

```bash
deno task start
```

### Run Tests

```bash
deno task test
```

## API Endpoints

### Health Check

```bash
GET /health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

### Create a New Room

```bash
POST /api/rooms
```

Response:

```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "wsUrl": "ws://localhost:3000/ws/550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

### Get All Rooms

```bash
GET /api/rooms
```

Response:

```json
{
  "rooms": [
    {
      "roomId": "550e8400-e29b-41d4-a716-446655440000",
      "clientCount": 3,
      "createdAt": "2026-05-09T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### Get Room Statistics

```bash
GET /api/rooms/:roomId
```

Response:

```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "clientCount": 3,
  "createdAt": "2026-05-09T10:30:00.000Z",
  "uptime": 45000,
  "clients": ["client-id-1", "client-id-2", "client-id-3"]
}
```

## WebSocket Usage

### Connect to a Room

```javascript
const roomId = "550e8400-e29b-41d4-a716-446655440000";
const ws = new WebSocket(`ws://localhost:3000/ws/${roomId}`);

ws.onopen = () => {
  console.log("Connected to room");
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("Received:", message);
};
```

### Send Location Update

```javascript
ws.send(
  JSON.stringify({
    type: "location",
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 10, // optional, in meters
  }),
);
```

### Message Types

#### Location Message (broadcast to others)

```json
{
  "type": "location",
  "clientId": "client-id-1",
  "roomId": "room-id",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006,
    "accuracy": 10
  },
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

#### Client Joined Notification

```json
{
  "type": "client-joined",
  "clientId": "client-id-1",
  "roomId": "room-id",
  "data": {
    "clientId": "client-id-1"
  },
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

#### Client Left Notification

```json
{
  "type": "client-left",
  "clientId": "client-id-1",
  "roomId": "room-id",
  "data": {
    "clientId": "client-id-1"
  },
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

## Example Workflow

### 1. Create a Room (Server-side)

```bash
curl -X POST http://localhost:3000/api/rooms
```

Output:

```json
{
  "roomId": "abc123",
  "wsUrl": "ws://localhost:3000/ws/abc123"
}
```

### 2. Client A Connects

```javascript
const ws = new WebSocket("ws://localhost:3000/ws/abc123");
```

### 3. Client B Connects

```javascript
const ws = new WebSocket("ws://localhost:3000/ws/abc123");
// Client A receives: { type: "client-joined", clientId: "..." }
```

### 4. Client A Sends Location

```javascript
ws.send(
  JSON.stringify({
    type: "location",
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 5,
  }),
);
// Client B receives the location update (Client A does not)
```

### 5. Room Cleanup

When the last client disconnects from a room, the room is automatically deleted from memory.

## Environment Variables

- `PORT` - Server port (default: 3000)

## Permissions

The app uses the following Deno permissions:

- `--allow-net` - Network access for HTTP server and WebSockets
- `--allow-read` - File system read access
- `--allow-env` - Environment variable access

## Key Features Explained

### Room Management

- Rooms are created on-demand via the REST API
- Each room is assigned a unique UUID
- Rooms are automatically cleaned up when the last client disconnects
- All data is stored in-memory (no persistence)

### Client Identification

- Each client receives a unique UUID upon connection
- Client IDs are used to prevent sending messages back to the sender
- Client presence is broadcast to other clients in the room

### Data Privacy

- No authentication required (room IDs are used as access control)
- Clients only see locations from others in the same room
- Location data is not persisted

## Performance Considerations

- In-memory storage is efficient for real-time updates
- Automatic cleanup prevents memory leaks
- WebSocket connections provide low-latency updates

## License

MIT
