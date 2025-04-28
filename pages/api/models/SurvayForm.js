const mongoose = require("mongoose");

const survayFormSchema = new mongoose.Schema(
    {
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
    },
    { timestamps: true }
);

module.exports = mongoose.models.SurvayForm || mongoose.model("SurvayForm", survayFormSchema);