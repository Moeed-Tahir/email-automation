const mongoose = require("mongoose");

const adminFormSchema = new mongoose.Schema(
    {
        executiveEmail: { type: String, required: false },
        executiveName: { type: String, required: false },
        salesRepresentiveEmail: { type: String, required: false },
        salesRepresentiveName: { type: String, required: false },
        donation: { type: String, required: false },
        status: { type: String, required: false, default: "Pending" },
        receiptFormLink: { type: String, required: false },
    },
    { timestamps: true }
);

module.exports = mongoose.models.AdminForm || mongoose.model("AdminForm", adminFormSchema);