const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const SurvayForm = require('../models/SurvayForm');

const connectToDatabase = require('../lib/db');

const CLIENT_ID = process.env.CLIENT_ID || '34860616241-1kcc767m6k6isr2tnmpq4levhjb5lm7k.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.CLIENT_SECRET || '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';
const REDIRECT_URI = 'http://localhost:3000/api/routes/Google?action=handleOAuth2Callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Missing required environment variables: CLIENT_ID and CLIENT_SECRET');
}

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const activeMonitors = {};

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
    startEmailMonitoring(userEmail);

    res.redirect(`http://localhost:3000/login/?currentStep=3`);

  } catch (error) {
    console.error('OAuth2 Error:', error);
    res.redirect(`http://localhost:3000/auth-error?message=${encodeURIComponent(error.message)}`);

  }
};

async function refreshAccessTokenIfNeeded(tokens) {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    'http://localhost:3000/api/routes/Google?action=handleOAuth2Callback'
  );

  oAuth2Client.setCredentials({
    refresh_token: tokens.refresh_token,
  });

  const FIVE_MINUTES = 5 * 60 * 1000;
  const currentTime = Date.now();

  if (tokens.expiry_date - currentTime < FIVE_MINUTES) {
    try {
      const accessTokenResponse = await oAuth2Client.getAccessToken();
      const newAccessToken = accessTokenResponse?.token;

      if (!newAccessToken) throw new Error('Failed to get new access token');

      const newExpiryDate = Date.now() + 60 * 60 * 1000;

      return {
        access_token: newAccessToken,
        refresh_token: tokens.refresh_token,
        expiry_date: newExpiryDate,
      };
    } catch (error) {
      console.error('Error refreshing access token:', error.response?.data || error.message);
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

exports.getEmails = async (req, res) => {
  const { user_email } = req.body;

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

    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oAuth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 70,
      q: 'is:unread',
      orderBy: 'date',
      labelIds: ['INBOX']
    });

    const messages = response.data.messages || [];

    console.log(`Found ${messages.length} unread messages`);

    const fullMessages = [];
    for (const msg of messages) {
      const messageData = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'metadata',
        metadataHeaders: ['Subject', 'From', 'Date']
      });
      fullMessages.push(messageData);
    }

    const emails = fullMessages.map(msg => ({
      id: msg.data.id,
      snippet: msg.data.snippet,
      subject: msg.data.payload.headers.find(h => h.name === 'Subject')?.value || '(No subject)',
      from: msg.data.payload.headers.find(h => h.name === 'From')?.value || '',
      date: msg.data.payload.headers.find(h => h.name === 'Date')?.value || '',
      isUnread: msg.data.labelIds.includes('UNREAD'),
      internalDate: msg.data.internalDate
    }));

    emails.sort((a, b) => parseInt(b.internalDate) - parseInt(a.internalDate));

    res.json({ success: true, emails });

  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

async function startEmailMonitoring(userEmail) {
  if (activeMonitors[userEmail]) {
    clearInterval(activeMonitors[userEmail]);
  }

  activeMonitors[userEmail] = setInterval(async () => {
    try {
      await checkAndProcessEmails(userEmail);
    } catch (error) {
      console.error(`Error in email monitoring for ${userEmail}:`, error);
    }
  }, 3 * 60 * 1000);

  await checkAndProcessEmails(userEmail);
}

async function checkAndProcessEmails(userEmail) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ linkedInProfileEmail: userEmail });
    if (!user || !user.gmailAccessToken || !user.gmailRefreshToken || !user.gmailExpiryDate) {
      console.log(`Missing Gmail OAuth tokens for user ${userEmail}`);
      return;
    }

    const userCreatedTime = new Date(user.createdAt).getTime();

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

    const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oAuth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const query = `is:unread (subject:"Hello World" OR "Hello World") after:${Math.floor(userCreatedTime / 1000)}`;

    let allMessages = [];
    let nextPageToken = null;

    do {
      const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 100,
        pageToken: nextPageToken,
        q: query,
        orderBy: 'date',
        labelIds: ['INBOX']
      });

      if (response.data.messages) {
        allMessages = allMessages.concat(response.data.messages);
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    console.log(`Found ${allMessages.length} unread messages containing "Hello World" for ${userEmail} since account creation`);

    if (allMessages.length > 0) {
      for (const msg of allMessages) {
        try {
          const messageData = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });

          const messageContent = JSON.stringify(messageData.data).toLowerCase();
          if (!messageContent.includes('hello world')) {
            continue;
          }

          const fromHeader = messageData.data.payload.headers.find(h => h.name === 'From');
          const fromEmail = fromHeader ? fromHeader.value.match(/<([^>]+)>/)?.[1] || fromHeader.value : '';

          if (fromEmail) {
            console.log(`Processing email from ${fromEmail} with subject: ${messageData.data.payload.headers.find(h => h.name === 'Subject')?.value || '(No subject)'
              }`);

            await sendResponseEmail(userEmail, fromEmail, tokens, user.userId);

            await gmail.users.messages.modify({
              userId: 'me',
              id: msg.id,
              requestBody: {
                removeLabelIds: ['UNREAD']
              }
            });
          }
        } catch (error) {
          console.error(`Error processing message ${msg.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing emails for ${userEmail}:`, error);
  }
}

async function sendResponseEmail(userEmail, toEmail, tokens, userId) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: userEmail,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
      },
    });

    const mailOptions = {
      from: userEmail,
      to: toEmail,
      subject: 'Re: Hello World',
      text: `This is the survey Form http://localhost:3000/survay-form/${userId}`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Sent response email from ${userEmail} to ${toEmail}`);
  } catch (error) {
    console.error(`Error sending response email from ${userEmail} to ${toEmail}:`, error);
  }
}

exports.stopMonitoring = (userEmail) => {
  if (activeMonitors[userEmail]) {
    clearInterval(activeMonitors[userEmail]);
    delete activeMonitors[userEmail];
    console.log(`Stopped monitoring for ${userEmail}`);
  }
};

exports.sendAcceptEmailToAdmin = async (req, res) => {
  try {
    await connectToDatabase();
    const { sendFromEmail, sendToEmail, dashboardUserId, mainUserId, objectId } = req.body;

    const user = await User.findOne({ linkedInProfileEmail: sendFromEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.gmailAccessToken || !user.gmailRefreshToken || !user.gmailExpiryDate) {
      return res.status(400).json({
        success: false,
        message: 'User has not authorized Gmail access'
      });
    }

    const tokens = await refreshAccessTokenIfNeeded({
      access_token: user.gmailAccessToken,
      refresh_token: user.gmailRefreshToken,
      expiry_date: parseInt(user.gmailExpiryDate, 10),
    });

    if (tokens.access_token !== user.gmailAccessToken ||
      tokens.expiry_date !== parseInt(user.gmailExpiryDate, 10)) {
      user.gmailAccessToken = tokens.access_token;
      user.gmailExpiryDate = tokens.expiry_date;
      await user.save();
    }

    const updatedForm = await SurvayForm.findByIdAndUpdate(
      objectId,
      { status: "Accept" },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(404).json({
        success: false,
        message: 'Survey form not found'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: sendFromEmail,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
      },
    });

    const mailOptions = {
      from: sendFromEmail,
      to: sendToEmail,
      subject: "This is the Accept Subject",
      html: `
        <div style="text-align: center;">
          <p>Hello,</p>
          <p>Click the button below to upload your receipt:</p>
          <a href="http://localhost:3000/upload-receipt?dashboardUserId=${dashboardUserId}&mainUserId=${mainUserId}" 
             style="
               display: inline-block;
               padding: 10px 20px;
               font-size: 16px;
               color: white;
               background-color: #4CAF50;
               text-decoration: none;
               border-radius: 5px;
               margin-top: 10px;
             ">
             Upload Receipt
          </a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully and survey status updated',
      updatedForm
    });

  } catch (error) {
    console.error('Error sending email or updating status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email or update status',
    });
  }
};

exports.sendRejectEmailToAdmin = async (req, res) => {
  try {
    const { sendFromEmail, sendToEmail } = req.body;

    await connectToDatabase();

    const user = await User.findOne({ linkedInProfileEmail: sendFromEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.gmailAccessToken || !user.gmailRefreshToken || !user.gmailExpiryDate) {
      return res.status(400).json({
        success: false,
        message: 'User has not authorized Gmail access'
      });
    }

    const tokens = await refreshAccessTokenIfNeeded({
      access_token: user.gmailAccessToken,
      refresh_token: user.gmailRefreshToken,
      expiry_date: parseInt(user.gmailExpiryDate, 10),
    });

    if (tokens.access_token !== user.gmailAccessToken ||
      tokens.expiry_date !== parseInt(user.gmailExpiryDate, 10)) {
      user.gmailAccessToken = tokens.access_token;
      user.gmailExpiryDate = tokens.expiry_date;
      await user.save();
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: sendFromEmail,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: tokens.refresh_token,
        accessToken: tokens.access_token,
      },
    });

    const mailOptions = {
      from: sendFromEmail,
      to: sendToEmail,
      subject: "This is the Reject Subject",
      text: "This is the Reject text",
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email sent successfully',
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email',
    });
  }
};