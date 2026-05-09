import { Room, ClientSession, BroadcastMessage } from "../types/index.ts";
import { generateId } from "../utils/helpers.ts";

class RoomManager {
  private rooms: Map<string, Room> = new Map();

  /**
   * Create a new room and return its ID
   */
  createRoom(): string {
    const roomId = generateId();
    const room: Room = {
      id: roomId,
      createdAt: new Date(),
      clients: new Map(),
    };
    this.rooms.set(roomId, room);
    console.log(`✅ Room created: ${roomId}`);
    return roomId;
  }

  createRoomWithId(roomId: string): void {
    const room: Room = {
      id: roomId,
      createdAt: new Date(),
      clients: new Map(),
    };
    this.rooms.set(roomId, room);
    console.log(`✅ Room restored: ${roomId}`);
  }

  /**
   * Get a room by ID
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Add a client to a room
   */
  addClientToRoom(roomId: string, client: ClientSession): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    room.clients.set(client.id, client);
    console.log(
      `✅ Client ${client.id} joined room ${roomId}. Total clients: ${room.clients.size}`,
    );
    return true;
  }

  /**
   * Remove a client from a room
   */
  removeClientFromRoom(roomId: string, clientId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.clients.delete(clientId);
    console.log(
      `❌ Client ${clientId} left room ${roomId}. Total clients: ${room.clients.size}`,
    );

    // Clean up empty rooms
    if (room.clients.size === 0) {
      this.rooms.delete(roomId);
      console.log(`🗑️  Room ${roomId} deleted (empty)`);
    }
  }

  /**
   * Broadcast a message to all clients in a room except the sender
   */
  broadcastToRoom(roomId: string, message: BroadcastMessage): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const messageJson = JSON.stringify(message);

    for (const [clientId, client] of room.clients) {
      // Don't send message back to sender
      if (clientId === message.clientId) continue;

      try {
        if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.send(messageJson);
        }
      } catch (error) {
        console.error(`Failed to send message to client ${clientId}:`, error);
      }
    }
  }

  /**
   * Get all clients in a room
   */
  getClientsInRoom(roomId: string): ClientSession[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.clients.values());
  }

  /**
   * Get room stats
   */
  getRoomStats(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    return {
      roomId,
      clientCount: room.clients.size,
      createdAt: room.createdAt,
      uptime: Date.now() - room.createdAt.getTime(),
      clients: Array.from(room.clients.keys()),
    };
  }

  /**
   * Get all rooms (for debugging)
   */
  getAllRooms() {
    return Array.from(this.rooms.entries()).map(([roomId, room]) => ({
      roomId,
      clientCount: room.clients.size,
      createdAt: room.createdAt,
    }));
  }
}

// Export singleton instance
export const roomManager = new RoomManager();
