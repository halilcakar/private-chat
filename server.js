const { host, PORT, SOCKET_PORT, APP_ENV, SSL } = require("./src/config");
console.clear();
const { UUID, Last } = require("./src/functions");
const express = require("express");
const app = express();
const path = require("path");
app
  .use(express.static(path.join(__dirname, "public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"));

let protocol = "http";
let options = {};
if (APP_ENV === "production") {
  protocol = "https";
  options = {
    key: fs.readFileSync(SSL.KEY),
    cert: fs.readFileSync(SSL.CERT),
  };
}

const server = require("http").createServer(options, app);
const io = require("socket.io")(server);

const channels = [];

io.on("connection", (socket) => {
  socket.on("createChannel", ({ username }, callback) => {
    let channel = {
      id: UUID(),
      creator: username,
      creatorID: socket.id,
      messages: [],
    };
    channels.push(channel);
    socket.join(channel.id);
    if (callback) {
      callback(channel);
      process.nextTick(() => (channel = null));
    }
  });

  socket.on("joinChannel", ({ username, channelID }, callback) => {
    let channel = channels.find((ch) => ch.id === channelID);
    if (!channel) {
      return callback("Provided channel cannot find!", false);
    }
    if (channel && channel.visitor) {
      return callback("Channel is full! :(", false);
    }
    channel.visitor = username;
    channel.visitorID = socket.id;
    socket.join(channel.id);
    io.in(channel.creatorID).emit("userJoined", username);
    if (callback) {
      callback(channel);
      process.nextTick(() => (channel = null));
    }
  });

  socket.on("newMessage", ({ id, message }) => {
    if (!id) {
      return;
    }
    if (!message || message === "") {
      return;
    }
    let channel = channels.find((ch) => ch.id === id);

    if (channel) {
      channel.messages.push({
        userID: socket.id,
        message,
      });

      io.in(channel.id).emit("broadcastMessage", Last(channel.messages));
      process.nextTick(() => (channel = null));
    }
  });

  socket.on("leaveChannel", (channelID) => {
    let channel = channels.find((ch) => ch.id === channelID);
    if (channel) {
      if (channel.creatorID === socket.id) {
        channel.creator = null;
        channel.creatorID = null;
      }
      if (channel.visitorID === socket.id) {
        channel.visitor = null;
        channel.visitorID = null;
      }
      io.in(channel.id).emit("userLeft");

      if (channel.visitor === null && channel.creator === null) {
        channels.splice(channels.indexOf(channel), 1);
        process.nextTick(() => (channel = null));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on ${protocol}://${host}:${PORT}`);
});
