const connectToDatabase = require("../lib/db");
const User = require("../models/User");

const addCalendarLink = async (req, res) => {
    try {
        await connectToDatabase();
        const { linkedInProfileEmail, calendarLink } = req.body;
        const user = await User.findOne({ linkedInProfileEmail: linkedInProfileEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.calendarLink = calendarLink;
        await user.save();



        return res.json({
            message: "Calendar link added successfully",
        });
    } catch (error) {
        console.error("Error adding calendar link:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


const addCompanyInfo = async (req, res) => {
    try {
        await connectToDatabase();

        const { linkedInProfileEmail, charityCompany, minimumBidDonation } = req.body;
        const user = await User.findOne({ linkedInProfileEmail: linkedInProfileEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.charityCompany = charityCompany;
        user.minimumBidDonation = minimumBidDonation;

        await user.save();

        return res.json({
            message: "Company info added successfully",
        });

    } catch (error) {
        console.error("Error adding company info:", error);
        throw error;
    }
};

const addSalesRepresentative = async (req, res) => {
    try {
        await connectToDatabase();

        const { linkedInProfileEmail, questionSolution } = req.body;
        const user = await User.findOne({ linkedInProfileEmail: linkedInProfileEmail });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.questionSolution = questionSolution;

        await user.save();

        return res.json({
            message: "Question solution added successfully",
        });
    } catch (error) {
        console.error("Error adding sales representative info:", error);
        throw error;
    }
};

module.exports = {
    addCalendarLink,
    addCompanyInfo,
    addSalesRepresentative,
};
