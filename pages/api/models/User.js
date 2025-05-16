const mongoose = require("mongoose");

const generateRandomId = () => Math.random().toString(36).substr(2, 9);

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            default: generateRandomId,
            unique: true,
        },
        userName: { type: String, required: false },
        userProfilePhoto: { type: String, required: false },
        userProfileEmail: { type: String, required: false },
        companyName: { type: String, required: false, default: null },
        jobTitle: { type: String, required: false, default: null },
        jobDescription: { type: String, required: false, default: null },
        location: { type: String, required: false, default: null },
        industry: { type: String, required: false, default: null },
        gmailAccessToken: { type: String, required: false },
        gmailRefreshToken: { type: String, required: false },
        gmailExpiryDate: { type: String, required: false },
        calendarLink: { type: String, required: false },
        charityCompany: { type: String, required: false },
        minimumBidDonation: { type: String, required: false },
        questionSolution: { type: String, required: false },
        howHeard: { type: String, required: false },
        otp: { type: String, required: false },
        otpExpires: { type: Date, required: false }
    },
    { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);