const mongoose = require("mongoose");

const generateRandomId = () => Math.random().toString(36).substr(2, 9);

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  score: { type: Number, required: true }
});

const closeEndedQuestionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    default: generateRandomId,
    unique: true
  },
  questionText: { type: String, required: true },
  questionScore: { type: Number, required: false },
  options: { type: [optionSchema], required: true },
});

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
    industry: { type: String, required: false, default: null },
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
    otpExpires: { type: Date, required: false },
    linkedInProfile: { type: String, required: false },
    location: { type: String, required: false },
    aboutMe: { type: String, required: false },
    department: { type: String, required: false },
    focus: { type: String, required: false },
    closeEndedQuestions: { 
      type: [closeEndedQuestionSchema], 
      required: false,
      default: [] 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);