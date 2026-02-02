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



