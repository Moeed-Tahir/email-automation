import {
    uploadReciptData,
    fetchReciptData,
    sendAcceptEmailFromAdmin,
    addDonation,
    getDonation
} from "../controllers/Admin";

export default async function handler(req, res) {

    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: 'Action parameter is required' });
    }

    try {
        if (req.method === 'POST' && action === 'uploadReciptData') {
            return await uploadReciptData(req, res);
        } else if (req.method === 'POST' && action === 'sendAcceptEmailFromAdmin') {
            return await sendAcceptEmailFromAdmin(req, res);
        } else if (req.method === 'GET' && action === 'fetchReciptData') {
            return await fetchReciptData(req, res);
        } else if (req.method === 'POST' && action === 'getDonation') {
            return await getDonation(req, res);
        } else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}
