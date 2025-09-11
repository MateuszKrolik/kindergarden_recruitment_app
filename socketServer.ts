import { Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import { Server } from "socket.io";


declare global {
  var io: Server | undefined;
}

export function initSocketServer(httpServer: HttpServer<typeof IncomingMessage, typeof ServerResponse>) {
  global.io = new Server(httpServer);

  global.io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

export function getSocketServer(): Server | undefined {
  return global.io;
}
