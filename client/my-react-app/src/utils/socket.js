/**
 * socket.js
 * Connects directly to the backend on port 3000 — bypasses the Vite proxy
 * so it works regardless of which port the dev server is on (5173, 5174, etc.)
 */

import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3000";

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SERVER_URL, { autoConnect: false });
  }
  return socketInstance;
}

export function connectSocket() {
  const socket = getSocket();
  if (!socket.connected) socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
