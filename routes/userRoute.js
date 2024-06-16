const router = require("express").Router();
const User = require("../models/User");
const Notification = require("../models/Notification");
const { verifyToken } = require("../authorization/authorization");
const jwt = require("jsonwebtoken");

// signup
router.post("/signup", async (req, res) => {
  // destruct data from request body
  const { name, email, password, avatar } = req.body;

  try {
    // directly create new User from data received and send back that new User
    const user = await User.create({ name, email, password, avatar }); // create is bult-in function

    //create token for user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (e) {
    // check if User alrady exist
    if (e.code === 11000) return res.status(400).send("Email already exists");

    // send server error
    res.status(400).send(e.message);
  }
});

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    // get that user from db based on received email + password
    const user = await User.findByCredentials(email, password); // manually define function in User model

    //create token for user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get all student
router.get("/students", verifyToken, async (req, res) => {
  try {
    const students = await User.find({ isTeacher: false });
    res.json(students);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// delete a student
router.delete("/:studentId", verifyToken, async (req, res) => {
  const studentId = req.params.studentId;
  const userId = req.body.userId;

  const user = await User.findById(userId);
  // Check if the user is authorized to delete the course
  if (!user.isTeacher) {
    return res.status(401).json("You don't have permission");
  }

  try {
    // Delete the lesson from the database
    await User.findByIdAndDelete(studentId);

    // delete the id out od course too

    const students = await User.find({ isTeacher: false });

    // Return success response
    res.status(200).json(students);
  } catch (error) {
    // Handle errors
    console.error("Error occurred while deleting student:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// send message to teacher (admin)
router.post("/message", async (req, res) => {
  const io = req.app.get("socketio");
  const { fullName, email } = req.body;

  try {
    const teacher = await User.findOne({ isTeacher: true }); // Get the single teacher


    if (!teacher.isTeacher) {
      return res.status(404).json("You dont have permission");
    }

    if (!teacher) return res.status(404).json("User not found");

    // Create notification
    const newNotification = new Notification({
      status: "unread",
      message: `New message from ${fullName}, email: ${email}`,
      time: new Date(),
    });

    // Save the new notification
    await newNotification.save();

    // Emit notification to the teacher
    io.sockets.emit("new-message", newNotification); // Emit the notification

    // Save message in teacher's messages
    teacher.messages.unshift(newNotification); // change this ???
    await teacher.save();

    res.status(200).json({teacher});
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//  get all the message for admin
router.get("/teacher-message/:userId", verifyToken, async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);

    if (!user.isTeacher) {
      return res.status(404).json("You dont have permission");
    }

    if (!user) return res.status(404).json("User not found");
    res.status(200).json(user.messages);
  } catch (e) {
    res.status(400).json(e.message);
  }
});

// change user avatar url
router.put("/avatar", verifyToken, async (req, res) => {
  const { userId, avatarUrl } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json("User not found");

    user.avatar.url = avatarUrl;
    await user.save();

    res.status(200).json(user); 
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;



