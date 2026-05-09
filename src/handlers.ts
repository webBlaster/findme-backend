import { roomManager } from "./services/roomManager.ts";
import { handleWebSocketConnection } from "./websocket/handler.ts";

interface RouteMatch {
  method: string;
  path: string;
  match: RegExpMatchArray | null;
}

export async function handleRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  // Health check
  if (pathname === "/health" && method === "GET") {
    return new Response(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  // Create a new room
  if (pathname === "/api/rooms" && method === "POST") {
    const roomId = roomManager.createRoom();
    const host = url.host;
    const protocol = url.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${host}/ws/${roomId}`;
    return new Response(
      JSON.stringify({
        roomId,
        wsUrl,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Get all rooms
  if (pathname === "/api/rooms" && method === "GET") {
    const rooms = roomManager.getAllRooms();
    return new Response(JSON.stringify({ rooms, count: rooms.length }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get room stats
  const roomStatsMatch = pathname.match(/^\/api\/rooms\/([a-f0-9-]+)$/);
  if (roomStatsMatch && method === "GET") {
    const roomId = roomStatsMatch[1];
    const stats = roomManager.getRoomStats(roomId);

    if (!stats) {
      return new Response(JSON.stringify({ error: "Room not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(stats), {
      headers: { "Content-Type": "application/json" },
    });
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
      return new Response(
        JSON.stringify({ error: "WebSocket upgrade failed" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  // 404 Not Found
  return new Response(
    JSON.stringify({
      error: "Not found",
      path: pathname,
    }),
    {
      status: 404,
      headers: { "Content-Type": "application/json" },
    },
  );
}
