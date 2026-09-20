const { convertSecondsToDuration } = require("./secToDuration");


exports.calculateTotalDuration = (courseContent = []) => {
    let totalDurationInSeconds = 0;

    courseContent.forEach((section) => {
        section.subSection.forEach((subSection) => {
            const duration = parseInt(subSection.timeDuration || "0");
            totalDurationInSeconds += duration;
        });
    });

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);
    return totalDuration;
};
