const cron = require("node-cron");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Course = require("../models/Course");
const UserDeletionLog = require("../models/UserDeletionLog");
const CourseProgress = require("../models/CourseProgress");

// Schedule: every day at 1:00 AM
exports.scheduleUserDeletionJob = () => {
    cron.schedule("0 1 * * *", async () => {
        const now = new Date();
        // console.log("Current date for deletion check:", now);
        try {
            // deletionScheduledAt timestamp is less than or equal to the current time.
            const usersToDelete = await User.find({
                isDeleted: true,
                // deletionScheduledAt: { $type: "date", $lte: now },
                deletionScheduledAt: { $lte: now },
            });

            for (const user of usersToDelete) {

                // Delete user profile
                await Profile.findByIdAndDelete(user.additionalDetails);

                // Remove user from courses and collect course names
                const removedCourses = [];

                for (const courseId of user.courses) {
                    const course = await Course.findByIdAndUpdate(
                        courseId,
                        { $pull: { studentsEnrolled: user._id } },
                        { new: true }
                    );

                    if (course && course.courseName) {
                        removedCourses.push(course.courseName);
                    }
                }

                // Log deletion BEFORE removing the user
                await UserDeletionLog.create({
                    userId: user._id,
                    email: user.email,
                    deletedAt: new Date(),
                    reason: `Scheduled deletion for ${user.accountType} after soft-delete after 3 days of inactivity`,
                    courses: removedCourses,
                });

                // Finally delete the user
                await User.findByIdAndDelete(user._id);
                console.log(`Deleted user: ${user.email}`);
                await CourseProgress.deleteMany({ userId: user._id })
            }

            console.log("Daily cleanup completed.");
        } catch (error) {
            console.error("Error running deletion job:", error);
        }
    })
}