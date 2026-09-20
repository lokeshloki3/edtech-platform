const Section = require("../models/Section");
const Course = require("../models/Course");
const SubSection = require("../models/SubSection");

exports.createSection = async (req, res) => {
    try {
        // fetch data
        const { sectionName, courseId } = req.body;
        // data validation
        if (!sectionName || !courseId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // create section
        const newSection = await Section.create({ sectionName });
        // update course with section ObjectId
        const updatedCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push: {
                    courseContent: newSection._id,
                },
            },
            { new: true },
        )
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();
        // use populate above to replace id with data of sections/sub-sections both in the updatedCourseDetails
        // return response
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            data: updatedCourseDetails,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to create Section, Please try again",
            error: error.message,
        });
    }
}

exports.updateSection = async (req, res) => {
    try {
        // data input
        const { sectionName, sectionId, courseId } = req.body;
        // data validation
        if (!sectionName || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        // update data - no need to update course as course only have section id
        const section = await Section.findByIdAndUpdate(sectionId, { sectionName }, { new: true });

        // but for ui render of course need to update course
        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()
        // console.log(course);

        // return response
        return res.status(200).json({
            success: true,
            message: "Section updated successfully",
            data: course,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update Section, Please try again",
            error: error.message,
        });
    }
}

exports.deleteSection = async (req, res) => {
    try {
        // get ID - assuming we are sending ID 
        const { sectionId, courseId } = req.body;

        console.log(sectionId, courseId)

        // use findIdAndDelete
        const section = await Section.findByIdAndDelete(sectionId);
        // Also do - delete the entry from course schema
        // should all associated SubSection also needs to be deleted ?
        await Course.findByIdAndUpdate(
            // { _id: courseId },
            courseId,
            {
                $pull: {
                    courseContent: sectionId, // courseContent is Section Id in Course schema
                },
            }
        )

        if (!section) {
            return res.status(404).json({
                success: false,
                message: "Section not found",
            })
        }

        // Delete the associated subsections
        await SubSection.deleteMany({ _id: { $in: section.subSection } })

        await Section.findByIdAndDelete(sectionId)

        // find the updated course and return it
        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec()

        // return response
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            data: course,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to delete Section, Please try again",
            error: error.message,
        });
    }
}