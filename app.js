require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // 允許所有源進行連接
    methods: ["GET", "POST"], // 允許的請求方式
  },
});

// 保存所有已連線的客戶端
let clients = {};

io.on("connection", (socket) => {
  // 在使用者連線時接收他們的用戶名
  let userName = socket.handshake.auth.userName || "";
  if (userName) {
    clients[userName] = socket;
    socket.userName = userName;
  } else {
    clients[socket.id] = socket;
    socket.userName = socket.id;
  }
  // 計算在線人數
  let onlineCount = io.engine.clientsCount;

  socket.emit("connectStatus", { status: "connected", message: `${userName}已連線` });

  // 廣播新用戶連接訊息給其他用戶 (但是自己不會收到)
  socket.broadcast.emit("broadcast", { message: `新使用者${userName}上線囉，共${onlineCount}人在線` });
  //   io.emit("broadcast", { message: `新使用者${userName}已連線，共${onlineCount}人在線` });

  // 在接收到廣播訊息時
  socket.on("broadcastMsg", (data) => {
    const { message } = data;
    io.emit("broadcastMsg", { userName: socket.userName, message, createAt: new Date() });
  });

  // 在接收到私人訊息時
  socket.on("privateMsg", (data) => {
    const { friendName, message } = data;
    const targetSocket = clients[friendName];
    io.emit("privateMsg", { userName: socket.userName, message: "有一則新訊息", createAt: new Date() });
    if (targetSocket) {
      targetSocket.emit("privateMsg", { userName: socket.userName, message, createAt: new Date() });
      socket.emit("privateMsg", { userName: socket.userName, message, createAt: new Date() });
    } else {
      socket.emit("privateMsg", { userName: "系統", message: `對方(${friendName})已離線`, createAt: new Date() });
    }
  });

  // 當用戶離線
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    // 從客戶端列表移除
    if (socket.userName) {
      delete clients[socket.userName];
      // 廣播有用戶離線的訊息給其他用戶
      socket.broadcast.emit("broadcast", { message: `${socket.userName}已離線` });
    }
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));
