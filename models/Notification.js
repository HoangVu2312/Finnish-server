const mongoose = require("mongoose");

const NotificationSchema = mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ["read", "unread"],
    },
    message: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    time: {
      type: Date,
      required: true,
    },
  },
  { minimize: false },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
