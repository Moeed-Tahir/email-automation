const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const generateRandomId = () => Math.random().toString(36).substr(2, 9);

const adminUserSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            default: generateRandomId,
            unique: true,
        },
        email: { type: String, required: false },
        password: { type: String, required: false },
        gmailAccessToken: { type: String, required: false },
        gmailRefreshToken: { type: String, required: false },
        gmailExpiryDate: { type: String, required: false }
    },
    { timestamps: true }
);

adminUserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

adminUserSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.AdminUser || mongoose.model("AdminUser", adminUserSchema);