const connectToDatabase = require('../lib/db');
const Admin = require('../models/Admin');
const nodemailer = require('nodemailer');
const Donation = require('../models/Donation');
const SurvayForm = require('../models/SurvayForm');

const dotenv = require("dotenv");
dotenv.config();

const uploadReciptData = async (req, res) => {
  try {
    await connectToDatabase();

    const { executiveEmail, executiveName, donation, receiptFormLink, userId, surveyId } = req.body;

    const surveyData = await SurvayForm.findOne({ survayId: surveyId });

    if (!surveyData) {
      return res.status(404).json({ message: "Survey data not found for the given userId" });
    }

    const salesRepresentiveEmail = surveyData.email;
    const salesRepresentiveName = surveyData.name;

    const newAdminForm = await Admin.create({
      executiveEmail,
      executiveName,
      salesRepresentiveEmail,
      salesRepresentiveName,
      donation,
      receiptFormLink,
      userId
    });

    res.status(200).json({ message: "Receipt Form Sent Successfully", newAdminForm });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const fetchReciptData = async (req, res) => {
  try {
    await connectToDatabase();

    const receipts = await Admin.find();

    res.status(200).json({ message: "Receipts fetched successfully", receipts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const sendAcceptEmailFromAdmin = async (req, res) => {
  try {
    await connectToDatabase();
    const { salesRepresentiveEmail, salesRepresentiveName, executiveName, executiveEmail, objectId, donation, userId } = req.body;

    if (!salesRepresentiveEmail || !salesRepresentiveName || !executiveName || !executiveEmail || !objectId || !donation || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields in request body'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'moeedtahir29@gmail.com',
        pass: 'bdam zyum ygcv ntqq',
      },
    });

    const mailOptions = {
      from: 'Email-Automation <moeedtahir29@gmail.com>',
      to: executiveEmail,
      cc: salesRepresentiveEmail,
      subject: 'Meeting Confirmation and Payment Verification',
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
                      Meeting Confirmed with ${salesRepresentiveName}
                    </h1>
                  </td>
                </tr>
    
                <!-- Message -->
                <tr>
                  <td style="padding: 20px; font-size: 16px; color: #4A5568; line-height: 1.6;">
                    <p>Dear <strong>${executiveName}</strong>,</p>
                    <p>Great news! ${salesRepresentiveName} has accepted your meeting request. You can now schedule your meeting using the link below:</p>
                    <p>Please complete your donation to [Executive's Selected Charity] as per the agreed amount of <strong>${donation}</strong>.</p>
    
                    <!-- Business Executive Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F7FAFC; padding: 16px; border-radius: 6px; margin-top: 20px;">
                      <tr>
                        <td style="padding: 10px;">
                          <p style="margin: 0; font-weight: 600;">📌 Business Executive Details:</p>
                          <ul style="margin: 10px 0 0 20px; padding: 0;">
                            <li><strong>Name:</strong> ${executiveName}</li>
                            <li><strong>Email:</strong> ${executiveEmail}</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F7FAFC; padding: 16px; border-radius: 6px; margin-top: 20px;">
                      <tr>
                        <td style="padding: 10px;">
                          <p style="margin: 0; font-weight: 600;">📌 Business Sales Details:</p>
                          <ul style="margin: 10px 0 0 20px; padding: 0;">
                            <li><strong>Name:</strong> ${salesRepresentiveName}</li>
                            <li><strong>Email:</strong> ${salesRepresentiveEmail}</li>
                          </ul>
                        </td>
                      </tr>
                    </table>
    
                    <!-- Closing -->
                    <p style="margin-top: 20px;">Thank you for your generosity and participation!<br>Best,</p>
                    <p>Email-Automation Team</p>
                  </td>
                </tr>
    
                <!-- Button -->
                <tr>
  <td align="center" style="padding: 20px;">
    <a href="#" 
       style="display: inline-block; padding: 12px 24px; font-size: 16px; font-weight: 600; color: #ffffff; background-color: #2C514C; border: 2px solid #2C514C; text-decoration: none; border-radius: 4px;">
      Book a Meeting
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

    const updatedForm = await Admin.findByIdAndUpdate(
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

    await addDonation({
      salesRepresentiveName,
      salesRepresentiveEmail,
      executiveEmail,
      executiveName,
      donation,
      userId
    });

    res.json({
      success: true,
      message: 'Email sent successfully, survey status updated, and donation recorded',
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

const sendRejectEmailFromAdmin = async (req, res) => {
  try {
    await connectToDatabase();
    const { objectId,executiveEmail } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'moeedtahir29@gmail.com',
        pass: 'bdam zyum ygcv ntqq',
      },
    });

    const mailOptions = {
      from: 'Email-Automation <moeedtahir29@gmail.com>',
      to: executiveEmail,
      subject: 'Meeting Confirmation and Payment Verification',
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
                      Meeting Rejected with Admin
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

    const updatedForm = await Admin.findByIdAndUpdate(
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

    res.json({
      success: true,
      message: 'Email sent successfully, survey status updated, and donation recorded',
    });

  } catch (error) {
    console.error('Error sending email or updating status:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email or update status',
    });
  }
};

const addDonation = async (donationData) => {
  try {
    await connectToDatabase();

    const newDonation = await Donation.create({
      salesRepresentiveName: donationData.salesRepresentiveName,
      salesRepresentiveEmail: donationData.salesRepresentiveEmail,
      executiveEmail: donationData.executiveEmail,
      executiveName: donationData.executiveName,
      donation: donationData.donation,
      userId: donationData.userId
    });

    return newDonation;
  } catch (error) {
    console.error("Error adding donation:", error);
    throw error;
  }
}

const getDonation = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId } = req.body;

    const query = userId ? { userId } : {};
    const donations = await Donation.find(query);

    res.status(200).json({
      success: true,
      message: "Donations retrieved successfully",
      data: donations
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve donations",
      error: error.message
    });
  }
}

module.exports = { uploadReciptData, fetchReciptData, sendAcceptEmailFromAdmin, addDonation, getDonation,sendRejectEmailFromAdmin };