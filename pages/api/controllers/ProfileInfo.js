const connectToDatabase = require("../lib/db");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

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
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.linkedInProfileEmail,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(200).json({ message: "Profile updated successfully", user, token,userName:user.linkedInProfileName,userPhoto:user.linkedInProfilePhoto,userEmail:user.linkedInProfileEmail,charityCompany:user.charityCompany });

  } catch (error) {
    console.error("Error adding sales representative info:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
}

const getProfileInfo = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId in query" });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching profile info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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


      return res.status(200).json({
        currentStep: "completed",
        message: "All steps completed",
        userId: user.userId,
        linkedInProfileEmail: user.linkedInProfileEmail,
      });
    }

  } catch (error) {
    console.error("Error checking user:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const editProfileInfo = async (req, res) => {
  try {
    await connectToDatabase();

    const { userId } = req.query;
    const { updates } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );
    console.log("updatedUser",updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error editing profile:", error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteProfileInfo = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId in query" });
    }

    const user = await User.findOneAndDelete({ userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user,message:"User Delete Successfully" });
  } catch (error) {
    console.error("Error fetching profile info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addProfileInfo,
  checkUser,
  getProfileInfo,
  editProfileInfo,
  deleteProfileInfo
};
