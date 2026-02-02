
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