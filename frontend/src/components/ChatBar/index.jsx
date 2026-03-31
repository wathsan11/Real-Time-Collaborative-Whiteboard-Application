import { useState } from "react";
import "./index.css";

const Chat = ({ messages = [], onSendMessage, onClose, currentUserId }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage?.(trimmed);
    setText("");
  };

  return (
    <div className="text-white bg-dark chat-panel">
      <button
        type="button"
        onClick={onClose}
        className="btn btn-light w-100 mt-2"
      >
        Close
      </button>

      <div className="chat-messages mt-2 px-2">
        {messages.length === 0 && <p className="text-secondary">No messages yet.</p>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-bubble ${message.userId === currentUserId ? "mine" : ""}`}
          >
            <p className="chat-name mb-1">{message.name}</p>
            <p className="mb-1">{message.text}</p>
            <small className="text-secondary">{message.time}</small>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-box p-3">
        <input
          type="text"
          className="form-control"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary mt-2 w-100">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
