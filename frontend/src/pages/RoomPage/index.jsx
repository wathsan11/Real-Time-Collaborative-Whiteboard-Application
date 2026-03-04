import { useRef, useState , useEffect } from 'react';
import './index.css'
import WhiteBoard from '../../components/WhiteBoard';

const RoomPage = ({user,socket, users}) => {

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const [tool, setTool] = useState('pencil');
    const [color, setColor] = useState('#000000');
    const [elements, setElements] = useState([]);
    const [history, setHistory] = useState([]); 
    const [openedUserTab , setOpenedUserTab] = useState(false);

    // useEffect(() => {
    //     return() => {
    //         socket.emit("userLeft" , user);
    //     }
    // }, [])

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
                    left:"5%" ,
                    height:"40px", 
                    widht:"100px"
                }}
                onClick={()=> setOpenedTab(true)} 
        >
            Users
        </button>
        {
            openedUserTab && (
                <div className="posotion-fixed top-0 h-100 text-white bg-dark" 
                style={{widht:"250px" , left:"0%"}}> 
                <button type="button" 
                onClick={()=> setOpenedTab(false)} 
                className="btn btn-light btn-block w-100 mt-5">
                    Close
                </button>
                <div className="w-100 mt-5 pt-5">
                    {users.map((user , index) =>(
                        <p key={index *999} className="my-2 w-100">
                            {user.name} {user && user.userId==user.userId &&"(You)"}
                            </p>
                    ))}
                </div>
                {users.map((user , index) =>(
                    <p key={index *999} className="my-2 text-center w-100">{user.name}</p>
                ))}
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
