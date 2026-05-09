import { serve } from "std/http/server.ts";
import { handleRequest } from "./src/handlers.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000");

console.log(`🦕 Deno server running on http://localhost:${PORT}`);
console.log(`📍 Create a room: POST /api/rooms`);
console.log(`📊 View rooms: GET /api/rooms`);
console.log(`🔗 Connect via WebSocket: ws://localhost:${PORT}/ws/:roomId`);

await serve(handleRequest, { port: PORT });
