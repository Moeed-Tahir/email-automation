const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const connectToDatabase = require('../lib/db');
const dotenv = require("dotenv");
dotenv.config();
const User = require('../models/User');

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.REQUEST_URL}/api/routes/Google?action=handleOAuth2Callback`;

const startEmailMonitoring = async (req, res) => {
  const { userEmail, userName } = req.body;
  try {

    await checkAndProcessEmails(userEmail, userName);
    res.status(200).json({ message: `Email monitoring started for ${userEmail}` });
  } catch (error) {
    console.error(`Initial email check failed for ${userEmail}:`, error);
    res.status(500).json({ error: 'Failed to start email monitoring.' });
  }
};

async function checkAndProcessEmails(userEmail, userName) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ userProfileEmail: userEmail });
    if (!user || !user.gmailAccessToken || !user.gmailRefreshToken || !user.gmailExpiryDate) {
      console.log(`Missing Gmail OAuth tokens for user ${userEmail}`);
      return;
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

    const baseTerms = [
      'hello world',
      'ai co-pilot',
      'cut grunt work',
      'automate',
      'workflow',
      'internal ops systems',
      'trained on your data',
      'sales-qualified lead',
      'increase leads',
      'outbound sales',
      'lead generation',
      'perfect-fit leads',
      'cost per lead',
      'let\'s chat',
      'let\'s schedule',
      'book a call',
      'demo',
      'calendar',
      'slots open',
      'i\'d like to show you',
      'on the house',
      'test',
      'free demo',
      'as a test',
      'notion',
      'airtable',
      'asana',
      'internal tools',
      'saw you on our waitlist',
      'noticed how you',
      'took a peek at your website',
      'we\'re now live',
      'selectively onboarding',
      'i noticed'
    ];

    const queryTerms = baseTerms.flatMap(term => [
      `"${term}"`,
      `"${term.toUpperCase()}"`,
      `"${term.charAt(0).toUpperCase() + term.slice(1)}"`
    ]).join(' OR ');

    const userCreatedTime = new Date(user.createdAt).getTime();
    const query = `is:unread (${queryTerms}) after:${Math.floor(userCreatedTime / 1000)}`;

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

    console.log(`Found ${allMessages.length} unread messages containing trigger keywords for ${userEmail}`);

    if (allMessages.length > 0) {
      for (const msg of allMessages) {
        try {
          const messageData = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full'
          });

          const msgData = messageData.data;
          const subject = msgData.payload.headers.find(h => h.name === 'Subject')?.value || '(No subject)';
          const messageContent = msgData.snippet + ' ' + subject;

          const hasTriggerKeyword = baseTerms.some(keyword => {
            const regex = new RegExp(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
            return regex.test(messageContent);
          });

          if (!hasTriggerKeyword) {
            continue;
          }

          const fromHeader = msgData.payload.headers.find(h => h.name === 'From');
          let fromEmail = '';
          if (fromHeader) {
            const emailMatch = fromHeader.value.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            fromEmail = emailMatch ? emailMatch[0] : '';
          }

          if (!fromEmail || fromEmail.toLowerCase() === userEmail.toLowerCase()) {
            continue;
          }

          console.log(`Processing email from ${fromEmail} with subject: "${subject}"`);

          const messageId = msgData.payload.headers.find(h => h.name === 'Message-ID')?.value;
          const references = msgData.payload.headers.find(h => h.name === 'References')?.value || '';
          const inReplyTo = messageId || '';

          await sendResponseEmail(
            userEmail,
            fromEmail,
            tokens,
            user.userId,
            subject,
            references ? `${references} ${messageId}` : messageId,
            inReplyTo,
            user.userName,
            user.jobTitle,
            user.companyName,
            user.location
          );

          await gmail.users.messages.modify({
            userId: 'me',
            id: msg.id,
            requestBody: {
              removeLabelIds: ['UNREAD']
            }
          });

        } catch (error) {
          console.error(`Error processing message ${msg.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing emails for ${userEmail}:`, error);
    throw error;
  }
}

async function sendResponseEmail(
  userEmail,
  toEmail,
  tokens,
  userId,
  originalSubject,
  references,
  inReplyTo,
  userName,
  jobTitle,
  companyName,
  location
) {
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

    const adminTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info@makelastingchange.com',
        pass: 'vcvk scep luhp qosk',
      },
    })

    const mailOptions = {
      from: userEmail,
      to: toEmail,
      subject: `You Contacted ${userName} — Here's the Next Step`,
      html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F2F5F8; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden;">
            <!-- Logo -->
            <tr>
              <td align="left" style="padding: 20px;">
                <img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Logo%20(7).png" alt="Logo" style="height: 40px;">
              </td>
            </tr>
            
            <!-- Header -->
            <tr>
              <td style="padding: 20px; font-size: 16px; color: #4A5568; line-height: 1.6;">
                <p style="font-size: 24px; font-weight: 600; color: #2D3748; margin: 0 0 20px 0;">
                  ${userName} Reviews Meeting Requests Through Give2Meet
                </p>
                <p>Hi </p>
                <p>Thanks for reaching out!</p>
                <p>To manage a high volume of sales requests and make time count for more than just business, I use Give2Meet to review and qualify meetings. If you'd like to be considered, here's how to move forward:</p>
                <p>You'll be asked to:</p>
                <ul>
                  <li>Share a few quick details about how you can help</li>
                  <li>Pledge a donation to their chosen charity (only processed if the meeting happens)</li>
                </ul>
                <p>It's a simple way to prove the value of your outreach while supporting a good cause.</p>
              </td>
            </tr>
            
            <!-- Button -->
            <tr>
              <td align="left" style="padding: 0 20px 20px 20px;">
                <a href="${process.env.REQUEST_URL}/survay-form/${userId}?userId=${userId}"
                   style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #2C514C; border: 2px solid #2C514C; text-decoration: none; border-radius: 4px;">
                  Submit a Meeting Request
                </a>
              </td>
            </tr>
            
            <!-- Signature -->
            <tr>
              <td style="padding: 20px; font-size: 16px; color: #4A5568; line-height: 1.6;">
                <p>Thanks again for your interest.</p>
                <p>Best,<br>
                <strong>${userName}</strong><br>
                ${jobTitle}<br>
                ${companyName}<br>
                ${location}</p>
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
                      <img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Logo%20(7).png" alt="Footer Logo" style="height: 24px;">
                    </td>
                    <td align="right">
                      <a href="#"><img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Frame.png" alt="Twitter" style="height: 20px; margin-left: 10px;"></a>
                      <a href="#"><img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Frame%20(1).png" alt="Facebook" style="height: 20px; margin-left: 10px;"></a>
                      <a href="#"><img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Frame%20(2).png" alt="LinkedIn" style="height: 20px; margin-left: 10px;"></a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `,
      headers: {
        'References': references,
        'In-Reply-To': inReplyTo
      }
    };

    const adminMailOption = {
      from: "info@makelastingchange.com",
      to: "info@makelastingchange.com",
      subject: `Automated Reply: Survey Request from ${userName}`,
      html: `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F2F5F8; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden;">
            
            <!-- Logo -->
            <tr>
              <td align="left" style="padding: 20px;">
                <img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Logo%20(7).png" alt="Logo" style="height: 40px;">
              </td>
            </tr>

            <!-- Heading -->
            <tr>
              <td style="padding: 0 20px;">
                <h1 style="font-size: 20px; font-weight: 600; color: #2D3748; border-bottom: 1px dotted #CBD5E0; padding-bottom: 10px; margin: 0;">
                  Automated Survey Request Notification
                </h1>
              </td>
            </tr>

            <!-- Automated Message -->
            <tr>
              <td style="padding: 20px; font-size: 16px; color: #4A5568; line-height: 1.6;">
                <p><em>This is an automated message. Please do not reply directly to this email.</em></p>
                <p>A survey request has been automatically generated from the following executive:</p>
              </td>
            </tr>

            <!-- Executive and Sales Details -->
            <tr>
              <td style="padding: 0 20px 20px 20px; font-size: 16px; color: #4A5568; line-height: 1.6;">
                <table cellpadding="10" style="background-color: #F7FAFC; border-radius: 4px; width: 100%;">
                  <tr>
                    <td style="border-bottom: 1px solid #E2E8F0;">
                      <strong>Executive Name:</strong> ${userName}
                    </td>
                  </tr>
                  <tr>
                    <td style="border-bottom: 1px solid #E2E8F0;">
                      <strong>Executive Email:</strong> ${userEmail}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Recipient Email:</strong> ${toEmail}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="left" style="padding: 0 20px 20px 20px;">
                <a href="${process.env.REQUEST_URL}/survay-form/${userId}?userId=${userId}"
                   style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #2C514C; border: 2px solid #2C514C; text-decoration: none; border-radius: 4px;">
                  Complete Survey
                </a>
              </td>
            </tr>
            
            <!-- Additional Info -->
            <tr>
              <td style="padding: 0 20px 20px 20px; font-size: 14px; color: #718096; line-height: 1.6;">
                <p>If you did not expect to receive this survey or need assistance, please contact our support team.</p>
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
                      <img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Logo%20(7).png" alt="Footer Logo" style="height: 24px;">
                    </td>
                    <td align="right">
                      <a href="#"><img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Frame.png" alt="Twitter" style="height: 20px; margin-left: 10px;"></a>
                      <a href="#"><img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Frame%20(1).png" alt="Facebook" style="height: 20px; margin-left: 10px;"></a>
                      <a href="#"><img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Frame%20(2).png" alt="LinkedIn" style="height: 20px; margin-left: 10px;"></a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
  `,
      headers: {
        'References': references,
        'In-Reply-To': inReplyTo,
        'Auto-Submitted': 'auto-generated'
      }
    };

    await adminTransport.sendMail(adminMailOption);
    await transporter.sendMail(mailOptions);
    console.log(`Sent reply email from ${userEmail} to ${toEmail} in thread ${inReplyTo}`);
  } catch (error) {
    console.error(`Error sending response email from ${userEmail} to ${toEmail}:`, error);
  }
}

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

module.exports = { refreshAccessTokenIfNeeded, startEmailMonitoring }