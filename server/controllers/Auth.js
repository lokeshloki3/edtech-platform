const User = require("../models/User");
const OTP = require("../models/OTP");
const { MAX_OTP_ATTEMPTS } = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SESSION_TTL_SECONDS, COOKIE_NAME, getAuthCookieOptions } = require("../config/authCookie");
const Profile = require("../models/Profile");
const mailSender = require("../utils/mailSender");
const { trySendMail } = require("../utils/mailSender");
const { hashToken, safeCompareHex } = require("../utils/hashToken");
const otpEmailTemplate = require("../mail/templates/emailVerificationTemplate");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const {
    validateRequired,
    validateEmail,
    validatePassword,
    validateOtp,
    validateAccountType,
    firstError,
    normalizeEmail,
} = require("../utils/validateAuth");
require("dotenv").config();

const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

// sendOTP
exports.sendOTP = async (req, res) => {
    try {
        // fetch email from req body
        const { email } = req.body;

        const emailError = validateEmail(email);
        if (emailError) {
            return res.status(400).json({
                success: false,
                message: emailError,
            });
        }

        const normalizedEmail = normalizeEmail(email);

        // check if user already exist
        const checkUserPresent = await User.findOne({ email: normalizedEmail });

        // if user already exist, then return a response.
        // 409 not 401 - the client treats a 401 as the session ending.
        if (checkUserPresent) {
            return res.status(409).json({
                success: false,
                message: "User already registered",
            })
        }

        const latest = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
        if (latest && Date.now() - latest.createdAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
            const waitSeconds = Math.ceil(
                (OTP_RESEND_COOLDOWN_MS - (Date.now() - latest.createdAt.getTime())) / 1000
            );
            return res.status(429).json({
                success: false,
                message: `Please wait ${waitSeconds}s before requesting another OTP.`,
            });
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // One live code per address, or the attempt counter means nothing.
        await OTP.deleteMany({ email: normalizedEmail });

        const otpRecord = await OTP.create({
            email: normalizedEmail,
            otpHash: hashToken(otp),
        });

        try {
            await mailSender(
                normalizedEmail,
                "Verification OTP from edTech platform - StudySphere",
                otpEmailTemplate(otp)
            );
        } catch (mailError) {
            await OTP.deleteOne({ _id: otpRecord._id });
            console.error("Failed to deliver OTP email:", mailError.message);
            return res.status(502).json({
                success: false,
                message: "Could not send the verification email. Please try again.",
            });
        }

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
        })

    } catch (error) {
        console.error("sendOTP failed:", error);
        return res.status(500).json({
            success: false,
            message: "Could not send OTP. Please try again.",
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

        // validate data. accountType is allowlisted, not trusted - it is the
        // role isAdmin and isInstructor read.
        const validationError = firstError([
            validateRequired(firstName, "First name"),
            validateRequired(lastName, "Last name"),
            validateEmail(email),
            validatePassword(password),
            validateRequired(confirmPassword, "Confirm password"),
            validateAccountType(accountType),
            validateOtp(otp),
        ]);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        // 2 password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match",
            });
        }

        const normalizedEmail = normalizeEmail(email);

        // check user already exist or not
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User is already registered. Please sign in to continue."
            });
        }

        const otpRecord = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "That OTP has expired. Please request a new one.",
            });
        }

        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
            await OTP.deleteOne({ _id: otpRecord._id });
            return res.status(429).json({
                success: false,
                message: "Too many incorrect attempts. Please request a new OTP.",
            });
        }

        if (!safeCompareHex(hashToken(otp.trim()), otpRecord.otpHash)) {
            await OTP.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
            const remaining = MAX_OTP_ATTEMPTS - (otpRecord.attempts + 1);
            return res.status(400).json({
                success: false,
                message:
                    remaining > 0
                        ? `That OTP is not correct. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
                        : "That OTP is not correct. Please request a new one.",
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // entry create in db

        // // Create the user
        // let approved = "";
        // approved === "Instructor" ? (approved = false) : (approved = true);
        // Left to the model default of true. The lines above compared an empty
        // string to "Instructor", so they approved everyone anyway, and nothing
        // reads the flag - there is no approval route to clear it again.

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
            email: normalizedEmail,
            contactNumber,
            password: hashedPassword,
            accountType,
            // approved: approved,
            additionalDetails: profileDetails._id,
            image: `http://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`, // dice bear api
        })

        // Consume it, or the code is replayable within its TTL.
        await OTP.deleteOne({ _id: otpRecord._id });

        // Strip the hash before it goes out, as login does. Nothing saves
        // after this, so the stored document is untouched.
        user.password = undefined;

        // return res
        return res.status(200).json({
            success: true,
            message: "User is registered successfully",
            data: user,
        });
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User is already registered. Please sign in to continue.",
            });
        }
        console.error("signUp failed:", error);
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again",
        });
    }
}

// Login
exports.login = async (req, res) => {
    try {
        // get data from req body
        const { email, password } = req.body;

        // validate data. Password is presence-only: enforcing length here would
        // lock out every account whose password predates the rule.
        const validationError = firstError([
            validateEmail(email),
            validateRequired(password, "Password"),
        ]);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        // user check exist or not
        // User only has additionalDetails Id - To get its data need to populate
        const user = await User.findOne({ email: normalizeEmail(email) }).populate("additionalDetails");
        // const user = await User.findOne({ email });
        if (!user) {
            // Dummy compare, so timing does not reveal whether the account exists.
            await bcrypt.compare(password, "$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
            return res.status(401).json({
                success: false,
                message: INVALID_CREDENTIALS_MESSAGE,
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
                expiresIn: SESSION_TTL_SECONDS,
            });
            // The JWT is never attached to the returned user either - with the
            // body stripped, user.token would have been the remaining way for a
            // bearer credential to reach JS. It was never persisted here anyway
            // (no save() follows), so dropping it changes nothing server-side.
            user.password = undefined;

            // The httpOnly cookie is the session. The token is deliberately not
            // echoed in the body: nothing on the client reads it any more, and
            // returning it would put a bearer credential back into JS reach.
            res.cookie(COOKIE_NAME, token, getAuthCookieOptions()).status(200).json({
                success: true,
                message: "Logged in successfully",
                data: user,
            })
        }
        else {
            return res.status(401).json({
                success: false,
                message: INVALID_CREDENTIALS_MESSAGE,
            })
        }
    } catch (error) {
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: "Login failed, please try again",
        });
    }
}

// changePassword
exports.changePassword = async (req, res) => {
    try {
        // get get oldPassword, newPassword, confirmPassword from req body
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // Runs before the lookup so bad input costs no db round trip.
        // oldPassword is presence-only; the bcrypt compare below is the check.
        const validationError = firstError([
            validateRequired(oldPassword, "Old password"),
            validatePassword(newPassword, "New password"),
            validateRequired(confirmNewPassword, "Confirm new password"),
        ]);

        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError,
            });
        }

        // Get user data from req.user
        const userDetails = await User.findById(req.user.id);

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        );
        if (!isPasswordMatch) {
            // 403 not 401 - the session is valid, the old password is not.
            // A 401 here signed the user out over a typo.
            return res.status(403).json({
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

        // Best-effort: the password is already changed.
        await trySendMail(
            updatedUserDetails.email,
            "Password Successfully Updated for your StudySphere Account",
            passwordUpdated(
                updatedUserDetails.email,
                `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
            ),
            "password-change notification"
        );

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
        });
    }
}

// logout — clears the session cookie. Required now that the JWT is httpOnly:
// the client cannot delete the cookie itself, so only the server can end a session.
exports.logout = async (req, res) => {
    try {
        const { maxAge, ...clearOptions } = getAuthCookieOptions();

        res.clearCookie(COOKIE_NAME, clearOptions);

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Logout failed, please try again",
        });
    }
}
