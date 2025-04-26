const connectToDatabase = require("../lib/db");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

const checkUser = async (req, res) => {
  try {
    await connectToDatabase();

    const { linkedInProfileEmail } = req.query;

    if (!linkedInProfileEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ linkedInProfileEmail: linkedInProfileEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const linkedInComplete =
      user.linkedInProfileName &&
      user.linkedInProfilePhoto &&
      user.linkedInProfileEmail;

    const gmailComplete =
      user.gmailAccessToken &&
      user.gmailRefreshToken &&
      user.gmailExpiryDate;

    const finalInfoComplete =
      user.calendarLink &&
      user.charityCompany &&
      user.minimumBidDonation &&
      user.questionSolution

    if (!linkedInComplete) {
      return res.status(200).json({ currentStep: 0, message: "LinkedIn step incomplete" });
    } else if (!gmailComplete) {
      return res.status(200).json({ currentStep: 1, message: "Gmail step incomplete" });
    } else if (!finalInfoComplete) {
      return res.status(200).json({ currentStep: 2, message: "Profile Info step incomplete" });
    } else {
      const token = jwt.sign(
        {
          userId: user.userId,
          email: user.linkedInProfileEmail,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        currentStep: "completed",
        message: "All steps completed",
        token,
        userId: user.userId,
        linkedInProfileEmail: user.linkedInProfileEmail,
      });
    }

  } catch (error) {
    console.error("Error checking user:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


module.exports = {
  addProfileInfo,
  checkUser
};
