const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
// const CourseProgress = require("../models/CourseProgress");
const mailSender = require("../utils/mailSender");
const { trySendMail } = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { default: mongoose } = require("mongoose");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");

// timingSafeEqual throws on length mismatch, so check length first.
const signaturesMatch = (expected, received) => {
    if (typeof received !== "string" || expected.length !== received.length) {
        return false;
    }
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"));
};

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
    const { courses } = req.body;
    const userId = req.user.id;
    // Array check, not just length: a missing `courses` key reached
    // `undefined.length` and took the process down.
    if (!Array.isArray(courses) || courses.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Please provide Course Id"
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
                    message: "Could not find the course"
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
            // console.log(error)
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
        // Razorpay treats receipt as the caller's idempotency handle.
        receipt: crypto.randomUUID(),
    }

    try {
        // Initiate the payment using Razorpay
        const paymentResponse = await instance.orders.create(options);
        // console.log("paymentResponse", paymentResponse);
        return res.status(200).json({
            success: true,
            message: "Payment order created successfully",
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

    if (!signaturesMatch(expectedSignature, razorpay_signature)) {
        return res.status(400).json({
            success: false,
            message: "Payment Failed"
        });
    }

    const result = await enrollStudent(courses, userId);

    if (!result.ok) {
        return res.status(result.status).json({
            success: false,
            message: result.message,
        });
    }

    return res.status(200).json({
        success: true,
        message: "Payment Verified"
    });
}

/**
 * Runs after payment is confirmed, so the money is already taken: validate
 * everything, write everything, then notify best-effort. Writes are idempotent,
 * so a re-run repairs rather than duplicates. Full atomicity needs a transaction,
 * which needs a replica set.
 *
 * @returns {Promise<{ok: true} | {ok: false, status: number, message: string}>}
 */
const enrollStudent = async (courses, userId) => {
    if (!Array.isArray(courses) || courses.length === 0 || !userId) {
        return { ok: false, status: 400, message: "Please provide Course ID and User ID" };
    }

    try {
        // Resolve everything before writing, or a bad id leaves a half-enrolled cart.
        const courseDocs = await Course.find({ _id: { $in: courses } });

        if (courseDocs.length !== courses.length) {
            return { ok: false, status: 400, message: "One or more courses could not be found" };
        }

        const student = await User.findById(userId);
        if (!student) {
            return { ok: false, status: 400, message: "Student account not found" };
        }

        const progressIds = [];

        for (const course of courseDocs) {
            // $addToSet, not $push, so a re-run does not double-enrol.
            await Course.updateOne(
                { _id: course._id },
                { $addToSet: { studentsEnrolled: userId } }
            );

            const progress = await CourseProgress.findOneAndUpdate(
                { courseID: course._id, userId: userId },
                { $setOnInsert: { completedVideos: [] } },
                { upsert: true, new: true }
            );

            progressIds.push(progress._id);
        }

        await User.updateOne(
            { _id: userId },
            {
                $addToSet: {
                    courses: { $each: courseDocs.map((course) => course._id) },
                    courseProgress: { $each: progressIds },
                },
            }
        );

        // Durable from here; nothing below may change the outcome.
        for (const course of courseDocs) {
            await trySendMail(
                student.email,
                `Successfully Enrolled in ${course.courseName} at StudySphere`,
                courseEnrollmentEmail(
                    course.courseName,
                    `${student.firstName} ${student.lastName}`
                ),
                `enrolment confirmation for course ${course._id}`
            );
        }

        return { ok: true };
    } catch (error) {
        // Payment succeeded but enrolment did not — log the ids needed to re-run.
        console.error(
            `ENROLMENT FAILED AFTER PAYMENT — user=${userId} courses=${JSON.stringify(courses)}`,
            error
        );
        return {
            ok: false,
            status: 500,
            message:
                "Your payment went through but we could not finish setting up your courses. Our team has been notified — please contact support.",
        };
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

        if (!enrolledStudent) {
            return res.status(404).json({
                success: false,
                message: "Student account not found",
            });
        }

        // Best-effort, 200 either way: the payment already completed.
        await trySendMail(
            enrolledStudent.email,
            "Payment Received for your StudySphere Course Purchase",
            paymentSuccessEmail(
                `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
                amount / 100,
                orderId,
                paymentId
            ),
            "payment receipt"
        );

        return res.status(200).json({
            success: true,
            message: "Payment receipt processed",
        });
    } catch (error) {
        console.error("sendPaymentSuccessEmail failed:", error);
        return res.status(500).json({
            success: false,
            message: "Could not process the payment receipt",
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