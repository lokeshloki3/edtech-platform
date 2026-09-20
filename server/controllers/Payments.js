const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
// const CourseProgress = require("../models/CourseProgress");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
    const { courses } = req.body;
    const userId = req.user.id;
    if (courses.length === 0) {
        return res.status(400).json({
            success: false,
            messsage: "Please provide Course Id"
        });
    }
    let total_amount = 0;

    for (const course_id of courses) {
        let course;
        try {
            // Find the Course by its ID
            course = await Course.findById(course_id);
            // Validation
            if (!course) {
                return res.status(400).json({
                    success: false,
                    messsage: "Could not find the course"
                });
            }

            // Check if user is already enrolled in the course
            const uid = new mongoose.Types.ObjectId(userId);
            if (course.studentsEnrolled.includes(uid)) {
                return res.status(400).json({
                    success: false,
                    message: "Student is already Enrolled"
                });
            }

            // Add the price of the course to the total amount - more than one in cart
            total_amount += course.price;
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // Create options for Razorpay
    const options = {
        amount: total_amount * 100,
        currency: "INR",
        receipt: Math.random(Date.now()).toString(),
    }

    try {
        // Initiate the payment using Razorpay
        const paymentResponse = await instance.orders.create(options);
        console.log("paymentResponse", paymentResponse);
        return res.status(200).json({
            success: true,
            data: paymentResponse,
        });
    } catch (error) {
        console.error("Full error object:", error);
        return res.status(500).json({
            success: false,
            message: "Could not initiate order."
        });
    }
}

// Verify the payment
exports.verifyPayment = async (req, res) => {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user.id;

    // console.log("Incoming razorpay_order_id:", razorpay_order_id);
    // console.log("Incoming razorpay_payment_id:", razorpay_payment_id);
    // console.log("Incoming razorpay_signature:", razorpay_signature);
    // console.log("Incoming courses:", courses);
    // console.log("Extracted userId:", userId);

    if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature ||
        !courses ||
        !userId
    ) {
        return res.status(400).json({
            success: false,
            message: "Payment Failed"
        });
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        // enroll student - function is below it
        await enrollStudent(courses, userId, res);
        return res.status(200).json({
            success: true,
            message: "Payment Verified"
        });
    }

    return res.status(400).json({
        success: false,
        message: "Payment Failed"
    });
}

const enrollStudent = async (courses, userId, res) => {
    if (!courses || !userId) {
        return res.status(400).json({
            success: false,
            message: "Please provide Course ID and User ID"
        });
    }

    for (const courseId of courses) {
        try {
            // Find the all courses and enroll the student in it 
            const enrolledCourse = await Course.findOneAndUpdate(
                { _id: courseId },
                { $push: { studentsEnrolled: userId } },
                { new: true },
            );

            if (!enrolledCourse) {
                return res.status(400).json({
                    success: false,
                    message: "Course not found"
                });
            }
            console.log("Updated course: ", enrolledCourse);

            const courseProgress = await CourseProgress.create({
                courseID: courseId,
                userId: userId,
                completedVideos: [],
            });

            // Find the student and add the course to their list of enrolled courses
            const enrolledStudent = await User.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        courses: courseId, // courses is name of course ID in User schema
                        courseProgress: courseProgress._id,
                    },
                },
                { new: true }
            );

            console.log("Enrolled student: ", enrollStudent);

            // Send an email notification to the enrolled student
            const emailResponse = await mailSender(
                enrolledStudent.email,
                `Successfully Enrolled in ${enrolledCourse.courseName} at StudySphere`,
                courseEnrollmentEmail(
                    enrolledCourse.courseName,
                    `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
                )
            );

            console.log("Email sent successfully: ", emailResponse.response);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

// Send payment success email
exports.sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentId || !amount || !userId) {
        return res.status(400).json({
            success: false,
            message: "Please provide all the details"
        });
    }

    try {
        const enrolledStudent = await User.findById(userId);

        await mailSender(
            enrolledStudent.email,
            "Payment Received for your StudySphere Course Purchase",
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount / 100,
                orderId,
                paymentId
            )
        )
    } catch (error) {
        console.log("error in sending mail", error);
        return res.status(500).json({
            success: false,
            message: "Could not send email"
        })
    }
}


// // capture the payment and initiate the Razorpay order using webhook but this will only work for single cart payment
// exports.capturePayment = async (req, res) => {
//     // get courseId and UserId
//     const { course_id } = req.body;
//     // added in middleware - decode
//     const userId = req.user.id;
//     // validation
//     if (!course_id) {
//         return res.json(400).json({
//             success: false,
//             message: "Please provide valid course Id",
//         });
//     }
//     // valid courseDetail
//     let course;
//     try {
//         course = await Course.findById(course_id);
//         if (!course) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Could not find the course",
//             });
//         }

//         // user already paid for the same course
//         // change string userId of response to objectId as course objectId is there in User schema
//         const uid = new mongoose.Types.ObjectId(userId);
//         if (course.studentsEnrolled.includes(uid)) {
//             return res.status(200).json({
//                 success: false,
//                 message: "Student is already enrolled",
//             });
//         }
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }
//     // order create
//     const amount = course.price;
//     const currency = "INR";

//     const options = {
//         amount: amount * 100, // multiply by 100 - syntax of razorpay
//         currency,
//         receipt: Math.random(Date.now()).toString(),
//         notes: {
//             courseId: course_id,
//             userId,
//         }
//     };

//     try {
//         // initiate the payment using razorpay
//         const paymentResponse = await instance.orders.create(options);
//         console.log(paymentResponse);
//         // return response
//         return res.status(200).json({
//             success: true,
//             courseName: course.courseName,
//             courseDescription: course.courseDescription,
//             thumbnail: course.thumbnail,
//             orderId: paymentResponse.id, // used for tracking the order
//             currency: paymentResponse.currency,
//             amount: paymentResponse.amount,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             error: error.message,
//         });
//     }
// };

// // verify Signature of Razorpay and our backend server

// exports.verifySignature = async (req, res) => {
//     const webhookSecret = "12345678"; // my secret which I have given to Razorpay

//     // razorpay hit my backend webhook api and send my secret back to me after successful payment in req - one way encryption
//     const signature = req.header["x-razorpay-signature"];

//     // as razorpay secret is one way encrypted - we encrypt our secret and verify it with razorpay secret
//     const shasum = crypto.createHmac("sha256", webhookSecret);
//     shasum.update(JSON.stringify(req.body));
//     const digest = shasum.digest("hex");

//     if (signature === digest) {
//         console.log("Payment is Authorised");

//         // we have sent it in notes to update it here
//         const { courseId, userId } = req.body.payload.payment.entity.notes;

//         try {
//             // fulfil the action

//             // find the course and enroll the student in it
//             const enrolledCourse = await Course.findByIdAndUpdate(
//                 { _id: courseId },
//                 { $push: { studentsEnrolled: userId } },
//                 { new: true },
//             );

//             if (!enrolledCourse) {
//                 return res.status(500).json({
//                     success: false,
//                     message: 'Course not Found',
//                 });
//             }

//             console.log(enrolledCourse);

//             // find the student and add the course to their list enrolled courses
//             const enrolledStudent = await User.findByIdAndUpdate(
//                 { _id: userId },
//                 { $push: { courses: courseId } },
//                 { new: true },
//             );
//             console.log(enrolledStudent);

//             // send confirmation mail - will change mailSender util later for html email template
//             const emailResponse = await mailSender(
//                 enrolledStudent.email,
//                 "Congratulations from edTech",
//                 "Congratulations, you are onboarded into new edTech Course",
//             );

//             console.log(emailResponse);
//             return res.status(200).json({
//                 success: true,
//                 message: "Signature Verified and Course Added",
//             });
//         }
//         catch (error) {
//             console.log(error);
//             return res.status(500).json({
//                 success: false,
//                 message: error.message,
//             });
//         }
//     }
//     else {
//         return res.status(400).json({
//             success: false,
//             message: 'Invalid request',
//         });
//     }
// };