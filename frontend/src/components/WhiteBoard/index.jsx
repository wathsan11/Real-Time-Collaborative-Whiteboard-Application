import { useEffect, useState, useLayoutEffect } from 'react';
import rough from 'roughjs';

const WhiteBoard = ({canvasRef,ctxRef, elements, setElements}) => {

  const [isDrawing, setIsDrawing] = useState(false);
    
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctxRef.current = ctx;

  }, []);

  useLayoutEffect(() => {
    const roughCanvas = rough.canvas(canvasRef.current);

    elements.forEach((element) => {
        roughCanvas.linearPath(element.path);
    });
  }, [elements]);

  const handleMouseDown = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    console.log(offsetX, offsetY);

    setElements((prevElements) => [...prevElements, 
        {type: 'pencil',
         offsetX,
         offsetY,
         path: [[offsetX, offsetY]],
         stroke: 'black',
        }  
    ]);
    
    setIsDrawing(true);
  }

  const handleMouseMove = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    if(isDrawing){
         // pencil by default as static
         const {path} = elements[elements.length - 1];
         const newPath = [...path, [offsetX, offsetY]];

         setElements((prevElements) => {
            return prevElements.map((ele, index) => {
                if(index === elements.length - 1){
                    return {
                        ...ele,
                        path: newPath,
                    };
                }else{
                    return ele;
                }
            })
         }); 
        
    }
   
  }

  const handleMouseUp = (e) => {
    setIsDrawing(false);
  }

  return (
    
    <canvas 
        ref={canvasRef}  
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="border border-dark border-3 w-100 h-100"
    ></canvas>
    
    );
}

export default WhiteBoard;