const router = require("express").Router();
const Course = require("../models/Course");
const User = require("../models/User");
const Lesson = require("../models/Lesson");
const multer = require("multer");
const { verifyToken } = require("../authorization/authorization");

// custom destination and files name
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./material_files"); // from server not this file
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});
const upload = multer({ storage: storage }); // upload pdf

// Create a default lesson (axios)
router.post(
  "/new-lesson",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    // destruc data
    const title = req.body.title;
    const description = req.body.description;
    const video = req.body.video;
    const test = req.body.test;
    const userId = req.body.userId;
    const courseId = req.body.courseId;
    const fileName = req.file.filename;

    const user = await User.findById(userId); // without await => this return a querry
    const course = await Course.findById(courseId);

    if (!user.isTeacher) {
      return res.status(401).json("You don't have permission");
    }

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    try {
      // Create the lesson
      const lesson = await Lesson.create({
        title,
        description,
        material: fileName,
        video,
        test,
        course: courseId,
      });

      // Add the lesson ID to the course's lessons array
      course.lessons.push(lesson._id);
      await course.save();

      const lessons = await Lesson.find({ course: courseId });
      res.status(200).json({ status: "ok", lessons });
    } catch (e) {
      res.status(400).send(e.message);
    }
  }
);

// get all lessons of one course (Axios)
router.get("/:courseId", verifyToken, async (req, res) => {
  try {
    const courseId = req.params.courseId;

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Find all lessons belonging to the course
    const lessons = await Lesson.find({ course: courseId });
    res.status(200).json(lessons);
  } catch (e) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const fs = require("fs");

// Define a route to handle lesson deletion
router.delete("/:lessonId", verifyToken, async (req, res) => {
  const lessonId = req.params.lessonId;
  const userId = req.body.userId;

  const user = await User.findById(userId);
  // Check if the user is authorized to delete the course
  if (!user.isTeacher) {
    return res.status(401).json("You don't have permission");
  }

  try {
    // Find the lesson by ID
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    // Remove the associated PDF file from the filesystem
    fs.unlinkSync(`./material_files/${lesson.material}`);

    // Delete the lesson from the database
    await Lesson.findByIdAndDelete(lessonId);

    // Update the course's lessons array
    const courseId = lesson.course;
    const course = await Course.findById(courseId);
    if (course) {
      course.lessons = course.lessons.filter(
        (lesson) => lesson.toString() !== lessonId
      );
      await course.save();
    }

    const lessons = await Lesson.find();

    // Return success response
    res.status(200).json(lessons);
  } catch (error) {
    // Handle errors
    console.error("Error occurred while deleting lesson:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
