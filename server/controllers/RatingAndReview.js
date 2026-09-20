const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");

// createRating
exports.createRating = async (req, res) => {
    try {
        // get user id
        const userId = req.user.id; // added in middleware
        // fetch data from req body
        const { rating, review, courseId } = req.body;
        // check if user is enrolled or not
        const courseDetails = await Course.findOne(
            {
                _id: courseId,
                studentsEnrolled: { $elemMatch: { $eq: userId } }, // check in array if any element match
            }
        );
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Student is not enrolled in the course",
            });
        }
        // check if user already reviewed the course
        const alreadyReviewed = await RatingAndReview.findOne({
            user: userId,
            course: courseId,
        });

        if (alreadyReviewed) {
            return res.status(403).json({
                success: false,
                message: "Course is already reviewed by the user",
            });
        }
        // create rating and review
        const ratingReview = await RatingAndReview.create({
            rating, review,
            course: courseId,
            user: userId,
        });
        // update course with this rating/review
        const updatedCourseDetails = await Course.findByIdAndUpdate({ _id: courseId },
            {
                $push: {
                    ratingAndReviews: ratingReview._id,
                }
            },
            { new: true },
        );
        console.log(updatedCourseDetails);
        // return response
        return res.status(200).json({
            success: true,
            message: "Rating and Review created successfully",
            ratingReview,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// getAverageRating
exports.getAverageRating = async (req, res) => {
    try {
        // get course ID
        const courseId = req.body.courseId;
        // const { courseId } = req.body;

        // calculate avg rating - aggregate returns array
        const result = await RatingAndReview.aggregate([
            {
                $match: {
                    course: new mongoose.Types.ObjectId(courseId), // change courseId from string to ObjectId
                },
            },
            {
                $group: {    // group all above courseId entries
                    _id: null,  // single group wrap as I do not know how to group them
                    averageRating: { $avg: "$rating" },
                }
            }
        ])

        // return rating
        if (result.length > 0) {
            return res.status(200).json({
                success: true,
                averageRating: result[0].averageRating,  // as aggregate return array and its first index has average rating as right now we have only one element in our result array, may be more in future change index accordingly in future
            })
        }

        // if no rating/review exist
        return res.status(200).json({
            success: true,
            message: "Average Rating is 0, no ratings given till now",
            averageRating: 0,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// getAllRatingAndReviews
exports.getAllRating = async (req, res) => {
    try {
        // find all, sort decreasing order, userId and courseId in ReviewAndRating schema so populate them
        const allReviews = await RatingAndReview.find({})
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image",
            })
            .populate({
                path: "course",
                select: "courseName",
            })
            .exec();
        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

// getAllRatingAndReviews only based on courseId - check ?
exports.getAllRatingForCourse = async (req, res) => {
    try {
        // get course ID
        const { courseId } = req.body;
        // find acc to courseId, sort decreasing order, userId and courseId in ReviewAndRating schema so populate them
        const allReviews = await RatingAndReview.find({ _id: courseId })
            .sort({ rating: "desc" })
            .populate({
                path: "user",
                select: "firstName lastName email image",
            })
            .populate({
                path: "course",
                select: "courseName",
            })
            .exec();
        return res.status(200).json({
            success: true,
            message: "All reviews fetched successfully",
            data: allReviews,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}