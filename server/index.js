const express = require("express");
require("dotenv").config();
const cors = require("cors");
const router = require("./routes/AuthRoutes");
const messageRouter = require("./routes/MessageRoutes");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads/images", express.static("uploads/images"));
app.use("/uploads/recordings", express.static("uploads/recordings"));

app.use("/api/auth", router);
app.use("/api/messages", messageRouter);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const start = async () => {
  try {
    server.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};
start();

const io = new Server(server, { cors: { origin: "http://localhost:3000" } });

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", ({ userId }) => {
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("online-users", {
      onlineUsers: onlineUsers,
    });
  });

  socket.on("signout", ({ id }) => {
    onlineUsers.delete(id);
    socket.broadcast.emit("online-users", {
      onlineUsers: onlineUsers,
    });
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket
        .to(sendUserSocket)
        .emit("msg-recieve", { from: data.from, message: data.message });
    }
  });
  socket.on("outgoing-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-voice-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });
  socket.on("outgoing-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("incoming-video-call", {
        from: data.from,
        roomId: data.roomId,
        callType: data.callType,
      });
    }
  });
  socket.on("reject-voice-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("voice-call-rejected");
    }
  });
  socket.on("reject-video-call", (data) => {
    const sendUserSocket = onlineUsers.get(data.from);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("video-call-rejected");
    }
  });
  socket.on("accept-incoming-call", ({ id }) => {
    const sendUserSocket = onlineUsers.get(id);
    socket.to(sendUserSocket).emit("accept-call");
  });

  socket.on(
    "message-readed",
    ({ message_id, to, currentChatUser, from, message }) => {
      const sendUserSocket = onlineUsers.get(to);
      socket.to(sendUserSocket).emit("message-readed-feedback", {
        message_id: message_id,
        currentChatUser: currentChatUser,
        from: from,
        message: message,
      });
    }
  );

  socket.on("update-message-status", ({ from, to, message }) => {
    const sendUserSocket = onlineUsers.get(to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("message-status-update", {
        from: from,
        message: message,
      });
    }
  });

  socket.on("message-update", ({ from, to, message }) => {
    const sendUserSocket = onlineUsers.get(to);
    socket.to(sendUserSocket).emit("updating_about_message", {
      from: from,
      message: message,
    });
  });

  socket.on("user_readed_message", ({ from, to, message }) => {
    const sendUserSocket = onlineUsers.get(to);
    socket.to(sendUserSocket).emit("updating_recieving_user", {
      from: from,
      message: message,
    });
  });
});
