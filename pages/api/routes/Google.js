import {
    startAuth,
    handleOAuth2Callback,
    sendEmail,
    getEmails,
    sendAcceptEmailToAdmin,
    sendRejectEmailToAdmin
} from "../controllers/Google";
import { startEmailMonitoring, startZeffyEmailMonitoring } from "../services/EmailMonetering";

export default async function handler(req, res) {

    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: 'Action parameter is required' });
    }

    try {
        if (req.method === 'GET' && action === 'startAuth') {
            return await startAuth(req, res);
        } else if (req.method === 'GET' && action === 'handleOAuth2Callback') {
            return await handleOAuth2Callback(req, res);
        } else if (req.method === 'POST' && action === 'sendEmail') {
            return await sendEmail(req, res);
        } else if (req.method === 'POST' && action === 'sendAcceptEmailToAdmin') {
            return await sendAcceptEmailToAdmin(req, res);
        } else if (req.method === 'POST' && action === 'sendRejectEmailToAdmin') {
            return await sendRejectEmailToAdmin(req, res);
        } else if (req.method === 'POST' && action === 'getEmails') {
            return await getEmails(req, res);
        } else if (req.method === 'POST' && action === 'startEmailMonitoring') {
            return await startEmailMonitoring(req, res);
        } else if (req.method === 'POST' && action === 'startZeffyEmailMonitoring') {
            return await startZeffyEmailMonitoring(req, res);
        } else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}
