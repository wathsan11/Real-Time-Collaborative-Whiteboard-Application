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

//routes
app.get("/", (req,res)=>{
    res.send("Backend is running");
});

const port = process.env.PORT || 5001;
server.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`)
});

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
    });

    socket.on("whiteboardData", (data) => {
        socket.broadcast.to(socket.roomId).emit("whiteboardDataResponse", {
            imgURL: data
        });
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
        }
    });
});