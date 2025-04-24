const mongoose = require("mongoose");

const generateRandomId = () => Math.random().toString(36).substr(2, 9);

const userSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            default: generateRandomId,
            unique: true,
        },
        linkedInProfileName: { type: String, required: false },
        linkedInProfilePhoto: { type: String, required: false },
        linkedInProfileEmail: { type: String, required: false },
        gmailAccessToken: { type: String, required: false },
        gmailRefreshToken: { type: String, required: false },
        gmailExpiryDate: { type: String, required: false },
        calendarLink: { type: String, required: false },
        charityCompany: { type: String, required: false },
        minimumBidDonation: { type: String, required: false },
        questionSolution: { type: String, required: false },
        howHeard:{type: String, required: false}
    },
    { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);