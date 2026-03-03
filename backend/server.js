const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

//routes
app.get("/", (req,res)=>{
    res.send("Backend is running");
});

const port = process.env.PORT || 5001;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});

let roomIdGlobal,imgURLGlobal;

io.on("connection", (socket) => {

    socket.on("userJoined", (data) => {
        const { roomId } = data;

        socket.join(roomId);

        // save roomId inside this socket
        socket.roomId = roomId;

        socket.emit("UserIsJoined", { success: true });

        // send existing image only to this new user
        if (imgURLGlobal) {
            socket.emit("whiteboardDataResponse", {
                success: true,
                imgURL: imgURLGlobal
            });
        }
    });

    socket.on("whiteboardData", (data) => {
        imgURLGlobal = data;

        // use socket.roomId instead of global
        socket.broadcast.to(socket.roomId).emit("whiteboardDataResponse", {
            success: true,
            imgURL: data
        });
    });

});