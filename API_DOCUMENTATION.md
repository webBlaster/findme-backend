# Geolocation Broadcast System - API Documentation

Frontend integration guide for the Deno-based geolocation broadcasting server.

## Base URL

```
HTTP: http://localhost:3000
WebSocket: ws://localhost:3000
```

---

## REST API Endpoints

### 1. Health Check

Check if the server is running.

**Request:**

```
GET /health
```

**Response:** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

---

### 2. Create a New Room

Initialize a new geolocation sharing room.

**Request:**

```
POST /api/rooms
```

No request body required.

**Response:** `201 Created`

```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "wsUrl": "ws://localhost:3000/ws/550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

**Usage:**

```javascript
const response = await fetch("http://localhost:3000/api/rooms", {
  method: "POST",
});
const data = await response.json();
const roomId = data.roomId;
const wsUrl = data.wsUrl;
```

---

### 3. Get All Active Rooms

Retrieve a list of all currently active rooms.

**Request:**

```
GET /api/rooms
```

**Response:** `200 OK`

```json
{
  "rooms": [
    {
      "roomId": "550e8400-e29b-41d4-a716-446655440000",
      "clientCount": 3,
      "createdAt": "2026-05-09T10:30:00.000Z"
    },
    {
      "roomId": "660e8400-e29b-41d4-a716-446655440000",
      "clientCount": 1,
      "createdAt": "2026-05-09T10:35:00.000Z"
    }
  ],
  "count": 2
}
```

---

### 4. Get Room Statistics

Get detailed information about a specific room.

**Request:**

```
GET /api/rooms/:roomId
```

**Parameters:**

- `roomId` (string, path) - The room ID to query

**Response:** `200 OK`

```json
{
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "clientCount": 3,
  "createdAt": "2026-05-09T10:30:00.000Z",
  "uptime": 45000,
  "clients": ["client-id-1", "client-id-2", "client-id-3"]
}
```

**Usage:**

```javascript
const roomId = "550e8400-e29b-41d4-a716-446655440000";
const response = await fetch(`http://localhost:3000/api/rooms/${roomId}`);
const roomStats = await response.json();
```

---

## WebSocket API

### Connection

Connect to a room's WebSocket endpoint to send and receive location updates.

```javascript
const roomId = "550e8400-e29b-41d4-a716-446655440000";
const ws = new WebSocket(`ws://localhost:3000/ws/${roomId}`);

ws.onopen = () => {
  console.log("Connected to room");
};

ws.onerror = (error) => {
  console.error("WebSocket error:", error);
};

ws.onclose = () => {
  console.log("Disconnected from room");
};
```

---

### Message Types

#### 1. Send Location Update

Broadcast your location to all other clients in the room.

**Send:**

```json
{
  "type": "location",
  "latitude": 40.7128,
  "longitude": -74.006,
  "accuracy": 10
}
```

**JavaScript:**

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

**Receive (from other clients):**

```json
{
  "type": "location",
  "clientId": "client-id-2",
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.006,
    "accuracy": 10
  },
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

**Note:** You will NOT receive your own location updates. Only other clients' locations are broadcast to you.

---

#### 2. Client Joined Notification

Broadcast when a new client joins the room.

**Receive:**

```json
{
  "type": "client-joined",
  "clientId": "client-id-1",
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "clientId": "client-id-1"
  },
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

**JavaScript Handler:**

```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "client-joined") {
    console.log("New client joined:", message.data.clientId);
  }
};
```

---

#### 3. Client Left Notification

Broadcast when a client disconnects from the room.

**Receive:**

```json
{
  "type": "client-left",
  "clientId": "client-id-1",
  "roomId": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "clientId": "client-id-1"
  },
  "timestamp": "2026-05-09T10:30:00.000Z"
}
```

**JavaScript Handler:**

```javascript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "client-left") {
    console.log("Client left:", message.data.clientId);
  }
};
```

---

## Complete Example

Here's a complete example of creating a room and connecting two clients:

```javascript
// Create a room
const roomResponse = await fetch("http://localhost:3000/api/rooms", {
  method: "POST",
});
const { roomId, wsUrl } = await roomResponse.json();

// Client A connects
const wsA = new WebSocket(wsUrl);

wsA.onopen = () => {
  console.log("Client A connected");
};

wsA.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log("Client A received:", message);
};

// Client B connects (in another browser/window)
const wsB = new WebSocket(wsUrl);

wsB.onopen = () => {
  console.log("Client B connected");
  // Client A will receive: { type: "client-joined", clientId: "..." }
};

// Client A sends location
wsA.send(
  JSON.stringify({
    type: "location",
    latitude: 40.7128,
    longitude: -74.006,
    accuracy: 5,
  }),
);
// Client B receives the location update
// Client A does NOT receive their own location update

// Client B sends location
wsB.send(
  JSON.stringify({
    type: "location",
    latitude: 34.0522,
    longitude: -118.2437,
    accuracy: 8,
  }),
);
// Client A receives Client B's location
```

---

## Error Handling

### WebSocket Errors

```javascript
ws.onerror = (error) => {
  console.error("WebSocket error:", error);
  // Attempt to reconnect or handle appropriately
};

ws.onclose = () => {
  console.log("Connection closed");
  // Implement reconnection logic if needed
};
```

### HTTP Errors

```javascript
fetch("http://localhost:3000/api/rooms")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .catch((error) => console.error("Request failed:", error));
```

---

## Type Definitions (TypeScript)

```typescript
interface HealthResponse {
  status: string;
  timestamp: string;
}

interface CreateRoomResponse {
  roomId: string;
  wsUrl: string;
  timestamp: string;
}

interface RoomInfo {
  roomId: string;
  clientCount: number;
  createdAt: string;
}

interface GetRoomsResponse {
  rooms: RoomInfo[];
  count: number;
}

interface RoomStats {
  roomId: string;
  clientCount: number;
  createdAt: string;
  uptime: number;
  clients: string[];
}

interface LocationMessage {
  type: "location";
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface BroadcastLocationMessage {
  type: "location";
  clientId: string;
  roomId: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  timestamp: string;
}

interface ClientJoinedMessage {
  type: "client-joined";
  clientId: string;
  roomId: string;
  data: {
    clientId: string;
  };
  timestamp: string;
}

interface ClientLeftMessage {
  type: "client-left";
  clientId: string;
  roomId: string;
  data: {
    clientId: string;
  };
  timestamp: string;
}

type WebSocketMessage =
  | BroadcastLocationMessage
  | ClientJoinedMessage
  | ClientLeftMessage;
```

---

## Key Points for Frontend Development

- **Session-based:** No authentication required. Share the `roomId` to allow others to join.
- **Self-filtering:** You will never receive your own location updates.
- **Automatic cleanup:** Rooms are deleted when the last client disconnects.
- **In-memory storage:** All data is temporary and lost when the server restarts.
- **Low-latency:** WebSockets provide real-time updates.
- **Unique IDs:** Each client automatically receives a unique ID.

---

## Testing

You can test the endpoints using cURL:

```bash
# Health check
curl http://localhost:3000/health

# Create room
curl -X POST http://localhost:3000/api/rooms

# Get all rooms
curl http://localhost:3000/api/rooms

# Get room stats
curl http://localhost:3000/api/rooms/{roomId}
```

Or use a WebSocket client like [WebSocket King](https://www.websocket.org/echo.html) or your browser's console.
