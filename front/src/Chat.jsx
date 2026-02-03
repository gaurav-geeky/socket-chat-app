import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8008");

const Chat = ({ username }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.emit("join", username);

    socket.on("receiveMessage", (data) => {
      if (Array.isArray(data)) {
        setChat(data);
      } else {
        setChat((prev) => [...prev, data]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", { message });
    setMessage("");
  };

  return (
    /* 🔥 ROOT CONTAINER */
    <div className="w-full h-[92dvh] flex flex-col bg-gray-100 ">

      {/* 🔵 HEADER */}
      <div className="bg-blue-600 text-white px-3 py-2 font-semibold shrink-0">
        Logged in as : {username}
      </div>

      {/* 💬 CHAT MESSAGES (ONLY THIS SCROLLS) */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3   ">

        {chat.map((c, i) => {
          if (c.system) {
            return (
              <div key={i} className="text-center text-gray-500 text-sm">
                {c.message}
              </div>
            );
          }

          /* MY MESSAGE */
          if (c.user === username) {
            return (
              <div key={i} className="flex justify-end">
                <div className="bg-blue-500 text-white px-3 py-2 rounded-lg rounded-br-none max-w-[85%] break-words">
                  {c.message}
                </div>
              </div>
            );
          }

          /* OTHER USER MESSAGE */
          return (
            <div key={i} className="flex justify-start">
              <div className="bg-white border text-gray-800 px-3 py-2 rounded-lg rounded-bl-none max-w-[95%] break-words">
                <div className="text-xs font-semibold text-gray-500 mb-1">
                  {c.user}
                </div>
                {c.message}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* ⌨️ INPUT BAR */}
      <div className="bg-white border-t px-2 py-2 flex gap-2 shrink-0">
        <input
          type="text"
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 min-w-0 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 shrink-0"
        >
          Send
        </button>
      </div>

    </div>
  );
};

export default Chat;
