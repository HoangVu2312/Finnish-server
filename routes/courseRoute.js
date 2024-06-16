const router = require("express").Router();
const Course = require("../models/Course");
const User = require("../models/User");
const { verifyToken } = require("../authorization/authorization");
const Lesson = require("../models/Lesson");
const fs = require("fs");

// get all course (Axios)
router.get("/all-courses", async (req, res) => {
  try {
    const sort = { _id: -1 }; // re-order course
    const courses = await Course.find().sort(sort);
    res.status(200).json(courses);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// Create a default course (RTK-querry)
router.post("/", verifyToken, async (req, res) => {
  try {
    // destruc data
    const { title, description, enrollmentDeadline } = req.body.course;
    const { userId } = req.body;
    const user = await User.findById(userId); // without await => this return a querry
    if (!user.isTeacher)
      return res.status(401).json("You don't have permission");

    await Course.create({ title, description, enrollmentDeadline });
    const courses = await Course.find();
    res.status(201).json(courses);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// delete a course based on id
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.body.userId;

    const user = await User.findById(userId);
    // Check if the user is authorized to delete the course
    if (!user.isTeacher) {
      return res.status(401).json("You don't have permission");
    }

    // Find the course by ID
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find all lessons associated with the course
    const lessons = await Lesson.find({ course: courseId });

    // Delete each lesson and remove associated PDF files
    for (const lesson of lessons) {
      // Remove the associated PDF file from the filesystem
      fs.unlinkSync(`./material_files/${lesson.material}`);
      // Delete the lesson from the database
      await Lesson.findByIdAndDelete(lesson._id);
    }

    // Delete the course itself
    await Course.findByIdAndDelete(courseId);

    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

module.exports = router;
