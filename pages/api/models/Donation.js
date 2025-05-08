const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
    {
        salesRepresentiveName: { type: String, required: false },
        salesRepresentiveEmail: { type: String, required: false },
        executiveEmail: { type: String, required: false },
        executiveName: { type: String, required: false },
        donation: { type: String, required: false },
        userId: { type: String, required: false },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Donation || mongoose.model("Donation", donationSchema);