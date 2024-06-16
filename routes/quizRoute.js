const express = require("express");
const router = express.Router();
const Quiz = require("../models/Quiz");
const User = require("../models/User");
const { verifyToken } = require("../authorization/authorization");


// Create a new quiz
router.post("/", verifyToken,  async (req, res) => {
  const { userId, courseId, questions } = req.body;

  const user = await User.findById(userId);
  const createdBy = user._id;

  try {
    const quiz = new Quiz({ courseId, questions, createdBy });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a quiz by courseId
router.get("/:courseId", verifyToken, async (req, res) => {
  const { courseId } = req.params;

  try {
    const quiz = await Quiz.findOne({ courseId }).sort({ createdAt: -1 }).limit(1);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Submit quiz answers
router.post("/submit", verifyToken, async (req, res) => {
  const { courseId, userId, score } = req.body;
  console.log("courseId, userId, score: ", courseId, userId, score)

  try {
    const user = await User.findById(userId);
    user.grades.set(courseId, score);
    await user.save();
    res.json({ user });
    console.log("answer accepted")
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
