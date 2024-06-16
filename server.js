const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
require("dotenv").config();
// const { verifyToken } = require("./authorization/authorization");
const mongoose = require("mongoose");

app.use("/material_files", express.static("material_files")); // => make the pdf file accessable

require("./connection"); // only need to import so database connection can be used in any other files
const server = http.createServer(app); // express server
const { Server } = require("socket.io"); // socketio server

// connect socket io server vs express server and allow internal connection
const io = new Server(server, {
  cors: {
    origin: "https://finnishwithbella.onrender.com",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  },
});

// configuration
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Import required routes
const userRoutes = require("./routes/userRoute");
const courseRoutes = require("./routes/courseRoute");
const cloudinaryRoutes = require("./routes/cloudinaryRoute");
const lessonRoutes = require("./routes/lessonRoute");
const notificationRoutes = require("./routes/notificationRoute");
const quizRoutes = require("./routes/quizRoute");
const articleRoutes = require("./routes/articleRoute");

// Defining routes for the app:
app.use("/users", userRoutes);
app.use("/courses", courseRoutes);
app.use("/images", cloudinaryRoutes);
app.use("/lessons", lessonRoutes);
app.use("/notifications", notificationRoutes);
app.use("/quizzes", quizRoutes);
app.use("/articles", articleRoutes);

// Import and initialize the dice game
const { initializeGame } = require('./games/diceGame');
initializeGame(io);

// Import and initialize the drawing game
const { initializeDrawingGame } = require('./games/drawingGame');
initializeDrawingGame(io);

// run server
server.listen(4000, () => {
  console.log("server running at port", 4000);
});

app.set("socketio", io);

//-------------nofication --------------//
let onlineUsers = [];

const addNewUser = (username, socketId) => {
  !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};


/// ??
const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

io.on("connection", (socket) => {
  console.log("a user is connected");

  socket.on("newUser", (username) => {
    addNewUser(username, socket.id);
  });

  socket.on("accept-enroll", (msgObj, studentId) => {
    io.emit("accept-enroll", msgObj, studentId);
  });

  socket.on("new-enroll-request", (msgObj) => {
    io.emit("new-enroll-request", msgObj);
  });

  socket.on("new-message", (msgObj) => {
    io.emit("new-message", msgObj);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});







