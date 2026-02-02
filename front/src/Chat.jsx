import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:8008");

const Chat = ({ username }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const bottomRef = useRef(null);


  useEffect(() => {
    /*    Emit join ONLY once when component mounts */
    socket.emit("join", username);

    /*  receiveMessage can be:
       - single message object
       - OR array of system messages (existing users) */

    socket.on("receiveMessage", (data) => {
      if (Array.isArray(data)) {
        // existing users list (shown only once)
        setChat(data);
      } else {
        // normal single message
        setChat((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
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
    <div className="flex flex-col h-[95vh] bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-2 text-lg font-semibold">
        Logged in as : {username}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {chat.map((c, i) => {
          if (c.system) {
            return (
              <div key={i} className="text-center text-gray-500 text-sm">
                {c.message}
              </div>
            );
          }

          // 👇 MY MESSAGE (RIGHT SIDE)
          if (c.user === username) {
            return (
              <div key={i} className="flex justify-end">
                <div className="bg-blue-500 text-white px-4 py-2 rounded-lg rounded-br-none max-w-[70%]">
                  {c.message}
                </div>
              </div>
            );
          }

          // 👇 OTHER USER MESSAGE (LEFT SIDE)
          return (
            <div key={i} className="flex justify-start">
              <div className="bg-white border text-gray-800 px-4 py-2 rounded-lg rounded-bl-none max-w-[70%]">

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

      {/* Input */}
      <div className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={message}
          placeholder="Type a message..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;



