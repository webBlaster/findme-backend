/**
 * Example client for the Geolocation Broadcast System
 * Run with: deno run --allow-net examples/client.ts
 */

async function createRoom(): Promise<string> {
  const response = await fetch("http://localhost:8000/api/rooms", {
    method: "POST",
  });
  const data = await response.json();
  return data.roomId;
}

function connectToRoom(roomId: string): WebSocket {
  const wsUrl = `ws://localhost:8000/ws/${roomId}`;
  console.log(`🔗 Connecting to room: ${roomId}`);
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log(`✅ Connected to room ${roomId}`);
  };

  ws.onmessage = (event: MessageEvent) => {
    const message = JSON.parse(event.data);
    console.log("📨 Received:", message);
  };

  ws.onerror = (error: Event) => {
    console.error("❌ WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("🔌 Disconnected from room");
  };

  return ws;
}

function sendLocation(
  ws: WebSocket,
  latitude: number,
  longitude: number,
  accuracy?: number,
): void {
  if (ws.readyState !== WebSocket.OPEN) {
    console.error("WebSocket is not open");
    return;
  }

  const message = {
    type: "location",
    latitude,
    longitude,
    accuracy: accuracy || Math.random() * 20,
  };

  ws.send(JSON.stringify(message));
  console.log(`📍 Sent location: (${latitude}, ${longitude})`);
}

async function simulateMultipleClients() {
  try {
    // Create a room
    const roomId = await createRoom();
    console.log(`\n🎯 Created room: ${roomId}\n`);

    // Client 1
    const client1 = connectToRoom(roomId);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Client 2
    const client2 = connectToRoom(roomId);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate location updates
    setTimeout(() => {
      sendLocation(client1, 40.7128, -74.006, 5);
    }, 1000);

    setTimeout(() => {
      sendLocation(client2, 34.0522, -118.2437, 8);
    }, 1500);

    setTimeout(() => {
      sendLocation(client1, 40.7129, -74.0061, 5);
    }, 8000);

    // Keep connections alive
    setTimeout(() => {
      client1.close();
      client2.close();
      console.log("\n✅ Demo completed");
    }, 5000);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the demo
if (import.meta.main) {
  simulateMultipleClients();
}
