import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CreateRoomForm = ({uuid, socket, setUser}) => {

    const [roomId, setRoomId] = useState(uuid());
    const [name, setName] = useState("");

    const navigate = useNavigate();

    const handleCreateRoom = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Please enter your name");
            return;
        }

        const roomData = {
            name: name.trim(),
            roomId,
            userId: uuid(),
            host: true,
            presenter: true
        };

        setUser(roomData);
        navigate(`/${roomId}`);
        console.log(roomData);
        socket.emit("userJoined", roomData);
    };

    const handleCopyRoomId = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(roomId)
                .then(() => toast.success("Room code copied!"))
                .catch(() => fallbackCopy());
        } else {
            fallbackCopy();
        }
    };

    const fallbackCopy = () => {
        const textArea = document.createElement("textarea");
        textArea.value = roomId;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand("copy");
            toast.success("Room code copied!");
        } catch (err) {
            toast.error("Failed to copy. Please copy manually.");
        }
        document.body.removeChild(textArea);
    };

    return (
        <form className="form w-100 mt-4">
            <div className="form-group">
                <input
                type="text"
                className="form-control my-2" 
                id="create-name" 
                placeholder="Enter your name"
                value={name}
                onChange={(e)=>setName(e.target.value)} />
            </div>
            <div className="form-group border rounded">
                <div className="input-group d-flex align-items-center">
                    <input
                    type="text" 
                    value={roomId}
                    className="form-control my-2 border-0 room-code-input" 
                    readOnly
                    placeholder="Generate room code"
                    style={{fontSize: "0.8rem"}} />
                    <div className="input-group-append d-flex gap-1 me-2">
                        <button 
                            className="btn btn-primary btn-sm" 
                            onClick={()=>setRoomId(uuid())} 
                            type="button"
                            title="Generate new code">
                            ↻
                        </button>
                        <button 
                            className="btn btn-outline-danger btn-sm" 
                            type="button"
                            onClick={handleCopyRoomId}
                            title="Copy room code">
                            Copy
                        </button>
                    </div>
                </div>
            </div>
            <button type="submit" onClick={handleCreateRoom} className="mt-4 btn btn-primary btn-block form-control">
                Create Room
            </button>
        </form>
    )
};

export default CreateRoomForm;