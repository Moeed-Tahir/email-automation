const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const connectToDatabase = require('../lib/db');

const CLIENT_ID = process.env.CLIENT_ID || '34860616241-1kcc767m6k6isr2tnmpq4levhjb5lm7k.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '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';
const REDIRECT_URI = 'https://email-automation-ivory.vercel.app/api/routes/Google?action=handleOAuth2Callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Missing required environment variables: CLIENT_ID and CLIENT_SECRET');
}

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

exports.startAuth = (req, res) => {
  const userEmail = req.query.email;
  if (!userEmail) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  const state = JSON.stringify({
    userEmail,
    timestamp: Date.now()
  });

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.modify'],
    state: state,
    include_granted_scopes: true
  });

  res.redirect(authUrl);
};

exports.handleOAuth2Callback = async (req, res) => {
  try {
    await connectToDatabase();
    const code = req.query.code;
    if (!code) {
      throw new Error('Authorization code missing');
    }

    const state = req.query.state;
    if (!state) {
      throw new Error('State parameter missing');
    }

    const { userEmail } = JSON.parse(state);
    if (!userEmail) {
      throw new Error('Invalid state parameter');
    }

    const { tokens } = await oAuth2Client.getToken(code);

    if (!tokens.refresh_token) {
      throw new Error('No refresh token received - make sure to request offline access');
    }

    let user = await User.findOne({ linkedInProfileEmail: userEmail });
    if (!user) {
      user = new User({ linkedInProfileEmail: userEmail });
    }

    user.gmailAccessToken = tokens.access_token;
    user.gmailRefreshToken = tokens.refresh_token;
    user.gmailExpiryDate = tokens.expiry_date?.toString() || '';

    await user.save();

    res.redirect(`https://email-automation-ivory.vercel.app/?currentStep=3`);

  } catch (error) {
    console.error('OAuth2 Error:', error);
    res.redirect(`https://email-automation-ivory.vercel.app/auth-error?message=${encodeURIComponent(error.message)}`);
    
  }
};

async function refreshAccessTokenIfNeeded(tokens) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://email-automation-ivory.vercel.app/api/routes/Google?action=handleOAuth2Callback'
  );

  oAuth2Client.setCredentials({
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token,
    expiry_date: tokens.expiry_date,
  });

  const FIVE_MINUTES = 5 * 60 * 1000;
  const currentTime = Date.now();

  if (tokens.expiry_date - currentTime < FIVE_MINUTES) {
    try {
      const { credentials } = await oAuth2Client.refreshAccessToken();
      console.log('Access token refreshed:', credentials);

      return {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || tokens.refresh_token,
        expiry_date: credentials.expiry_date,
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Could not refresh access token');
    }
  }

  return tokens;
}

exports.sendEmail = async (req, res) => {
  const { user_email, to, subject, text } = req.body;

  try {
    await connectToDatabase();
    const user = await User.findOne({ linkedInProfileEmail: user_email });
    if (!user || !user.gmailAccessToken || !user.gmailRefreshToken || !user.gmailExpiryDate) {
      return res.status(400).json({ success: false, message: 'Missing Gmail OAuth tokens for this user' });
    }

    const tokens = await refreshAccessTokenIfNeeded({
      access_token: user.gmailAccessToken,
      refresh_token: user.gmailRefreshToken,
      expiry_date: parseInt(user.gmailExpiryDate, 10),
    });

    if (tokens.access_token !== user.gmailAccessToken || tokens.expiry_date !== parseInt(user.gmailExpiryDate, 10)) {
      user.gmailAccessToken = tokens.access_token;
      user.gmailExpiryDate = tokens.expiry_date;
      await user.save();
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: user_email,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
      },
    });

    const mailOptions = {
      from: user_email,
      to: to || user_email,
      subject: subject || 'Test Email from Gmail OAuth2',
      text: text || 'This is a test email sent using Gmail OAuth2 authorization.',
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully',
      updatedTokens: tokens,
    });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

