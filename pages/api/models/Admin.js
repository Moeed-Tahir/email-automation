const mongoose = require("mongoose");

const adminFormSchema = new mongoose.Schema(
    {   
        userId: { type: String, required: false },
        executiveEmail: { type: String, required: false },
        executiveName: { type: String, required: false },
        salesRepresentiveEmail: { type: String, required: false },
        salesRepresentiveName: { type: String, required: false },
        donation: { type: String, required: false },
        status: { type: String, required: false},
        surveyId: { type: String, required: false},
        receiptFormLink: { type: String, required: false },
    },
    { timestamps: true }
);

module.exports = mongoose.models.AdminForm || mongoose.model("AdminForm", adminFormSchema);