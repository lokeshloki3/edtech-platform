const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

// create SubSection

exports.createSubSection = async (req, res) => {
    try {
        // fetch data from req body
        const { title, timeDuration, description, sectionId } = req.body; // sectionId to update subsection id in section
        // extract file/video
        // const video = req.files.videoFile;
        const video = req.files.video;
        // validation
        if (!title || !description || !video || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }
        // upload video to Cloudinary - got secure url
        const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME); // folder name on Cloudinary
        // create a sub-section
        const subSectionDetails = await SubSection.create({
            title: title,
            timeDuration: `${uploadDetails.duration}`,
            description: description,
            videoUrl: uploadDetails.secure_url,
        });
        // update section with this sub section ObjectId
        const updatedSection = await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $push: {
                    subSection: subSectionDetails._id,
                }
            },
            { new: true }
        ).populate("subSection");
        // log updated section above, after adding populate here to have subsection details in section instead of id
        // return response
        return res.status(200).json({
            success: true,
            message: "Sub Section created successfully",
            data: updatedSection,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to create Sub Section, Please try again",
            error: error.message,
        });
    }
}

// update sub section
exports.updateSubSection = async (req, res) => {
    try {
        // fetch data from req body
        const { title, timeDuration, description, subSectionId, sectionId } = req.body;
        // extract file/video
        // const video = req.files.videoFile;
        // validation
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found",
            })
        }

        if (title !== undefined) {
            subSection.title = title
        }

        if (description !== undefined) {
            subSection.description = description
        }

        // upload video to Cloudinary - got secure url
        if (req.files && req.files.video !== undefined) {
            const video = req.files.video;
            const uploadDetails = await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME // folder name on Cloudinary
            )
            subSection.videoUrl = uploadDetails.secure_url
            subSection.timeDuration = `${uploadDetails.duration}`
        }
        // update data - no need to update section as section only have subsection id
        await subSection.save()

        // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        // console.log("updated section", updatedSection)

        // return response
        return res.status(200).json({
            success: true,
            message: "Sub Section updated successfully",
            data: updatedSection,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update Sub Section, Please try again",
            error: error.message,
        });
    }
}

// delete sub section

exports.deleteSubSection = async (req, res) => {
    try {
        // get ID - assuming we are sending ID
        const { subSectionId, sectionId } = req.body;
        // use findIdAndDelete
        // delete the entry from section schema
        await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId });

        if (!subSection) {
            return res.status(404).json({
                success: false,
                message: "SubSection not found"
            });
        }

        // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        // return response
        return res.status(200).json({
            success: true,
            message: "Sub Section deleted successfully",
            data: updatedSection,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to delete Sub Section, Please try again",
            error: error.message,
        });
    }
}