const router = require("express").Router();
const Course = require("../models/Course");
const User = require("../models/User");
const Notification = require("../models/Notification"); // use this schema

// Create a new enrolling resquest

router.post("/new-enrollment", async (req, res) => {
  const io = req.app.get("socketio");
  const { userId, courseId } = req.body;

  
  try {

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);


    if (!course) {
      return res.status(404).json("Course not found");
    }

    if (!user) {
      return res.status(404).json("Student not found");
    }

    // Check if the student is already enrolled in the course
    if (course.enrolledStudents.includes(userId)) {
      return res.status(400).json({ error: "Student is already enrolled in the course." });
    }



    // Create notification => send to admin
    const newNotification = new Notification({
      status: "unread",
      message: `New enroll request from ${user.name}`,
      course: courseId,
      studentId: userId,
      time: new Date(),
    });

    // Save the new notification
    await newNotification.save();

    io.sockets.emit("new-enroll-request", newNotification); // Send notification to teacher (real-time)

    // Add notification to teacher's account if user is not a teacher
    if (!user.isTeacher) {
      const teacher = await User.findOne({ isTeacher: true }); // Find admin user
      teacher.notifications.unshift(newNotification); // Add notification to admin's notifications (database)
      await teacher.save(); // Save admin user
    }

    res.status(200).json(newNotification);
  } catch (e) {
    res.status(400).json(e.message);
  }
});


// Simply change the status of notification to read
router.post("/:id/updateNotifications", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    user.notifications.forEach((notif) => {
      notif.status = "read";
    });
    //user.markModified("notifications");
    await user.save();

    // Update the status of notifications in the Notification schema
    await Notification.updateMany(
      { studentId: user._id },
      { $set: { status: "read" } }
    );
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
});


// retrieving all notifications for a specific user by their user ID
router.get("/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate('notifications.course notifications.studentId');
    if (!user) return res.status(404).json("User not found");
    res.status(200).json(user.notifications);
  } catch (e) {
    res.status(400).json(e.message);
  }
});


// Handle accept enrollment 
router.post('/accept-enrollment', async (req, res) => {
  const io = req.app.get('socketio');
  const { userId, courseId, studentId, notificationId } = req.body;

  try {
    const teacher = await User.findById(userId);
    const course = await Course.findById(courseId);
    const student = await User.findById(studentId);

    if (!teacher) {
      return res.status(404).json("Teacher not found");
    }

    if (!teacher.isTeacher) {
      return res.status(401).json("You don't have permission");
    }

    if (!course) {
      return res.status(404).json("Course not found");
    }

    if (!student) {
      return res.status(404).json("Student not found");
    }

    // Check if the student is already enrolled in the course
    if (course.enrolledStudents.includes(studentId)) {
      return res.status(400).json({ error: "Student is already enrolled in the course." });
    }

    // Add student to course database
    student.enrolledCourses.push(courseId);
    course.enrolledStudents.push(studentId);
    await student.save();
    await course.save();

    // Create notification => send to student
    const newNotification = new Notification({
      status: 'unread',
      message: `You got accepted!! Login again to access ${course.title}`,
      course: courseId,
      studentId: studentId,
      time: new Date(),
    });

    // Save the new notification
    await newNotification.save();

    io.sockets.emit('accept-enroll', newNotification, studentId);

    // Delete the notification new enroll-request => this should reload EnrollRequest component
    await Notification.findByIdAndDelete(notificationId);

    // Delete the notification from the teacher's notifications
    teacher.notifications = teacher.notifications.filter(
      (notification) => notification._id.toString() !== notificationId
    );
    await teacher.save();

    // Return teacher's notifications
    const teacherNotifications = teacher.notifications;

    res.status(200).json(teacherNotifications);
  } catch (e) {
    res.status(400).json(e.message);
  }
});



module.exports = router;
