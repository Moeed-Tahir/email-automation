const connectToDatabase = require('../lib/db');
const Admin = require('../models/Admin');

const uploadReciptData = async (req, res) => {
    try {
        await connectToDatabase();
        const { executiveEmail, executiveName, salesRepresentiveEmail, salesRepresentiveName, donation,receiptFormLink } = req.body;

        const newAdminForm = await Admin.create({
            executiveEmail,
            executiveName,
            salesRepresentiveEmail,
            salesRepresentiveName,
            donation,
            receiptFormLink
        });

        res.status(200).json({ message: "Receipt Form Send Successfully", newAdminForm });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

const fetchReciptData = async (req, res) => {
    try {
        await connectToDatabase();

        const receipts = await Admin.find();

        res.status(200).json({ message: "Receipts fetched successfully", receipts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { uploadReciptData,fetchReciptData };