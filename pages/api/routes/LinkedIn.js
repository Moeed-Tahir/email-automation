import {
    linkedInLogin,
    linkedInCallback,
} from "../controllers/LinkedIn";

export default async function handler(req, res) {

    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: 'Action parameter is required' });
    }

    try {
        if (req.method === 'GET' && action === 'linkedInLogin') {
            return await linkedInLogin(req, res);
        } else if (req.method === 'GET' && action === 'linkedInCallback') {
            return await linkedInCallback(req, res);
        } else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}
