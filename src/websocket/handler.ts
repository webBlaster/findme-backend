import { roomManager } from "../services/roomManager.ts";
import { ClientSession, LocationMessage, GeoLocation } from "../types/index.ts";
import { generateId } from "../utils/helpers.ts";

export async function handleWebSocketConnection(
  socket: WebSocket,
  roomId: string,
): Promise<void> {
  const clientId = generateId();
  console.log(`🔌 New WebSocket connection: ${clientId} for room ${roomId}`);

  // Verify room exists and add client
  if (!roomManager.getRoom(roomId)) {
    console.log(`❌ Room not found: ${roomId}`);
    socket.close(1008, "Room not found");
    return;
  }

  const client: ClientSession = {
    id: clientId,
    roomId,
    socket,
  };

  // Add client to room
  if (!roomManager.addClientToRoom(roomId, client)) {
    socket.close(1008, "Failed to join room");
    return;
  }

  // Notify other clients that a new client joined
  roomManager.broadcastToRoom(roomId, {
    type: "client-joined",
    clientId,
    roomId,
    data: { clientId },
    timestamp: new Date().toISOString(),
  });

  // Handle incoming messages
  socket.onmessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "location") {
        const location: GeoLocation = {
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
        };

        // Update client's last known location
        client.lastLocation = location;

        // Broadcast location to other clients in the room
        const message: LocationMessage = {
          type: "location",
          clientId,
          roomId,
          location,
          timestamp: new Date().toISOString(),
        };

        roomManager.broadcastToRoom(roomId, message);
      }
    } catch (error) {
      console.error(`Error processing message from ${clientId}:`, error);
    }
  };

  // Handle client disconnect
  socket.onclose = () => {
    console.log(`🔌 Client disconnected: ${clientId}`);
    roomManager.removeClientFromRoom(roomId, clientId);

    // Notify other clients that this client left
    roomManager.broadcastToRoom(roomId, {
      type: "client-left",
      clientId,
      roomId,
      data: { clientId },
      timestamp: new Date().toISOString(),
    });
  };

  // Handle errors
  socket.onerror = (error: Event) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
  };
}
