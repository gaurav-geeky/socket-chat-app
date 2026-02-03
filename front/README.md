
# chat

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


# index .js 


const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {
    socket.username = username;

    io.emit("receiveMessage", {
      system: true,
      message: `${username} joined the chat`,  // user join message 
    });
  });

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", {
      user: socket.username,
      message: data.message,  // chat message
    });
  }); 
 
  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("receiveMessage", {
        system: true,
        message: `${socket.username} left the chat`,  // user left chat
      });
    }
    console.log("User disconnected:", socket.id);
  });
});

server.listen(8008, () => {
  console.log("Server running at http://localhost:8008");
});


# chat useEffect

  useEffect(() => {
    socket.emit("join", username);

    socket.on("receiveMessage", (data) => {
      setChat((prev) => [...prev, data]);
    });

    return () => socket.off("receiveMessage");
  }, [username]);

##  useEffect 2 chat
    useEffect(() => {
    /*    Emit join ONLY once when component mounts */
    socket.emit("join", username);

    /*  receiveMessage can be:
       - single message object
       - OR array of system messages (existing users) */

    socket.on("receiveMessage", (data) => {
      if (Array.isArray(data)) {
        // existing users list (shown only once)
        setChat((prev) => [...prev, ...data]);
      } else {
        // normal single message
        setChat((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [username]);



  ## index.js backend 

  const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

/*  Store active users on server
   (so we know who already joined) */
const activeUsers = new Set();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (username) => {

    /* Prevent duplicate join for same socket
       (tab refresh / reconnect issue)  */
    if (socket.username) return;

    socket.username = username;

    /* Send existing users ONLY to the NEW user
       (so new user knows who is already in chat)  
       socket.emit only to that user */
    socket.emit(
      "receiveMessage",
      Array.from(activeUsers).map((user) => ({
        system: true,
        message: `${user} already in the chat`,
      }))
    );

    /* Add user to active users list */
    activeUsers.add(username);

    /*  Broadcast ONLY the NEW join to everyone 
    io.emit means to everyone */
    io.emit("receiveMessage", {
      system: true,
      message: `${username} joined the chat`,
    });
  });

  socket.on("sendMessage", (data) => {
    io.emit("receiveMessage", {
      user: socket.username,
      message: data.message,
    });
  });

  socket.on("disconnect", () => {

    /* Remove user from active list on disconnect */
    if (socket.username) {
      activeUsers.delete(socket.username);

      io.emit("receiveMessage", {
        system: true,
        message: `${socket.username} left the chat`,
      });
    }

    console.log("User disconnected:", socket.id);
  });
});


server.listen(8008, () => {
  console.log("Server running at http://localhost:8008");
});



## chat  repeat user join message 
socket.on("receiveMessage", (data) => {
      if (Array.isArray(data)) {
        // existing users list (shown only once)
        setChat((prev) => [...prev, ...data]);
      } else {
        // normal single message
        setChat((prev) => [...prev, data]);
      }
    });






## chat new 

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
    <div className="w-full min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-2 text-lg font-semibold">
        Logged in as : {username}
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 w-full">

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



