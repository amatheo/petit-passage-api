import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// Middleware CORS
app.use(cors());

// Gestion des connexions Socket.io
io.on("connection", (socket: Socket) => {
    console.log(`Nouvel utilisateur connecté : ${socket.id}`);

    socket.on("mousemove", (data) => {
        socket.broadcast.emit("mousemove", data);
    });

    socket.on("disconnect", () => {
        console.log(`Utilisateur déconnecté : ${socket.id}`);
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur WebSocket démarré sur http://localhost:${PORT}`);
});
