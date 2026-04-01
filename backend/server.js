const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");
const { addUser, removeUser, getUser, getUsersInRoom } = require("./utils/users");

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const path = require("path");
// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const port = process.env.PORT || 5001;
server.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`)
});

// Store chat messages per room
const roomMessages = {};

io.on("connection", (socket) => {

    socket.on("userJoined", (data) => {
        const { name, userId, roomId, host, presenter } = data;

        socket.join(roomId);

        const user = addUser({
            name, 
            userId, 
            roomId, 
            host,
            presenter, 
            socketId: socket.id
        });

        // save roomId inside this socket
        socket.roomId = roomId;

        const usersInRoom = getUsersInRoom(roomId);

        socket.emit("UserIsJoined", { success: true, users: usersInRoom });
        socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);
        socket.broadcast.to(roomId).emit("allUsers", usersInRoom);

        // Send chat history to the newly joined user
        if (roomMessages[roomId]) {
            socket.emit("chatHistory", roomMessages[roomId]);
        }
    });

    socket.on("whiteboardData", (data) => {
        socket.broadcast.to(socket.roomId).emit("whiteboardDataResponse", {
            imgURL: data
        });
    });

    socket.on("chatMessage", (data) => {
        const roomId = socket.roomId;
        if (!roomId) return;

        const message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: data.name,
            text: data.text,
            userId: data.userId,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        // Store message
        if (!roomMessages[roomId]) roomMessages[roomId] = [];
        roomMessages[roomId].push(message);

        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit("chatMessageReceived", message);
    });

    socket.on("disconnect", () => {
        const user = getUser(socket.id);
        
        if(user){
            removeUser(socket.id);
            const usersInRoom = getUsersInRoom(user.roomId);
            socket.broadcast
                .to(user.roomId)
                .emit("userLeftMessageBroadcasted", user.name);
            socket.broadcast.to(user.roomId).emit("allUsers", usersInRoom);

            // Clean up empty rooms
            if (usersInRoom.length === 0 && roomMessages[user.roomId]) {
                delete roomMessages[user.roomId];
            }
        }
    });
});