import "./index.css"
import CreateRoomForm from "./CreateRoomForm";
import JoinRoomForm from "./JoinRoomForm";

const Forms = () => {
    return (
        <div className="row h-100 pt-5">
            <div className="col-md-4 mx-auto mt-5 form-box p-5 border mx-auto border-2 border-primary rounded-2 d-flex flex-column align-items-center justify-content-center">
                <h1 className="text-center text-primary fw-bold">Create Room</h1>
                <CreateRoomForm />
            </div>
            <div className="col-md-4 mx-auto mt-5 form-box p-5 border mx-auto border-2 border-primary rounded-2 d-flex flex-column align-items-center justify-content-center">
                <h1 className="text-center text-primary fw-bold">Join Room</h1>
                <JoinRoomForm />
            </div>
        </div>
    )
};

export default Forms;