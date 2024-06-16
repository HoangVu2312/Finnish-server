const mongoose = require("mongoose");

const LessonSchema = mongoose.Schema(
  {
    //_id  => auto created by mongoose

    title: {
      type: String,
      required: [true, "Title is required"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    material: {
      type: String,
      required: [true, "file is required"],
    },

    video: {
      type: String, // Assuming you'll store the URL of the video (YouTube or Google Drive)
      required: [true, "Video (YouTube or Google Drive) is required"],
    },

    test: {
      type: Object, // You can store the test form data as an object
      required: [true, "Test data is required"],
    },

    // Reference to the course this lesson belongs to
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Reference to Course model
      required: true,
    },
  },
  { minimize: false }
);

module.exports = mongoose.model("Lesson", LessonSchema);
