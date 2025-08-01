const connectToDatabase = require("../lib/db");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const nodemailer = require('nodemailer');
const crypto = require("crypto");
dotenv.config();

const addProfileInfo = async (req, res) => {
  try {
    await connectToDatabase();
    const { userEmail, calendarLink, charityCompany, minimumBidDonation, questionSolution, howHeard, jobDescription, location, companyName, jobTitle,industry,closeEndedQuestions,linkedInProfile } = req.body;
    
    const user = await User.findOne({ userProfileEmail: userEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.calendarLink = calendarLink;
    user.charityCompany = charityCompany;
    user.minimumBidDonation = minimumBidDonation;
    user.questionSolution = questionSolution;
    user.howHeard = howHeard;
    user.industry = industry;
    user.jobDescription = jobDescription,
    user.location = location,
    user.jobTitle = jobTitle,
    user.companyName = companyName
    user.closeEndedQuestions = closeEndedQuestions;
    user.linkedInProfile = linkedInProfile;
    
    await user.save();
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.userProfileEmail,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(200).json({ message: "Profile updated successfully", user, token, userName: user.userName, userPhoto: user.userProfilePhoto, userEmail: user.userProfileEmail, charityCompany: charityCompany });

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

    const { userProfileEmail } = req.query;

    if (!userProfileEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ userProfileEmail: userProfileEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const linkedInComplete =
      user.userName &&
      user.userProfilePhoto &&
      user.userProfileEmail;

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
        userProfileEmail: user.userProfileEmail,
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

    res.status(200).json({ user, message: "User Delete Successfully" });
  } catch (error) {
    console.error("Error fetching profile info:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'info@makelastingchange.com',
    pass: 'vcvk scep luhp qosk',
  },
});

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendOTP = async (req, res) => {
  try {
    await connectToDatabase();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ userProfileEmail: email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email"
      });
    }

    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Your OTP for verification',
      text: `Your OTP is: ${otp}. It will expire in 10 minutes.`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

const verifyOTP = async (req, res) => {
  try {
    await connectToDatabase();
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required"
      });
    }

    const userEmail = await User.findOne({ userProfileEmail: email });

    if (!userEmail) {
      return res.status(404).json({
        success: false,
        message: "Email does not exist"
      });
    }

    const user = await User.findOne({
      userProfileEmail: email,
      otp: otp,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP or OTP expired"
      });
    }

    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateAuthToken(user);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      user: {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userProfileEmail,
        userPhoto: user.userProfilePhoto,
        charityCompany: user.charityCompany
      },
      token
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

function generateAuthToken(user) {
  return jwt.sign(
    { userId: user._id, email: user.userProfileEmail },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

const getCloseEndedQuestion = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      closeEndedQuestions: user.closeEndedQuestions || []
    });
  } catch (error) {
    console.error("Error fetching close-ended questions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const postCloseEndedQuestion = async (req, res) => {
  try {
    const { questionText, options,userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!questionText || !options || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ error: "Question text and options are required" });
    }

    for (const option of options) {
      if (!option.text || option.score === undefined) {
        return res.status(400).json({ error: "Each option must have text and score" });
      }
    }

    const newQuestion = {
      questionText,
      options
    };

    const user = await User.findOneAndUpdate(
      { userId },
      { $push: { closeEndedQuestions: newQuestion } },
      { new: true, upsert: false }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(201).json({
      message: "Close-ended question added successfully",
      questions: user.closeEndedQuestions
    });
  } catch (error) {
    console.error("Error adding close-ended question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateCloseEndedQuestion = async (req, res) => {
  try {
    const { userId, questionId, questionText, options } = req.body;

    if (!userId || !questionId) {
      return res.status(400).json({ error: "User ID and Question ID are required" });
    }

    if (!questionText || !options || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ error: "Question text and options are required" });
    }

    for (const option of options) {
      if (!option.text || option.score === undefined) {
        return res.status(400).json({ error: "Each option must have text and score" });
      }
    }

    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const questionIndex = user.closeEndedQuestions.findIndex(
      q => q.questionId === questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({ error: "Question not found" });
    }

    user.closeEndedQuestions[questionIndex] = {
      questionId,
      questionText,
      options
    };

    await user.save();

    res.status(200).json({
      message: "Question updated successfully",
      questions: user.closeEndedQuestions
    });
  } catch (error) {
    console.error("Error updating close-ended question:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateOpenEndedQuestion = async (req,res) => {
  try{
     const {userId} = req.body;
     
  }catch(error){

  }
}

module.exports = {
  addProfileInfo,
  checkUser,
  getProfileInfo,
  editProfileInfo,
  deleteProfileInfo,
  sendOTP,
  verifyOTP,
  getCloseEndedQuestion,
  postCloseEndedQuestion,
  updateCloseEndedQuestion,
  updateOpenEndedQuestion
};
