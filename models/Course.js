const mongoose = require("mongoose");

const CourseSchema = mongoose.Schema(
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

    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson", // Reference to Lesson model
      },
    ],

    enrollmentDeadline: {
      type: Date,
      required: [true, "Enrollment deadline is required"],
    },

    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to User model for students
      },
    ],
  },

  { minimize: false }
);

const course = mongoose.model("Course", CourseSchema);

module.exports = course;
