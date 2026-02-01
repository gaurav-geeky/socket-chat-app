
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8008");

const Chat = ({ username }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  useEffect(() => {
    socket.emit("join", username);
    socket.on("receiveMessage", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [username]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("sendMessage", { message });
    setMessage("");
  };

  return (
    <div>
      <h2>Logged in as: {username}</h2>

      <div
        style={{
          border: "1px solid #ccc",
          height: "300px",
          overflowY: "auto",
          padding: "10px",
          marginBottom: "10px",
        }}
      >
        {chat.map((c, i) => (
          <p key={i}>
            {c.system ? (
              <i>{c.message}</i>
            ) : (
              <>
                <b>{c.user}:</b> {c.message}
              </>
            )}
          </p>
        ))}
      </div>

      <input
        type="text"
        value={message}
        placeholder="Type message..."
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;

