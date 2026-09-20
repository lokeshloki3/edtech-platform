const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const CourseProgress = require("../models/CourseProgress");
const RatingAndReview = require("../models/RatingAndReview");
// const { convertSecondsToDuration } = require("../utils/secToDuration");
const { calculateTotalDuration } = require("../utils/courseDuration");

exports.createCourse = async (req, res) => {
    try {

        const userId = req.user.id; // user.decode in user in middleware

        // fetch data
        const { courseName, courseDescription, whatYouWillLearn, price, tag: _tag, category, status, instructions: _instructions } = req.body; // category is id in course schema

        // get thumbnail image from request files
        const thumbnail = req.files.thumbnailImage;

        // Convert the tag and instructions from stringified Array to Array
        const tag = JSON.parse(_tag);
        const instructions = JSON.parse(_instructions);

        console.log("tag", tag)
        console.log("instructions", instructions)

        // validation
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length || !thumbnail || !category || !instructions.length) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        // let courseStatus = status || "Draft";
        if (!status || status === undefined) {
            status = "Draft"
        }

        // Check if the user is an instructor
        // check for instructor by getting object id from db(other method) using user id of intsructor is there in req body used in middleware(other method)
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        });
        console.log("Instructor Details: ", instructorDetails);

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details not found",
            });
        }

        // check given category is valid or not - get object id of category, user id of category in req body
        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category Details not found",
            });
        }

        // upload Image to Cloudinary - Folder name of cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME); // folder name on Cloudinary

        // create an entry for new Course
        // in course - instructor id is stored so required that so db call above is used
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn: whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id, // or req body also have this
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions,
        });

        // add the new course to the user schema of Instructor
        await User.findByIdAndUpdate(
            { _id: instructorDetails._id },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        );

        // update the Category schema also
        // Add the new course to the Categories
        const categoryDetails2 = await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    courses: newCourse._id,
                }
            },
            { new: true },
        );
        console.log("categoryDetails2", categoryDetails2);

        // return response
        return res.status(200).json({
            success: true,
            message: "Course created successfully",
            data: newCourse,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to created course",
            error: error.message,
        });
    }
};

// Edit Course Details
exports.editCourse = async (req, res) => {
    try {
        const { courseId } = req.body
        const updates = req.body
        const course = await Course.findById(courseId)

        if (!course) {
            return res.status(404).json({ error: "Course not found" })
        }

        // If Thumbnail Image is found, update it
        if (req.files) {
            console.log("thumbnail update")
            const thumbnail = req.files.thumbnailImage
            const thumbnailImage = await uploadImageToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            course.thumbnail = thumbnailImage.secure_url
        }

        // Update only the fields that are present in the request body
        for (const key in updates) {
            if (updates.hasOwnProperty(key)) {
                if (key === "tag" || key === "instructions") {
                    course[key] = JSON.parse(updates[key])
                } else {
                    course[key] = updates[key]
                }
            }
        }

        await course.save()

        const updatedCourse = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        res.json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}

// getAllCourses handler function

exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            { status: "Published" },
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
            }).populate("instructor").exec();
        return res.status(200).json({
            success: true,
            message: "Data for courses fetched successfully",
            data: allCourses,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch course data",
            error: error.message,
        });
    }
}

// getAllCourseDetails - Get One Single Course Details
exports.getCourseDetails = async (req, res) => {
    try {
        // get id
        const { courseId } = req.body;

        // find complete course details - nested populate
        const courseDetails = await Course.findOne(
            { _id: courseId })
            .populate(
                {
                    path: "instructor", // instructor is user and additionalDetails id(Profile id) is in user
                    populate: {
                        path: "additionalDetails",
                    },
                }
            )
            .populate("category")
            .populate("ratingAndReviews")
            .populate(
                {
                    path: "courseContent", // courseContent is Section and subSection Id is there in Section
                    populate: {
                        path: "subSection",
                        select: "-videoUrl",
                    },
                }
            )
            .exec();
        // validation
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find the course with ${courseId}`,
            });
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        // let totalDurationInSeconds = 0
        // courseDetails.courseContent.forEach((content) => {
        //     content.subSection.forEach((subSection) => {
        //         const timeDurationInSeconds = parseInt(subSection.timeDuration)
        //         totalDurationInSeconds += timeDurationInSeconds
        //     })
        // })

        // const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        // Created helper function to Calculate this
        const totalDuration = calculateTotalDuration(courseDetails.courseContent);

        // return response
        return res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            data: {
                courseDetails,
                totalDuration,
            },
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

exports.getFullCourseDetails = async (req, res) => {
    try {
        const { courseId } = req.body
        const userId = req.user.id
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        let courseProgressCount = await CourseProgress.findOne({
            courseID: courseId,
            userId: userId,
        })

        console.log("courseProgressCount : ", courseProgressCount)

        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: `Could not find course with id: ${courseId}`,
            })
        }

        // if (courseDetails.status === "Draft") {
        //   return res.status(403).json({
        //     success: false,
        //     message: `Accessing a draft course is forbidden`,
        //   });
        // }

        // let totalDurationInSeconds = 0
        // courseDetails.courseContent.forEach((content) => {
        //     content.subSection.forEach((subSection) => {
        //         const timeDurationInSeconds = parseInt(subSection.timeDuration)
        //         totalDurationInSeconds += timeDurationInSeconds
        //     })
        // })

        // const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

        // Created helper function to Calculate this
        const totalDuration = calculateTotalDuration(courseDetails.courseContent);

        return res.status(200).json({
            success: true,
            data: {
                courseDetails,
                totalDuration,
                completedVideos: courseProgressCount?.completedVideos
                    ? courseProgressCount?.completedVideos
                    : [],
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
    try {
        // Get the instructor ID from the authenticated user or request body
        const instructorId = req.user.id

        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({
            instructor: instructorId,

        })
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .sort({ createdAt: -1 })
            .exec()

        // // Add totalDuration to each course object
        instructorCourses.forEach((course) => {
            const totalDuration = calculateTotalDuration(course.courseContent);
            course._doc.totalDuration = totalDuration; // Add new property to the raw document
        });

        // // Convert documents to plain objects and add totalDuration - rename const instructorCourses to instructorCoursesDocs
        // const instructorCourses = instructorCoursesDocs.map((course) => {
        //     const courseObj = course.toObject();
        //     const totalDuration = calculateTotalDuration(course.courseContent);
        //     courseObj.totalDuration = totalDuration;
        //     return courseObj;
        // });

        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to retrieve instructor courses",
            error: error.message,
        })
    }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.body

        // Find the course
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: "Course not found" })
        }

        // Unenroll students from the course
        const studentsEnrolled = course.studentsEnrolled
        for (const studentId of studentsEnrolled) {
            await User.findByIdAndUpdate(studentId, {
                $pull: { courses: courseId },
            })
        }

        // Delete sections and sub-sections
        const courseSections = course.courseContent
        for (const sectionId of courseSections) {
            // Delete sub-sections of the section
            const section = await Section.findById(sectionId)
            if (section) {
                const subSections = section.subSection
                for (const subSectionId of subSections) {
                    await SubSection.findByIdAndDelete(subSectionId)
                }
            }

            // Delete the section
            await Section.findByIdAndDelete(sectionId)
        }

        // Delete associated ratings & reviews
        await RatingAndReview.deleteMany({ course: courseId });

        // Delete associated course progress
        await CourseProgress.deleteMany({ courseID: courseId });

        // Delete the course
        await Course.findByIdAndDelete(courseId)

        return res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        })
    }
}
