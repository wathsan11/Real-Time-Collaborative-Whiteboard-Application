import { useEffect, useState, useLayoutEffect, use } from 'react';

const WhiteBoard = ({canvasRef, ctxRef, elements, setElements, tool, color,user,socket}) => {

    const [img,setImg] = useState(null);

  useEffect(() => {
    if (!socket) return;

    const handler = (data) => {
      setImg(data.imgURL);
    };

    socket.on("whiteboardDataResponse", handler);

    return () => {
      socket.off?.("whiteboardDataResponse", handler);
    };
  },[socket]);


    if(!user?.presenter) {
    return(
          <div 
        className="border border-dark border-3 w-100 h-100 overflow"
    >
      <img src={img} alt='Real time white board image shared by presenter' className='w-100 h-100'/>
    </div>
    )
  }
  const [isDrawing, setIsDrawing] = useState(false);


  const getCanvasPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { offsetX: 0, offsetY: 0 };
    const rect = canvas.getBoundingClientRect();

    return {
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
  };
    
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctxRef.current = ctx;
  }, []);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if(!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, rect.width, rect.height);

    elements.forEach((element) => {
      if(element.type === "line") {
        ctx.beginPath();
        ctx.strokeStyle = element.stroke || '#000000';
        ctx.lineWidth = 2;
        ctx.moveTo(element.offsetX, element.offsetY);
        ctx.lineTo(element.width, element.height);
        ctx.stroke();
      } else if(element.type === "pencil"){
        if(!element.path || element.path.length === 0) return;

        ctx.beginPath();
        ctx.strokeStyle = element.stroke || '#000000';
        ctx.lineWidth = 2;
        ctx.moveTo(element.path[0][0], element.path[0][1]);

        for(let i = 1; i < element.path.length; i++) {
          ctx.lineTo(element.path[i][0], element.path[i][1]);
        }

        ctx.stroke();
      } else if (element.type === "rect") {
        ctx.beginPath();
        ctx.strokeStyle = element.stroke || '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          element.offsetX,
          element.offsetY,
          element.width - element.offsetX,
          element.height - element.offsetY
        );
      }
    });

    const canvasImage = canvasRef.current.toDataURL();
    if (socket && typeof socket.emit === 'function') {
      socket.emit("whiteboardData", canvasImage);
    }

  }, [elements]);

  const handlePointerDown = (e) => {
    const { offsetX, offsetY } = getCanvasPoint(e);

    if(tool === "pencil") {
    setElements((prevElements) => [
      ...prevElements, 
        {
          type: "pencil",
          offsetX,
          offsetY,
          path: [[offsetX, offsetY]],
          stroke: color || '#000000',
        },  
    ]);
  } else if (tool === "line") {
      setElements((prevElements) => 
        [...prevElements,  
          {
            type: "line",
            offsetX,
            offsetY,
            width: offsetX,
            height: offsetY,
            stroke: color || '#000000',
          },
        ]);
  } else if (tool === "rect") {
      setElements((prevElements) => 
        [...prevElements,
          {
            type: "rect",
            offsetX,
            offsetY,
            width: offsetX,
            height: offsetY,
            stroke: color || '#000000',
          },
        ]);
  } else {
    return;
  }

    e.currentTarget.setPointerCapture?.(e.pointerId);
    setIsDrawing(true);
  };

  const handlePointerMove = (e) => {
    const { offsetX, offsetY } = getCanvasPoint(e);

    if(!isDrawing) return;

    setElements((prevElements) => {
      if(prevElements.length === 0) return prevElements;

      const lastIndex = prevElements.length - 1;

      if(tool === "pencil") {
        return prevElements.map((ele, index) => {
          if(index !== lastIndex) return ele;

          return {
            ...ele,
            path: [...ele.path, [offsetX, offsetY]],
          };
        });
      }

      if(tool === "line") {
        return prevElements.map((ele, index) => {
          if(index !== lastIndex) return ele;

          return {
            ...ele,
            width: offsetX,
            height: offsetY,
          };
        });
      }

      if(tool === "rect") {
        return prevElements.map((ele, index) => {
          if(index !== lastIndex) return ele;

          return {
            ...ele,
            width: offsetX,
            height: offsetY,
          };
        });
      }

      return prevElements;
    });
  };
 
  const handlePointerUp = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    setIsDrawing(false);
  };

  


  return (    
    <div 
        className="border border-dark border-3 w-100 h-100 overflow"
    >
      <canvas 
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: 'none', cursor: 'crosshair' }}
        
      />
    </div>
    );
  };

export default WhiteBoard;