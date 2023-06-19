require("dotenv").config();
const http = require("http");
const app = require("./application/app");
const socketIoService = require("./application/socket-io");

const server = http.createServer(app);

socketIoService.init(server);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server running on port ${port}`));
