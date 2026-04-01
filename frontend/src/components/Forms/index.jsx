import "./index.css"
import CreateRoomForm from "./CreateRoomForm";
import JoinRoomForm from "./JoinRoomForm";

const Forms = ({uuid, socket, setUser}) => {
    return (
        <div className="forms-page">
            <div className="forms-header">
                <h1 className="forms-title">
                    Collaborative Whiteboard
                </h1>
                <p className="forms-subtitle">Draw, share, and collaborate in real-time</p>
            </div>
            <div className="forms-container">
                <div className="form-card">
                    <div className="form-card-header">
                        <h2 className="card-title">Create Room</h2>
                        <p className="card-desc">Start a new whiteboard session</p>
                    </div>
                    <CreateRoomForm uuid={uuid} socket={socket} setUser={setUser} />
                </div>
                <div className="form-card">
                    <div className="form-card-header">
                        <h2 className="card-title">Join Room</h2>
                        <p className="card-desc">Enter an existing session</p>
                    </div>
                    <JoinRoomForm uuid={uuid} socket={socket} setUser={setUser} />
                </div>
            </div>
        </div>
    )
};

export default Forms;