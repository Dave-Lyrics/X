import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
		},
		fullName: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			minLength: 6,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		deleteAt: {
			type: Date,
		},
		lastLogin: {
			type: Date,
			default: Date.now
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
		followers: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		following: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: [],
			},
		],
		profileImg: {
			type: String,
			default: "",
		},
		coverImg: {
			type: String,
			default: "",
		},
		bio: {
			type: String,
			default: "",
		},

		link: {
			type: String,
			default: "",
		},
		likedPosts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
				default: [],
			},
		],
		savedPosts: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Post",
				default: [],
			},
		],
	},
	{ timestamps: true }
);

userSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });
const User = mongoose.model("User", userSchema);

export default User;
