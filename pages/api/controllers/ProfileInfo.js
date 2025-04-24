const connectToDatabase = require("../lib/db");
const User = require("../models/User");

const addProfileInfo = async (req, res) => {
    try {
        await connectToDatabase();
        const { linkedInProfileEmail, calendarLink, charityCompany, minimumBidDonation, questionSolution, howHeard } = req.body;

        const user = await User.findOne({ linkedInProfileEmail: linkedInProfileEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.calendarLink = calendarLink;
        user.charityCompany = charityCompany;
        user.minimumBidDonation = minimumBidDonation;
        user.questionSolution = questionSolution;
        user.howHeard = howHeard;

        await user.save();

        return res.status(200).json({ message: "Profile updated successfully", user });

    } catch (error) {
        console.error("Error adding sales representative info:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
}

module.exports = {
    addProfileInfo,
};
