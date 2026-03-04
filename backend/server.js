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

        const users = addUser({
            name, 
            userId, 
            roomId, 
            host,
            presenter, 
            socketId:socket.id});

        //console.log(users);

       // const users = addUser(data);

        // save roomId inside this socket
        socket.roomId = roomId;

        socket.emit("UserIsJoined", { success: true , users});
        socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted" , name )
        socket.broadcast.to(roomId).emit("allUsers", users);

        // send existing image only to this new user
        // if (imgURLGlobal) {
        //     socket.emit("whiteboardDataResponse", {
        //         success: true,
        //         imgURL: imgURLGlobal
        //     });
        // }

        socket.broadcast.to(roomId).emit("WhiteBoardDataResponse", {
        imgURL: imgURLGlobal,  
     });

    socket.on("whiteboardData", (data) => {
        imgURLGlobal = data;

        // use socket.roomId instead of global
        socket.broadcast.to(socket.roomId).emit("whiteboardDataResponse", {
            success: true,
            imgURL: data
        });
    });

    //console.log(socket.id);

    socket.on("disconnect", () => {
        const user = getUser(socket.id);
        
        //console.log("disconnected" , user);
        if(user){
            removeUser(socket.id);
            socket.broadcast
            .to(roomIdGlobal)
            .emit("userLeftMessageBroadcasted" , user.name );
            }
    })

    });
});