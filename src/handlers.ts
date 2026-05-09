import { roomManager } from "./services/roomManager.ts";
import { handleWebSocketConnection } from "./websocket/handler.ts";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  // CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // Health check
  if (pathname === "/health" && method === "GET") {
    return json({ status: "ok", timestamp: new Date().toISOString() });
  }

  // Create a new room
  if (pathname === "/api/rooms" && method === "POST") {
    const roomId = roomManager.createRoom();
    const host = url.host;
    const protocol = url.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${host}/ws/${roomId}`;
    return json({ roomId, wsUrl, timestamp: new Date().toISOString() }, 201);
  }

  // Get all rooms
  if (pathname === "/api/rooms" && method === "GET") {
    const rooms = roomManager.getAllRooms();
    return json({ rooms, count: rooms.length });
  }

  // Get room stats
  const roomStatsMatch = pathname.match(/^\/api\/rooms\/([a-f0-9-]+)$/);
  if (roomStatsMatch && method === "GET") {
    const roomId = roomStatsMatch[1];
    const stats = roomManager.getRoomStats(roomId);

    if (!stats) {
      return json({ error: "Room not found" }, 404);
    }

    return json(stats);
  }

  // WebSocket endpoint
  const wsMatch = pathname.match(/^\/ws\/([a-f0-9-]+)$/);
  if (wsMatch && request.headers.get("upgrade") === "websocket") {
    const roomId = wsMatch[1];

    try {
      const { socket, response } = Deno.upgradeWebSocket(request);
      await handleWebSocketConnection(socket, roomId);
      return response;
    } catch (error) {
      console.error("WebSocket upgrade failed:", error);
      return json({ error: "WebSocket upgrade failed" }, 500);
    }
  }

  return json({ error: "Not found", path: pathname }, 404);
}
