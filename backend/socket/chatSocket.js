const { Server } = require("socket.io");

const initializeSocketServer = (server) => {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("setup", (userData) => {
      if (!userData || !userData._id) {
        return;
      }

      socket.data.userId = userData._id.toString();
      socket.join(socket.data.userId);
      socket.emit("connected");
    });

    socket.on("join room", (roomId) => {
      if (!roomId) {
        return;
      }

      socket.join(roomId);
    });

    socket.on("leave room", (roomId) => {
      if (!roomId) {
        return;
      }

      socket.leave(roomId);
    });

    socket.on("typing", (roomId) => {
      if (!roomId) {
        return;
      }

      socket.to(roomId).emit("typing", roomId);
    });

    socket.on("stop typing", (roomId) => {
      if (!roomId) {
        return;
      }

      socket.to(roomId).emit("stop typing", roomId);
    });

    socket.on("send message", (newMessageReceived) => {
      const chat = newMessageReceived?.chat;
      const senderId = newMessageReceived?.sender?._id?.toString();

      if (!chat || !Array.isArray(chat.users)) {
        console.log("Unable to route socket message: chat users missing");
        return;
      }

      chat.users.forEach((user) => {
        const userId = user?._id?.toString ? user._id.toString() : user?.toString();

        if (!userId || userId === senderId) {
          return;
        }

        io.to(userId).emit("receive message", newMessageReceived);
      });
    });

    socket.on("disconnect", () => {
      if (socket.data.userId) {
        socket.leave(socket.data.userId);
      }

      console.log("USER DISCONNECTED");
    });
  });

  return io;
};

module.exports = { initializeSocketServer };
