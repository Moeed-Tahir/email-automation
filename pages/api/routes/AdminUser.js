import {
    startAdminAuth,
    handleAdminCallback,
    checkGmailStatus,
    disconnectGmail,
    refreshAccessToken,
    getAdminProfile,
    adminSignup,
    adminLogin,
    verifyToken,
    setPassword,
    changePassword,
    verifyAdminToken
} from "../controllers/AdminUser";

export default async function handler(req, res) {
    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: 'Action parameter is required' });
    }

    try {
        if (req.method === 'POST' && action === 'adminSignup') {
            return await adminSignup(req, res);
        } else if (req.method === 'POST' && action === 'adminLogin') {
            return await adminLogin(req, res);
        } else if (req.method === 'POST' && action === 'verifyAdminToken') {
            return await verifyAdminToken(req, res);
        } else if (req.method === 'POST' && action === 'setPassword') {
            return await setPassword(req, res);

        } else if (req.method === 'GET' && action === 'startAdminAuth') {
            return await startAdminAuth(req, res);
        } else if (req.method === 'GET' && action === 'handleAdminCallback') {
            return await handleAdminCallback(req, res);

        } else if (req.method === 'GET' && action === 'checkGmailStatus') {
            return await checkGmailStatus(req, res);
        } else if (req.method === 'POST' && action === 'disconnectGmail') {
            return await disconnectGmail(req, res);
        } else if (req.method === 'POST' && action === 'refreshAccessToken') {
            return await refreshAccessToken(req, res);

        } else if (req.method === 'GET' && action === 'getAdminProfile') {
            return await verifyToken(req, res, () => getAdminProfile(req, res));
        } else if (req.method === 'POST' && action === 'changePassword') {
            return await verifyToken(req, res, () => changePassword(req, res));
        } else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}