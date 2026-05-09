// Type definitions for the application

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface ClientSession {
  id: string;
  roomId: string;
  socket: WebSocket;
  lastLocation?: GeoLocation;
}

export interface Room {
  id: string;
  createdAt: Date;
  clients: Map<string, ClientSession>;
}

export interface BroadcastMessage {
  type: "location" | "client-joined" | "client-left";
  clientId: string;
  roomId: string;
  data?: unknown;
  timestamp: string;
}

export interface LocationMessage {
  type: "location";
  clientId: string;
  roomId: string;
  location: GeoLocation;
  timestamp: string;
}
