import { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './index.css'
import WhiteBoard from '../../components/WhiteBoard';
import Chat from '../../components/ChatBar';

const RoomPage = ({user, socket, users = []}) => {

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const [tool, setTool] = useState('pencil');
    const [color, setColor] = useState('#000000');
    const [elements, setElements] = useState([]);
    const [history, setHistory] = useState([]); 
    const [openedUserTab, setOpenedUserTab] = useState(false);
    const [openedChatTab, setOpenedChatTab] = useState(false);
    const [messages, setMessages] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);
    const chatOpenRef = useRef(false);

    // Keep ref in sync with state so socket handler always sees the latest value
    useEffect(() => {
        chatOpenRef.current = openedChatTab;
    }, [openedChatTab]);

    useEffect(() => {
        if (!socket) return;

        const handleChatHistory = (history = []) => {
            setMessages(Array.isArray(history) ? history : []);
        };

        const handleChatMessage = (message) => {
            setMessages((prev) => [...prev, message]);
            // Show toast & set unread dot if chat is closed and message is from someone else
            if (!chatOpenRef.current && message.userId !== user?.userId) {
                setHasUnread(true);
                toast.info(`${message.name}: ${message.text}`, {
                    autoClose: 3000,
                    position: 'bottom-right',
                });
            }
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
    <div className="room-page">
        {/* ── Top Bar ── */}
        <div className="room-topbar">
            <div className="topbar-left">
                <button 
                    type="button" 
                    className="topbar-btn"
                    onClick={() => {
                        setOpenedChatTab(false);
                        setOpenedUserTab(true);
                    }}
                    title="Participants"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span className="topbar-btn-badge">{users.length}</span>
                </button>
            </div>

            <h1 className="room-title">
                Whiteboard
                <span className="online-badge">{users.length} online</span>
            </h1>

            <div className="topbar-right">
                <button 
                    type="button" 
                    className="topbar-btn"
                    onClick={() => {
                        setOpenedUserTab(false);
                        setOpenedChatTab(true);
                        setHasUnread(false);
                    }}
                    title="Chat"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span className="topbar-btn-label">Chat</span>
                    {hasUnread && <span className="unread-dot"></span>}
                </button>
            </div>
        </div>

        {/* ── Users Sidebar ── */}
        {openedUserTab && (
            <div className="sidebar-overlay" onClick={() => setOpenedUserTab(false)}>
                <div className="sidebar sidebar-left" onClick={(e) => e.stopPropagation()}>
                    <div className="sidebar-header">
                        <h3>Participants</h3>
                        <button 
                            type="button" 
                            onClick={() => setOpenedUserTab(false)}
                            className="sidebar-close-btn"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="users-list">
                        {users.map((usr, index) => (
                            <div key={usr.userId || index} className="user-item">
                                <div className="user-avatar">
                                    {usr.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="user-name">
                                    {usr.name}
                                    {user && usr.userId === user.userId && 
                                        <span className="you-badge">You</span>
                                    }
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* ── Chat Sidebar ── */}
        {openedChatTab && (
            <div className="sidebar-overlay" onClick={() => setOpenedChatTab(false)}>
                <div className="sidebar sidebar-right" onClick={(e) => e.stopPropagation()}>
                    <Chat 
                        messages={messages}
                        currentUserId={user?.userId}
                        onSendMessage={handleSendMessage}
                        onClose={() => setOpenedChatTab(false)}
                    />
                </div>
            </div>
        )}

        {/* ── Toolbar ── */}
        {user?.presenter && (
            <div className="toolbar">
                <div className="toolbar-group">
                    <button 
                        className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`}
                        onClick={() => setTool('pencil')}
                        title="Pencil"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        </svg>
                        <span className="tool-label">Pencil</span>
                    </button>
                    <button 
                        className={`tool-btn ${tool === 'line' ? 'active' : ''}`}
                        onClick={() => setTool('line')}
                        title="Line"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="19" x2="19" y2="5"/>
                        </svg>
                        <span className="tool-label">Line</span>
                    </button>
                    <button 
                        className={`tool-btn ${tool === 'rect' ? 'active' : ''}`}
                        onClick={() => setTool('rect')}
                        title="Rectangle"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2"/>
                        </svg>
                        <span className="tool-label">Rect</span>
                    </button>
                </div>

                <div className="toolbar-group">
                    <label className="color-picker-wrapper" title="Pick color">
                        <input 
                            type='color' 
                            id='color' 
                            value={color}
                            className="color-input"
                            onChange={(e) => setColor(e.target.value)} 
                        />
                        <span className="color-preview" style={{backgroundColor: color}}></span>
                    </label>
                </div>

                <div className="toolbar-group">
                    <button 
                        className='action-btn'
                        disabled={elements.length === 0}
                        onClick={() => undo()}
                        title="Undo"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1 4 1 10 7 10"/>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                        <span className="tool-label">Undo</span>
                    </button>
                    <button 
                        className='action-btn'
                        disabled={history.length < 1}
                        onClick={() => redo()}
                        title="Redo"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 4 23 10 17 10"/>
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                        </svg>
                        <span className="tool-label">Redo</span>
                    </button>
                    <button 
                        className='action-btn danger'
                        onClick={handleClearCanvas}
                        title="Clear canvas"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        <span className="tool-label">Clear</span>
                    </button>
                </div>
            </div>
        )}

        {/* ── Canvas ── */}
        <div className="canvas-wrapper">
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
