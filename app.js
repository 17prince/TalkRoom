const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/user");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botname = "TalkRoom Bot";
// Set static forlder
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome current user(for single user(when it connects))
    socket.emit("message", formatMessage(botname, "Welcome To Talk Room"));

    // Brodcast when a user connects (for all user)
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botname, `${username} has joined the chat`)
      );

    //   Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Listen for chatMessage
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });
  // Runs when clinet disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botname, `${user.username} has left chat`)
      );
    }
  });
});

const PORT = 1714 || process.env.PORT;
server.listen(PORT, () => console.log("Server running on port", PORT));
