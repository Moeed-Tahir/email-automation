// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');

// // OAuth Configuration
// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID || '34860616241-1kcc767m6k6isr2tnmpq4levhjb5lm7k.apps.googleusercontent.com',
//   process.env.CLIENT_SECRET || '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',
//   process.env.REDIRECT_URI || 'https://developers.google.com/oauthplayground'
// );

// // Set credentials from environment variable
// oAuth2Client.setCredentials({
//   refresh_token: process.env.REFRESH_TOKEN || '1//04ON2dz3DYjQpCgYIARAAGAQSNwF-L9Ir0_Zbr605F9pKQLaAe2vN83NM67biKOFWPIi9IkGjTQQFtcfTgn8D7CALPaWbAV3KGx4'
// });

// async function sendEmail(req, res) {
//   try {
//     const { to, subject, text, fromEmail } = req.body;

//     // Validate required fields
//     if (!to || !subject || !text || !fromEmail) {
//       return res.status(400).json({ 
//         error: 'Missing required fields (to, subject, text, fromEmail)' 
//       });
//     }

//     // Get access token
//     const { token: accessToken } = await oAuth2Client.getAccessToken();

//     // Create transporter with dynamic sender email
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: fromEmail, // Dynamic sender email
//         clientId: oAuth2Client._clientId,
//         clientSecret: oAuth2Client._clientSecret,
//         refreshToken: oAuth2Client.credentials.refresh_token,
//         accessToken: accessToken,
//       },
//     });

//     // Send email
//     const result = await transporter.sendMail({
//       from: `"Your App" <${fromEmail}>`,
//       to,
//       subject,
//       text,
//     });

//     return res.status(200).json({ 
//       success: true, 
//       message: 'Email sent successfully',
//       result 
//     });

//   } catch (error) {
//     console.error('Error sending email:', error);
//     return res.status(500).json({ 
//       success: false, 
//       message: 'Failed to send email',
//       error: error.message,
//       solution: 'Ensure the sender email is added to Google Cloud Console OAuth consent screen test users'
//     });
//   }
// }

// module.exports = { sendEmail };

// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');
// const { v4: uuidv4 } = require('uuid');

// const CLIENT_ID = process.env.CLIENT_ID || '34860616241-1kcc767m6k6isr2tnmpq4levhjb5lm7k.apps.googleusercontent.com';
// const CLIENT_SECRET = process.env.CLIENT_SECRET || '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';
// const REDIRECT_URI = 'http://localhost:3000/api/routes/Google?action=handleOAuth2Callback';

// const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// const tokenStore = new Map(); // In production, use a database

// exports.startAuth = (req, res) => {
//   const userEmail = req.query.email;
//   const sessionId = uuidv4(); // Create a unique session ID

//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     prompt: 'consent',
//     scope: ['https://mail.google.com/'],
//     state: JSON.stringify({ userEmail, sessionId }),
//   });

//   res.redirect(authUrl);
// };

// exports.handleOAuth2Callback = async (req, res) => {
//   try {
//     const code = req.query.code;
//     const { userEmail, sessionId } = JSON.parse(req.query.state);

//     const { tokens } = await oAuth2Client.getToken(code);

//     tokenStore.set(sessionId, {
//       userEmail,
//       tokens,
//       createdAt: Date.now()
//     });
//     res.redirect(`http://localhost:3000/emailForm?sessionId=${sessionId}`);

//   } catch (error) {
//     console.error('OAuth2 Error:', error);
//     res.status(500).send(`<h2>❌ Error during authorization: ${error.message}</h2>`);
//   }
// };

// exports.sendEmail = async (req, res) => {
//   const { sessionId, to, subject, text } = req.body;

//   try {
//     if (!tokenStore.has(sessionId)) {
//       throw new Error('Session expired or invalid. Please re-authenticate.');
//     }

//     const { userEmail, tokens } = tokenStore.get(sessionId);

//     oAuth2Client.setCredentials(tokens);
//     const refreshedTokens = await oAuth2Client.refreshAccessToken();
//     tokenStore.set(sessionId, {
//       ...tokenStore.get(sessionId),
//       tokens: refreshedTokens.credentials
//     });

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         type: 'OAuth2',
//         user: userEmail,
//         clientId: CLIENT_ID,
//         clientSecret: CLIENT_SECRET,
//         refreshToken: refreshedTokens.credentials.refresh_token,
//         accessToken: refreshedTokens.credentials.access_token,
//       },
//     });

//     const mailOptions = {
//       from: userEmail,
//       to: to || userEmail,
//       subject: subject || 'Test Email from Gmail OAuth2',
//       text: text || 'This is a test email sent using persistent Gmail OAuth2 authorization.',
//     };

//     await transporter.sendMail(mailOptions);
//     res.json({ success: true, message: 'Email sent successfully' });
//   } catch (error) {
//     console.error('Email sending error:', error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

// Environment variables with fallback (remove hardcoded values in production)
const CLIENT_ID = process.env.CLIENT_ID || '34860616241-1kcc767m6k6isr2tnmpq4levhjb5lm7k.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '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';
const REDIRECT_URI = 'http://localhost:3000/api/routes/Google?action=handleOAuth2Callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Missing required environment variables: CLIENT_ID and CLIENT_SECRET');
}

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// Enhanced token store with expiration (in production, use Redis or database)
const tokenStore = {
  _store: new Map(),
  _cleanupInterval: setInterval(() => {
    const now = Date.now();
    for (const [key, value] of this._store.entries()) {
      if (now - value.createdAt > 24 * 60 * 60 * 1000) { // 10 day expiration
        this._store.delete(key);
      }
    }
  }, 60 * 60 * 1000), // Cleanup every hour

  get(key) {
    return this._store.get(key);
  },

  set(key, value) {
    this._store.set(key, {
      ...value,
      lastAccessed: Date.now()
    });
  },

  delete(key) {
    this._store.delete(key);
  },

  has(key) {
    return this._store.has(key);
  }
};

exports.startAuth = (req, res) => {
  const userEmail = req.query.email;
  if (!userEmail) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  const sessionId = uuidv4();
  const state = JSON.stringify({
    userEmail,
    sessionId,
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
    const code = req.query.code;
    if (!code) {
      throw new Error('Authorization code missing');
    }

    const state = req.query.state;
    if (!state) {
      throw new Error('State parameter missing');
    }

    const { userEmail, sessionId } = JSON.parse(state);
    if (!userEmail || !sessionId) {
      throw new Error('Invalid state parameter');
    }

    const { tokens } = await oAuth2Client.getToken(code);
    if (!tokens.refresh_token) {
      throw new Error('No refresh token received - make sure to request offline access');
    }

    tokenStore.set(sessionId, {
      userEmail,
      tokens,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    });

    res.redirect(`http://localhost:3000/emailForm?sessionId=${sessionId}`);

  } catch (error) {
    console.error('OAuth2 Error:', error);
    res.status(500).send(`<h2>❌ Error during authorization: ${error.message}</h2>`);
  }
};

exports.sendEmail = async (req, res) => {
  const { sessionId, to, subject, text } = req.body;
  console.log("sessionId",sessionId);
  try {
    if (!sessionId || !tokenStore.has(sessionId)) {
      throw new Error('Session expired or invalid. Please re-authenticate.');
    }

    const sessionData = tokenStore.get(sessionId);
    const { userEmail, tokens } = sessionData;

    // Update last accessed time
    tokenStore.set(sessionId, {
      ...sessionData,
      lastAccessed: Date.now()
    });

    oAuth2Client.setCredentials(tokens);

    // Refresh token if needed (auto-refreshed by google-auth-library)
    const { credentials } = await oAuth2Client.refreshAccessToken();

    // Update stored tokens
    tokenStore.set(sessionId, {
      ...sessionData,
      tokens: credentials,
      lastAccessed: Date.now()
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: userEmail,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: credentials.refresh_token,
        accessToken: credentials.access_token,
      },
    });

    const mailOptions = {
      from: userEmail,
      to: to || userEmail,
      subject: subject || 'Test Email from Gmail OAuth2',
      text: text || 'This is a test email sent using persistent Gmail OAuth2 authorization.',
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);

    // If it's an auth error, clear the session
    if (error.message.includes('invalid_grant') || error.message.includes('unauthorized_client')) {
      tokenStore.delete(sessionId);
    }

    res.status(500).json({
      success: false,
      message: error.message,
      requiresReauth: error.message.includes('invalid_grant') || error.message.includes('unauthorized_client')
    });
  }
};

// Add session validation middleware
exports.validateSession = (req, res, next) => {
  const sessionId = req.body.sessionId || req.query.sessionId;

  if (!sessionId || !tokenStore.has(sessionId)) {
    return res.status(401).json({
      error: 'Session expired or invalid',
      requiresReauth: true
    });
  }

  next();
};