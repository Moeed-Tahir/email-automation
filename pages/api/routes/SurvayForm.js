import {
    getQuestionFromUserId,
    sendSurvayForm,
    fetchSurvayData,
    getBidInfo
} from "../controllers/SurvayForm";

export default async function handler(req, res) {

    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: 'Action parameter is required' });
    }

    try {
        if (req.method === 'POST' && action === 'getQuestionFromUserId') {
            return await getQuestionFromUserId(req, res);
        } else if (req.method === 'POST' && action === 'sendSurvayForm') {
            return await sendSurvayForm(req, res);
        } else if (req.method === 'GET' && action === 'fetchSurvayData') {
            return await fetchSurvayData(req, res);
        } else if (req.method === 'POST' && action === 'getBidInfo') {
            return await getBidInfo(req, res);
        } else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}
