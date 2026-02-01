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
    if (socket.username) {
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
