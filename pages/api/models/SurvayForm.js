const mongoose = require("mongoose");
const generateRandomId = () => Math.random().toString(36).substr(2, 9);

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
        totalScore: { type: String, required: false }
    },
    { timestamps: true }
);

module.exports = mongoose.models.SurvayForm || mongoose.model("SurvayForm", survayFormSchema);