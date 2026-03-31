import { useRef, useState , useEffect } from 'react';
import './index.css'
import WhiteBoard from '../../components/WhiteBoard';
import Chat from '../../components/ChatBar';

const RoomPage = ({user,socket, users = []}) => {

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const [tool, setTool] = useState('pencil');
    const [color, setColor] = useState('#000000');
    const [elements, setElements] = useState([]);
    const [history, setHistory] = useState([]); 
    const [openedUserTab , setOpenedUserTab] = useState(false);
    const [openedChatTab , setOpenedChatTab] = useState(false);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handleChatHistory = (history = []) => {
            setMessages(Array.isArray(history) ? history : []);
        };

        const handleChatMessage = (message) => {
            setMessages((prev) => [...prev, message]);
        };

        socket.on("chatHistory", handleChatHistory);
        socket.on("chatMessageReceived", handleChatMessage);

        return () => {
            socket.off("chatHistory", handleChatHistory);
            socket.off("chatMessageReceived", handleChatMessage);
        };
    }, [socket]);

    const handleSendMessage = (text) => {
        if (!socket || !user?.roomId) return;
        socket.emit("chatMessage", {
            text,
            name: user.name,
            userId: user.userId,
        });
    };

    const handleClearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d")
        ctx.fillStyle = "white";
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setElements([]);
    } 
    
    const undo = () => {
        setHistory((prevHistory) => [
            ...prevHistory,
            elements[elements.length - 1],
        ]);
        setElements((prevElements) => 
            prevElements.slice(0, prevElements.length - 1)
       );
    }; 

    const redo = () => {
        setElements((prevElements) => [
            ...prevElements,
            history[history.length - 1],
        ]);
        setHistory((prevHistory) => prevHistory.slice(0, prevHistory.length - 1));
    };  

return (
    <div className="row">
        <button type="button" className="btn btn-dark"
        style = {{
                    display:"block" , 
                    position:"absolute", 
                    top:"5%", 
                    left:"3%" ,
                    height:"40px", 
                    width:"72px"
                }}
                onClick={()=> {
                    setOpenedChatTab(false);
                    setOpenedUserTab(true);
                }} 
        >
            Users
        </button>
        <button type="button" className="btn btn-primary"
        style = {{
                    display:"block" , 
                    position:"absolute", 
                    top:"5%", 
                    left:"10%" ,
                    height:"40px", 
                    width:"72px"
                }}
                onClick={()=> {
                    setOpenedUserTab(false);
                    setOpenedChatTab(true);
                }} 
        >
           Chats
        </button>
        {
            openedUserTab && (
                <div className="position-fixed top-0 h-100 text-white bg-dark" 
                style={{width:"250px" , left:"0%"}}> 
                <button type="button" 
                onClick={()=> setOpenedUserTab(false)} 
                className="btn btn-light btn-block w-100 mt-5">
                    Close
                </button>
                <div className="w-100 mt-5 pt-5 px-3">
                    {users.map((roomUser , index) =>(
                        <p key={`${roomUser.userId}-${index}`} className="my-2 w-100">
                            {roomUser.name} {roomUser?.userId === user?.userId &&"(You)"}
                            </p>
                    ))}
                </div>
                </div>
            )
        }
        {
            openedChatTab && (
                <div className="position-fixed top-0 h-100 text-white bg-dark chat-sidebar-wrap"
                style={{width:"250px" , right:"0%"}}>
                    <Chat 
                        messages={messages}
                        currentUserId={user?.userId}
                        onSendMessage={handleSendMessage}
                        onClose={() => setOpenedChatTab(false)}
                    />
                </div>
            )
        }
        <h1 className='text-center pt-3 py-3'>
            White Board Sharing App {''}
            <span className='text-primary'>[Users Online : {users.length}]</span>
        </h1>
        {
            user?.presenter && (
        <div className="col-md-12 mt-2 mb-3 d-flex align-items-center justify-content-around flex-wrap gap-4">
            
            <div className="d-flex align-items-center gap-2">
                <label htmlFor="pencil">Pencil</label>
                <input 
                     type='radio' 
                     id='pencil'
                     checked={tool === 'pencil'}
                     name='tool' 
                     value='pencil' 
                     onChange={(e) => setTool(e.target.value)} />
            </div>

            
            <div className="d-flex align-items-center gap-2">
                <label htmlFor="line">Line</label>
                <input 
                     type='radio'
                     id='line'
                     checked={tool === 'line'} 
                     name='tool' 
                     value='line' 
                     onChange={(e) => setTool(e.target.value)} />
            </div>

        
            <div className="d-flex align-items-center gap-2">
                <label htmlFor="rect">Rectangle</label>
                <input 
                     type='radio' 
                     id='rect'
                     checked={tool === 'rect'}
                     name='tool'
                     value='rect' 
                     onChange={(e) => setTool(e.target.value)} />
            </div>

           
            <div className="d-flex flex-column align-items-center">
                <label htmlFor="color">Color</label>
                <input 
                    type='color' 
                    id='color' 
                    value={color}
                    onChange={(e) => setColor(e.target.value)} 
                />
            </div>

            
            <div className="d-flex gap-2">
                <button className='btn btn-primary' 
                    disabled={elements.length === 0}
                    onClick = {() => undo ()}
                >Undo</button>
                <button className='btn btn-outline-primary'
                    disabled={history.length < 1}
                    onClick = {() => redo ()}
                >Redo</button>
            </div>

            
            <div>
                <button className='btn btn-danger' onClick={handleClearCanvas}>Clear Canvas</button>
            </div>

        </div>                
            )
        }





        <div className="col-md-10 mx-auto mt-4 border canvas-box">
            <WhiteBoard 
               canvasRef={canvasRef} 
               ctxRef={ctxRef}
               elements={elements}
               setElements={setElements}
               tool={tool}
               color={color}
               user={user}
               socket={socket}
              />

        </div>

    </div>
  );
};

export default RoomPage;
