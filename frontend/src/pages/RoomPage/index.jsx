import { useRef, useState } from 'react';
import './index.css'
import WhiteBoard from '../../components/WhiteBoard';

const RoomPage = () => {

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const [tool, setTool] = useState('pencil');
    const [color, setColor] = useState('#000000');
    const [elements, setElements] = useState([]);
  return (
    <div className="row">
        <h1 className='text-center pt-3 py-3'>
            White Board Sharing App {''}
            <span className='text-primary'>[Users Online : 0]</span>
        </h1>
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
                <button className='btn btn-primary'>Undo</button>
                <button className='btn btn-outline-primary'>Redo</button>
            </div>

            
            <div>
                <button className='btn btn-danger'>Clear Canvas</button>
            </div>

        </div>

        <div className="col-md-10 mx-auto mt-4 border canvas-box">
            <WhiteBoard 
               canvasRef={canvasRef} 
               ctxRef={ctxRef}
               elements={elements}
               setElements={setElements}
              />

        </div>

    </div>
  );
};

export default RoomPage;
