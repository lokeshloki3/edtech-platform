const Profile = require("../models/Profile");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Course = require("../models/Course")
const CourseProgress = require("../models/CourseProgress")
// const { convertSecondsToDuration } = require("../utils/secToDuration");
const { calculateTotalDuration } = require("../utils/courseDuration");

exports.updateProfile = async (req, res) => {
    try {
        // get data
        const {
            firstName = "",
            lastName = "",
            dateOfBirth = "",
            about = "",
            contactNumber = "",
            gender = "",
        } = req.body;
        // get userId - attached by decode in middleware to req
        const id = req.user.id; // id authentication middleware sets req.user
        // validation
        if (!contactNumber || !gender || !id || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        // find profile by id
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);

        const user = await User.findByIdAndUpdate(id, {
            firstName,
            lastName,
        })
        await user.save();

        // update profile - used save here instead of create as Profile data is already there with null values
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();

        // Find the updated user details
        const updatedUserDetails = await User.findById(id)
            .populate("additionalDetails")
            .exec()

        // return response
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            updatedUserDetails, // donot send contact number in response
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User cannot be updated",
            error: error.message,
        });
    }
}

// // deleteAccount for student (not Admin)
// // Explore -> How can we schedule this deletion operation say after 5 days - cron jobs
// exports.deleteAccount = async (req, res) => {
//     try {
//         // TODO: Find More on Job Schedule
//         // const job = schedule.scheduleJob("10 * * * * *", function () {
//         // 	console.log("The answer to life, the universe, and everything!");
//         // });
//         // console.log(job);

//         // get id - middleware decode
//         const id = req.user.id;
//         console.log("Printing id", id);
//         // validation
//         const userDetails = await User.findById(id);
//         if (!userDetails) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found",
//             });
//         }
//         // delete profile
//         await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });

//         // also do - unenroll user student from all the enrolled courses - not teacher as course will remain even after teacher leaves
//         for (const courseId of userDetails.courses) {
//             await Course.findByIdAndUpdate(
//                 courseId,
//                 { $pull: { studentsEnrolled: id } },
//                 { new: true }
//             )
//         }

//         // now delete user
//         await User.findByIdAndDelete({ _id: id });

//         // return response
//         return res.status(200).json({
//             success: true,
//             message: "User deleted successfully",
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "User cannot be deleted",
//         });
//     }
// }

exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.id;
        console.log("Delete requested for user:", id);

        const user = await User.findById({ _id: id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Soft delete: schedule for deletion in 3 days
        user.isDeleted = true;
        user.deletionScheduledAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days
        await user.save();

        res.status(200).json({
            success: true,
            message: "Account scheduled for deletion in 3 days. Log in before then to cancel.",
        });

    } catch (error) {
        console.error("Error scheduling account deletion:", error);
        res.status(500).json({
            success: false,
            message: "Could not schedule account for deletion",
        });
    }
};

exports.getAllUserDetails = async (req, res) => {
    try {
        // get id
        const id = req.user.id;

        // validation and get user details - User has only Profile id(additionalDetails), to have Profile data need to populate and exec it
        const userDetails = await User.findById(id).populate("additionalDetails").exec();

        // return response
        return res.status(200).json({
            success: true,
            message: "User data fetched successfully",
            data: userDetails,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "User cannot be fetch",
            error: error.message,
        });
    }
}


exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture;
        const userId = req.user.id;
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME, // folder name on Cloudinary
            1000,
            1000
        )
        console.log(image)
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url },
            { new: true }
        )
        res.send({
            success: true,
            message: "Image Updated successfully",
            data: updatedProfile,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.user.id;
        let userDetails = await User.findOne({
            _id: userId,
        })
            .populate({
                path: "courses",
                populate: {
                    path: "courseContent",
                    populate: {
                        path: "subSection",
                    },
                },
            })
            .exec()

        userDetails = userDetails.toObject();
        for (var i = 0; i < userDetails.courses.length; i++) {
            const course = userDetails.courses[i];

            // helper function in utils created
            course.totalDuration = calculateTotalDuration(course.courseContent);

            // Count all sub-sections
            const SubsectionLength = course.courseContent.reduce((acc, section) => {
                return acc + (section.subSection?.length || 0);
            }, 0);

            let courseProgressCount = await CourseProgress.findOne({
                courseID: course._id,
                userId: userId,
            })
            courseProgressCount = courseProgressCount?.completedVideos.length || 0;
            
            if (SubsectionLength === 0) {
                course.progressPercentage = 100
            } else {
                // To make it up to 2 decimal point
                const multiplier = Math.pow(10, 2)
                course.progressPercentage =
                    Math.round(
                        (courseProgressCount / SubsectionLength) * 100 * multiplier
                    ) / multiplier
            }
        }

        // userDetails = userDetails.toObject()
        // var SubsectionLength = 0
        // for (var i = 0; i < userDetails.courses.length; i++) {
        //     let totalDurationInSeconds = 0
        //     SubsectionLength = 0
        //     for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
        //         totalDurationInSeconds += userDetails.courses[i].courseContent[
        //             j
        //         ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
        //         userDetails.courses[i].totalDuration = convertSecondsToDuration(
        //             totalDurationInSeconds
        //         )
        //         SubsectionLength +=
        //             userDetails.courses[i].courseContent[j].subSection.length
        //     }
        //     let courseProgressCount = await CourseProgress.findOne({
        //         courseID: userDetails.courses[i]._id,
        //         userId: userId,
        //     })
        //     courseProgressCount = courseProgressCount?.completedVideos.length
        //     if (SubsectionLength === 0) {
        //         userDetails.courses[i].progressPercentage = 100
        //     } else {
        //         // To make it up to 2 decimal point
        //         const multiplier = Math.pow(10, 2)
        //         userDetails.courses[i].progressPercentage =
        //             Math.round(
        //                 (courseProgressCount / SubsectionLength) * 100 * multiplier
        //             ) / multiplier
        //     }
        // }

        if (!userDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find user with id: ${userDetails}`,
            })
        }
        return res.status(200).json({
            success: true,
            data: userDetails.courses,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
};

exports.instructorDashboard = async (req, res) => {
    try {
        const courseDetails = await Course.find({ instructor: req.user.id });

        const courseData = courseDetails.map((course) => {
            const totalStudentsEnrolled = course.studentsEnrolled.length
            const totalAmountGenerated = totalStudentsEnrolled * course.price

            // Create a new object with the additional fields
            const courseDataWithStats = {
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                // Include other course properties as needed
                totalStudentsEnrolled,
                totalAmountGenerated,
            }

            return courseDataWithStats
        })

        res.status(200).json({ courses: courseData })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server Error" })
    }
}
