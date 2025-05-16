import {
    addProfileInfo,
    checkUser,
    getProfileInfo,
    editProfileInfo,
    deleteProfileInfo,
    sendOTP,
    verifyOTP
} from "../controllers/ProfileInfo";

export default async function handler(req, res) {

    const { action } = req.query;

    if (!action) {
        return res.status(400).json({ message: 'Action parameter is required' });
    }

    try {
        if (req.method === 'POST' && action === 'addProfileInfo') {
            return await addProfileInfo(req, res);
        } else if (req.method === 'GET' && action === 'checkUser') {
            return await checkUser(req, res);
        } else if (req.method === 'GET' && action === 'getProfileInfo') {
            return await getProfileInfo(req, res);
        } else if (req.method === 'POST' && action === 'editProfileInfo') {
            return await editProfileInfo(req, res);
        } else if (req.method === 'POST' && action === 'deleteProfileInfo') {
            return await deleteProfileInfo(req, res);
        } else if (req.method === 'POST' && action === 'verifyOTP') {
            return await verifyOTP(req, res);
        }
        else if (req.method === 'POST' && action === 'sendOTP') {
            return await sendOTP(req, res);
        }
        else {
            return res.status(405).json({ message: 'Method Not Allowed' });
        }
    } catch (error) {
        console.error('API error:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
}
