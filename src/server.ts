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

const activeCursors: Record<string, number> = {}; // Stocke les timestamps

io.on("connection", (socket: Socket) => {
    console.log(`Nouvel utilisateur connecté : ${socket.id}`);

    socket.on("mousemove", (data) => {
        activeCursors[data.id] = Date.now(); // Mise à jour de l'activité
        socket.broadcast.emit("mousemove", data);
    });

    socket.on("client_disconnect", (data) => {
        delete activeCursors[data.id];
        io.emit("remove_cursor", { id: data.id }); // Diffusion de la suppression
    });

    socket.on("disconnect", () => {
        console.log(`Socket déconnecté : ${socket.id}`);
    });
});

// Nettoyage des curseurs inactifs toutes les 30 secondes
setInterval(() => {
    const now = Date.now();
    for (const [clientId, lastActive] of Object.entries(activeCursors)) {
        if (now - lastActive > 30000) { // 30 secondes d'inactivité
            delete activeCursors[clientId];
            io.emit("remove_cursor", { id: clientId });
        }
    }
}, 30000);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur WebSocket démarré sur http://localhost:${PORT}`);
});
