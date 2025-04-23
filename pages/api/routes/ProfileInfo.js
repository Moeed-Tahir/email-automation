import {
    addCalendarLink,
    addCompanyInfo,
    addSalesRepresentative
} from "../controllers/ProfileInfo";

export default async function handler(req, res) {

    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: 'Action parameter is required' });
    }

    try {
        if (req.method === 'POST' && action === 'addCalendarLink') {
            return await addCalendarLink(req, res);
        } else if (req.method === 'POST' && action === 'addCompanyInfo') {
            return await addCompanyInfo(req, res);
        } else if (req.method === 'POST' && action === 'addSalesRepresentative') {
            return await addSalesRepresentative(req, res);
        } else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}
