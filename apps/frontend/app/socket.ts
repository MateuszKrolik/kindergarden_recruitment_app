import { io } from "socket.io-client";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
const socket = io(BACKEND_URL);
export default socket;
