const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Profile = require("../models/Profile");
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config();

// sendOTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from req body
        const { email } = req.body;

        // check if user already exist
        const checkUserPresent = await User.findOne({ email });

        // if user already exist, then return a response
        if (checkUserPresent) {
            return res.status(401).json({
                success: false,
                message: "User already registered",
            })
        }

        // generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });
        console.log("OTP generated", otp);

        // check unique otp or not or we can use library which will auto give unique otp everytime
        let result = await OTP.findOne({ otp: otp });

        while (result) {
            var otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false,
            });
            result = await OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        // create an entry in db for OTP
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            otp,
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}

// signUp
exports.signUp = async (req, res) => {

    try {
        // Destructure fields from req body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // validate data
        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "All fields are required",
            })
        }

        // 2 password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password and Confirm Password does not match",
            });
        }

        // check user already exist or not
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered. Please sign in to continue."
            });
        }

        // find most recent OTP stored for the user
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log(recentOtp);

        // validate OTP
        if (recentOtp.length == 0) {
            // otp not found for the email
            return res.status(400).json({
                success: false,
                message: "One OTP is not valid",
            });
        } else if (otp !== recentOtp[0].otp) {
            // invalid otp
            return res.status(400).json({
                success: false,
                message: "Most Recent OTP is not matching",
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // entry create in db

        // Create the user
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        // Create additional profile for user
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`, // dice bear api
        })

        // return res
        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            user,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: true,
            message: "User cannot be registered. Please try again",
        });
    }
}

// Login
exports.login = async (req, res) => {
    try {
        // get data from req body
        const { email, password } = req.body;

        // validate data
        if (!email || !password) {
            return res.status(400).json({
                success: true,
                message: "All fields required",
            });
        }

        // user check exist or not
        // User only has additionalDetails Id - To get its data need to populate
        const user = await User.findOne({ email }).populate("additionalDetails");
        // const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: true,
                message: "User is not registered, please signup first",
            });
        }

        // Cancel deletion if user logs in again
        if (user.isDeleted) {
            user.isDeleted = false;
            user.deletionScheduledAt = null;
            await user.save();
        }

        // generate JWT, after password matching
        if (await bcrypt.compare(password, user.password)) {
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: "2h",
            });
            // Save token to user document in database
            user.token = token;
            user.password = undefined;

            // Set cookie for token and return success response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
                httpOnly: true,
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully",
            })
        }
        else {
            return res.status(401).json({
                success: true,
                message: "Password is incorrect",
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: true,
            message: "Login failed, please try again",
        });
    }
}

// changePassword
exports.changePassword = async (req, res) => {
    try {
        // Get user data from req.user
        const userDetails = await User.findById(req.user.id);

        // get get oldPassword, newPassword, confirmPassword from req body
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // validation
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        );
        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res.status(401).json({
                success: false,
                message: "The old password is incorrect"
            });
        }

        // Match new password and confirm new password
        if (newPassword !== confirmNewPassword) {
            // If new password and confirm new password do not match, return a 400 (Bad Request) error
            return res.status(400).json({
                success: false,
                message: "The new password and confirm password does not match",
            });
        }

        // Check if the new password is the same as the old password
        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "The new password cannot be the same as the old password",
            });
        }

        // update password in db
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: hashedPassword },
            { new: true }
        );

        // send notification email - Password updated - passwordUpdated -> html template
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password Successfully Updated for your StudySphere Account",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully:", emailResponse.response);
        } catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }
        //  return response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error("Error occurred while updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        });
    }
}