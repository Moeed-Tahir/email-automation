const mongoose = require("mongoose");
const generateRandomId = () => Math.random().toString(36).substr(2, 9);

const optionSchema = new mongoose.Schema({
    text: { type: String, required: true },
    score: { type: Number, required: true },
    isSelected: { type: Boolean, default: false },
    isOther: { type: Boolean, default: false }
});

const closeEndedQuestionSchema = new mongoose.Schema({
    questionId: {
        type: String,
        default: generateRandomId,
        unique: true
    },
    questionText: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    originalAnswer: { type: String },
    isOther: { type: Boolean, default: false },
    score: { type: Number, required: true },
    options: { type: [optionSchema], required: true },
});

const survayFormSchema = new mongoose.Schema(
    {
        survayId: {
            type: String,
            default: generateRandomId,
            unique: true,
        },
        userId: { type: String, required: false },
        bidAmount: { type: String, required: false },
        name: { type: String, required: false },
        email: { type: String, required: false },
        questionOneSolution: { type: String, required: false },
        questionTwoSolution: { type: String, required: false },
        resultsTimeframe: { type: String, required: false },
        caseStudies: { type: String, required: false },
        offeringType: { type: String, required: false },
        performanceGuarantee: { type: String, required: false },
        DonationWilling: { type: String, required: false },
        escrowDonation: { type: String, required: false },
        charityDonation: { type: String, required: false },
        status: { type: String, required: false, default: "Pending" },
        totalScore: { type: String, required: false },
        company: { type: String, required: false },
        jobTitle: { type: String, required: false },
        phoneNumber: { type: String, required: false },
        city: { type: String, required: false },
        state: { type: String, required: false },
        country: { type: String, required: false },
        closeEndedQuestions: {
            type: [closeEndedQuestionSchema],
            required: false,
            default: []
        }
    },
    { timestamps: true }
);

module.exports = mongoose.models.SurvayForm || mongoose.model("SurvayForm", survayFormSchema);