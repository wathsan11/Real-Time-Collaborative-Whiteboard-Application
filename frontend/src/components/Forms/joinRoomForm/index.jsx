import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const JoinRoomForm = ({uuid, socket, setUser}) => {

    const [roomId, setRoomId] = useState("");
    const [name, setName] = useState("");

    const navigate = useNavigate();

    const handleRoomJoin = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }
        if (!roomId.trim()) {
            toast.error("Please enter a room code");
            return;
        }

        const roomData = {
            name: name.trim(),
            roomId: roomId.trim(),
            userId: uuid(),
            host: false,
            presenter: false
        };
        setUser(roomData);
        navigate(`/${roomData.roomId}`);
        socket.emit("userJoined", roomData);
    };

    return (
        <form className="form w-100 mt-4">
            <div className="form-group">
                <input
                    type="text" 
                    className="form-control my-2"
                    id="join-name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                />
            </div>
            <div className="form-group">
                <input
                    type="text" 
                    className="form-control my-2"
                    id="join-room-code"
                    placeholder="Enter room code"
                    value={roomId}
                    onChange={(e)=>setRoomId(e.target.value)}
                />
            </div>
            <button type="submit" onClick={handleRoomJoin} className="mt-4 btn btn-primary btn-block form-control">
                Join Room
            </button>
        </form> 
    )
};

export default JoinRoomForm;