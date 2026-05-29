import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail, sendResetSuccessEmail } from "../mailtrap/emails.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export const signup = async (req, res) => {
	try {
		const { fullName, username, email, password } = req.body;

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(400).json({ error: "Username is already taken" });
		}

		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		if (!password || password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
		const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 1 day expiration
			deleteAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Deletes all user after 24 hrs 
		});

		if (newUser) {
			await newUser.save();

			await sendVerificationEmail(newUser.email, verificationToken);

			res.status(201).json({
				_id: newUser._id,
				fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const verifyEmail = async (req, res) => {
    const {code} = req.body;
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() },
        })


        if (!user) {
            return res.status(400).json({success: false, message: "Invalid or expired verification code"});
        }


        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
		user.deleteAt = undefined; // This will prevent verified users from deleting
        await user.save();


        await sendWelcomeEmail(user.email, user.fullName);


        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user : {
                ...user._doc,
                password: undefined,
                //
            }
        });
    } catch (error) {
        console.log("Error in verifyEmail controller", error);
        res.status(500).json({success: false, message: "Internal Server Error"});
    }
};

export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		const user = await User.findOne({ username });

		if (!user) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		// BLOCK UNVERIFIED USERS
		if (!user.isVerified) {
			return res.status(400).json({
				error: "Please verify your email before logging in",
			});
		}

		const isPasswordCorrect = await bcrypt.compare(
			password,
			user.password || ""
		);

		if (!isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if(!user){
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate Resset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// Send Email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset email sent" });
	} catch (error) {
		console.log("Error in forgotPassword controller", error);
		res.status(400).json({ success: false, message: error.message })
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if(!user){
			return res.status(400).json({success: false, message: "Invalid or Expired reset token"});
		}

		// Update password
		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}
		
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined

		await user.save();

		await sendResetSuccessEmail(user.email)
		res.status(200).json({ success: true, message: "Password reset successful"});
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({success: false, message: error.message});
	}
};

export const googleAuth = async (req, res) => {
	try {
		const {
			email,
			fullName,
			profileImg,
		} = req.body;

		let user = await User.findOne({ email });

		// CREATE USER IF NOT EXISTS
		if (!user) {
			const baseUsername = fullName
				.toLowerCase()
				.replace(/\s+/g, "")
				.slice(0, 10);

			const randomUsername =
				baseUsername +
				Math.floor(1000 + Math.random() * 9000);

			const randomPassword =
				crypto.randomBytes(16).toString("hex");

			const salt = await bcrypt.genSalt(10);

			const hashedPassword =
				await bcrypt.hash(randomPassword, salt);

			user = new User({
				email,
				fullName,
				username: randomUsername,
				password: hashedPassword,
				profileImg: profileImg || "",
				isVerified: true,
			});

			await user.save();
		}

		generateTokenAndSetCookie(user._id, res);

		res.status(200).json(user);

	} catch (error) {
		console.log(
			"Error in googleAuth controller",
			error.message
		);

		res.status(500).json({
			error: "Internal Server Error",
		});
	}
};