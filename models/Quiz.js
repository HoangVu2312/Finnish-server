const mongoose = require("mongoose");

const QuizSchema = mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
  },
  questions: [
    {
      type: { type: String, required: true },
      question: { type: String, required: true },
      options: [String],
      answer: { type: mongoose.Schema.Types.Mixed, required: true }
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const Quiz = mongoose.model("Quiz", QuizSchema);
module.exports = Quiz;
