const socketIo = require("socket.io");

function init(server) {
  const io = socketIo(server, {
    cors: {
      origin: "*", // replace with your application's URL. http://localhost:3000
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected");
    socket.on("message", (data) => {
      console.log("Message received: ", data);
      io.emit("message", data); // Broadcast the message to all clients
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
}

module.exports = { init };
