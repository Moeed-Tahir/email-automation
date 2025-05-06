const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const SurvayForm = require('../models/SurvayForm');
const dotenv = require("dotenv");
dotenv.config();

const connectToDatabase = require('../lib/db');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.REQUEST_URL}/api/routes/Google?action=handleOAuth2Callback`;

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
    await startEmailMonitoring(userEmail);

    res.redirect(`${process.env.REQUEST_URL}/login/?currentStep=3`);

  } catch (error) {
    console.error('OAuth2 Error:', error);
    res.redirect(`${process.env.REQUEST_URL}/auth-error?message=${encodeURIComponent(error.message)}`);

  }
};

async function refreshAccessTokenIfNeeded(tokens) {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    `${process.env.REQUEST_URL}/api/routes/Google?action=handleOAuth2Callback`
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

const startEmailMonitoring = async (userEmail) => {
  console.log(`Starting email monitoring for: ${userEmail}`);

  if (activeMonitors[userEmail]) {
    clearInterval(activeMonitors[userEmail]);
    delete activeMonitors[userEmail];
  }

  try {
    await checkAndProcessEmails(userEmail);
  } catch (error) {
    console.error(`Initial email check failed for ${userEmail}:`, error);
  }

  activeMonitors[userEmail] = setInterval(async () => {
    try {
      await checkAndProcessEmails(userEmail);
    } catch (error) {
      console.error(`Error in email monitoring for ${userEmail}:`, error);
    }
  }, 2 * 60 * 1000); 

  console.log(`Email monitoring successfully started for ${userEmail}`);
};

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
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F2F5F8; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden;">
                
                <!-- Logo -->
                <tr>
                  <td align="left" style="padding: 20px;">
                    <img src="https://i.ibb.co/Sw1L2drq/Logo-5.png" alt="Logo" style="height: 40px;">
                  </td>
                </tr>
    
                <!-- Heading -->
                <tr>
                  <td style="padding: 0 20px;">
                    <h1 style="font-size: 20px; font-weight: 600; color: #2D3748; border-bottom: 1px dotted #CBD5E0; padding-bottom: 10px; margin: 0;">
                      Survey Form
                    </h1>
                  </td>
                </tr>
    
                <!-- Message -->
                <tr>
                  <td style="padding: 20px; font-size: 16px; color: #4A5568; line-height: 1.6;">
                    <p>Hello,</p>
                    <p>We would appreciate your feedback! Please fill out our short survey by clicking the button below:</p>
                  </td>
                </tr>
    
                <!-- Button -->
<tr>
  <td align="left" style="padding: 20px;">
    <a href="${process.env.REQUEST_URL}/survay-form/${userId}?userId=${userId}"
       style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #2C514C; border: 2px solid #2C514C; text-decoration: none; border-radius: 4px;">
      Complete Survey
    </a>
  </td>
</tr>
    
              </table>
    
              <!-- Footer -->
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px;">
                <tr>
                  <td align="center" style="font-size: 12px; color: #A0AEC0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left">
                          <img src="https://i.ibb.co/Sw1L2drq/Logo-5.png" alt="Footer Logo" style="height: 24px;">
                        </td>
                         <td align="right">
                          <a href="#"><img src="https://i.ibb.co/Cs6pK9z4/line-md-twitter.png" alt="Twitter" style="height: 20px; margin-left: 10px;"></a>
                          <a href="#"><img src="https://i.ibb.co/5XBf27WK/ic-baseline-facebook.png" alt="Facebook" style="height: 20px; margin-left: 10px;"></a>
                          <a href="#"><img src="https://i.ibb.co/XfqBK7wS/mdi-linkedin.png" alt="LinkedIn" style="height: 20px; margin-left: 10px;"></a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
    
            </td>
          </tr>
        </table>
      `
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
  }
};

exports.sendAcceptEmailToAdmin = async (req, res) => {
  try {
    await connectToDatabase();
    const { sendFromEmail, sendToEmail, dashboardUserId, mainUserId, objectId, bidAmount, name, surveyId, userName } = req.body;

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
      subject: `Meeting Confirmed with ${userName}`,
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F2F5F8; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden;">
                <!-- Logo -->
                <tr>
                  <td align="left" style="padding: 20px;">
                    <img src="https://i.ibb.co/Sw1L2drq/Logo-5.png" alt="Logo" style="height: 40px;">
                  </td>
                </tr>
    
                <!-- Heading -->
                <tr>
                  <td style="padding: 0 20px;">
                    <h1 style="font-size: 20px; font-weight: 600; color: #2D3748; border-bottom: 1px dotted #CBD5E0; padding-bottom: 10px; margin: 0;">
                      Meeting Confirmed with Micheal
                    </h1>
                  </td>
                </tr>
    
                <!-- Message -->
                <tr>
                  <td style="padding: 20px; font-size: 16px; color: #4A5568; line-height: 1.6;">
                    <p>Dear <strong>${userName}</strong>,</p>
                    <p>Great news! Micheal has accepted your meeting request. You can now schedule your meeting using the link below:</p>
                    <p>Please complete your donation to [Executive's Selected Charity] as per the agreed amount of <strong>${bidAmount}</strong>.</p>
    
                    <!-- Business Executive Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F7FAFC; padding: 16px; border-radius: 6px; margin-top: 20px;">
                      <tr>
                        <td style="padding: 10px;">
                          <p style="margin: 0; font-weight: 600;">📌 Business Executive Details:</p>
                          <ul style="margin: 10px 0 0 20px; padding: 0;">
                            <li><strong>Name:</strong> ${name}</li>
                            <li><strong>Email:</strong> ${sendToEmail}</li>
                            <li><strong>Proposed Donation:</strong> <strong>${bidAmount}</strong></li>
                          </ul>
                        </td>
                      </tr>
                    </table>
    
                    <!-- Closing -->
                    <p style="margin-top: 20px;">Thank you for your generosity and participation!<br>Best,</p>
                    <p>[Email-Automation] Team</p>
                  </td>
                </tr>
    
                <!-- Button -->
                <tr>
  <td align="left" style="padding: 20px;">
    <a href="${process.env.REQUEST_URL}/upload-receipt?dashboardUserId=${dashboardUserId}&mainUserId=${mainUserId}&surveyId=${surveyId}&surveyObjectId=${objectId}"
       style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #2C514C; border: 2px solid #2C514C; text-decoration: none; border-radius: 4px;">
      Upload Receipt
    </a>
  </td>
</tr>
    
              </table>
    
              <!-- Footer -->
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px;">
                <tr>
                  <td align="center" style="font-size: 12px; color: #A0AEC0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left">
                          <img src="https://i.ibb.co/Sw1L2drq/Logo-5.png" alt="Footer Logo" style="height: 24px;">
                        </td>
                        <td align="right">
                          <a href="#"><img src="https://i.ibb.co/Cs6pK9z4/line-md-twitter.png" alt="Twitter" style="height: 20px; margin-left: 10px;"></a>
                          <a href="#"><img src="https://i.ibb.co/5XBf27WK/ic-baseline-facebook.png" alt="Facebook" style="height: 20px; margin-left: 10px;"></a>
                          <a href="#"><img src="https://i.ibb.co/XfqBK7wS/mdi-linkedin.png" alt="LinkedIn" style="height: 20px; margin-left: 10px;"></a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
    
            </td>
          </tr>
        </table>
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
    const { sendFromEmail, sendToEmail, objectId } = req.body;

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

    const updatedForm = await SurvayForm.findByIdAndUpdate(
      objectId,
      { status: "Reject" },
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
      subject: "Meeting Rejected with Micheal",
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F2F5F8; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden;">
                <!-- Logo -->
                <tr>
                  <td align="left" style="padding: 20px;">
                    <img src="https://i.ibb.co/Sw1L2drq/Logo-5.png" alt="Logo" style="height: 40px;">
                  </td>
                </tr>
    
                <!-- Heading -->
                <tr>
                  <td style="padding: 0 20px;">
                    <h1 style="font-size: 20px; font-weight: 600; color: #2D3748; border-bottom: 1px dotted #CBD5E0; padding-bottom: 10px; margin: 0;">
                      Meeting Rejected with Micheal
                    </h1>
                  </td>
                </tr>
    
                <!-- Message -->
                <tr>
            </tr>
  
              </table>
    
              <!-- Footer -->
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="margin-top: 30px;">
                <tr>
                  <td align="center" style="font-size: 12px; color: #A0AEC0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left">
                          <img src="https://i.ibb.co/Sw1L2drq/Logo-5.png" alt="Footer Logo" style="height: 24px;">
                        </td>
                         <td align="right">
                          <a href="#"><img src="https://i.ibb.co/Cs6pK9z4/line-md-twitter.png" alt="Twitter" style="height: 20px; margin-left: 10px;"></a>
                          <a href="#"><img src="https://i.ibb.co/5XBf27WK/ic-baseline-facebook.png" alt="Facebook" style="height: 20px; margin-left: 10px;"></a>
                          <a href="#"><img src="https://i.ibb.co/XfqBK7wS/mdi-linkedin.png" alt="LinkedIn" style="height: 20px; margin-left: 10px;"></a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
    
            </td>
          </tr>
        </table>
      `
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