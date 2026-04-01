import './App.css'
import Forms from './components/Forms'
import {Route, Routes} from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import RoomPage from './pages/RoomPage';
import io from "socket.io-client";
import React, { useState, useEffect } from 'react';

// If accessed via ngrok or production, use the same origin, otherwise fallback to local backend port
const server = window.location.origin.includes('localhost') || window.location.origin.includes('192.168.') || window.location.origin.includes('127.0.0.1')
  ? "http://127.0.0.1:5001"
  : window.location.origin;

const connectionOptions = {
  "force new connection": true,
  "reconnectionAttempts": "Infinity",
  "timeout": 10000,
  "transports": ["websocket"]
};

const socket = io(server, connectionOptions);

const App = () => {

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("UserIsJoined", (data) => {
      if(data.success){
        console.log("User joined successfully");
        setUsers(data.users);
      } else {
        console.log("User join error");
      }
    });

    socket.on("allUsers", (data) => {
      setUsers(data);
    });

    socket.on("userJoinedMessageBroadcasted", (data) => {
      console.log(`${data} joined the room`);
      toast.info(`${data} joined the room`);
    });

    socket.on("userLeftMessageBroadcasted", (data) => {
      console.log(`${data} left the room`);
      toast.info(`${data} left the room`);
    });

    return () => {
      socket.off("UserIsJoined");
      socket.off("allUsers");
      socket.off("userJoinedMessageBroadcasted");
      socket.off("userLeftMessageBroadcasted");
    };
  }, []);

  const uuid = () => {
    let s4 = () => {
      return (((1 + Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (
      s4()+s4()+"-"+s4()+"-"+s4()+"-"+s4()+"-"+s4()+s4()+s4()
    );
  };

  return (
    <>
      <div className='container'>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Forms uuid={uuid} socket={socket} setUser={setUser} />} />
          <Route path="/:roomId" element={<RoomPage user={user} socket={socket} users={users} />} />
        </Routes>
      </div>
    </>
  )
}

export default App
