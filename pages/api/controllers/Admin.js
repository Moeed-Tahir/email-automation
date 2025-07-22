const connectToDatabase = require('../lib/db');
const Admin = require('../models/Admin');
const nodemailer = require('nodemailer');
const Donation = require('../models/Donation');
const SurvayForm = require('../models/SurvayForm');
const dotenv = require("dotenv");
const User = require('../models/User');
dotenv.config();

const uploadReciptData = async (req, res) => {
  try {
    await connectToDatabase();

    const { executiveEmail, executiveName, donation, receiptFormLink, userId, surveyId } = req.body;

    const surveyData = await SurvayForm.findOne({ _id: surveyId });

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
      userId,
      surveyId,
      status: "Pending"
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

    const receipts = await Admin.find().lean();

    const userIds = [...new Set(receipts.map(r => r.userId).filter(Boolean))];
    const surveyIds = [...new Set(receipts.map(r => r.surveyId).filter(Boolean))];

    receipts.forEach(r => {
      if (!r.userId) console.log(`Receipt ${r._id} has no userId`);
      if (!r.surveyId) console.log(`Receipt ${r._id} has no surveyId`);
    });

    const [users, surveys] = await Promise.all([
      userIds.length ? User.find({ userId: { $in: userIds } }).lean() : Promise.resolve([]),
      surveyIds.length ? SurvayForm.find({ _id: { $in: surveyIds } }).lean() : Promise.resolve([])
    ]);

    surveys.forEach(s => console.log(`Survey found:`, {
      _id: s._id,
      city: s.city,
      state: s.state,
      country: s.country
    }));

    const userMap = users.reduce((map, user) => {
      if (!user.userId) {
        console.warn('Found user document without userId:', user._id);
        return map;
      }
      return {
        ...map,
        [user.userId]: {
          calendarLink: user.calendarLink,
          jobTitle: user.jobTitle,
          companyName: user.companyName,
          city: user.city,
          state: user.state,
          country: user.country,
          userName: user.userName,
          userProfileEmail: user.userProfileEmail
        }
      };
    }, {});

    const surveyMap = surveys.reduce((map, survey) => {
      return {
        ...map,
        [survey._id.toString()]: {
          city: survey.city,
          state: survey.state,
          country: survey.country,
          company: survey.company,
          jobTitle: survey.jobTitle
        }
      };
    }, {});

    const enrichedReceipts = receipts.map(receipt => {
      const result = { ...receipt };

      result.userInfo = receipt.userId ? userMap[receipt.userId] || null : null;

      if (receipt.surveyId && surveyMap[receipt.surveyId]) {
        const surveyData = surveyMap[receipt.surveyId];

        if (!result.userInfo) {
          result.userInfo = {};
        }

        if (result.userInfo.city === undefined && surveyData.city) {
          result.userInfo.city = surveyData.city;
        }
        if (result.userInfo.state === undefined && surveyData.state) {
          result.userInfo.state = surveyData.state;
        }
        if (result.userInfo.country === undefined && surveyData.country) {
          result.userInfo.country = surveyData.country;
        }

        if (!result.userInfo.companyName && surveyData.company) {
          result.userInfo.companyName = surveyData.company;
        }
        if (!result.userInfo.jobTitle && surveyData.jobTitle) {
          result.userInfo.jobTitle = surveyData.jobTitle;
        }

      }

      return result;
    });

    res.status(200).json({
      message: "Receipts fetched successfully",
      receipts: enrichedReceipts
    });

  } catch (error) {
    console.error("Error in fetchReciptData:", error);
    res.status(500).json({
      message: 'Server Error',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const sendAcceptEmailFromAdmin = async (req, res) => {
  try {
    await connectToDatabase();
    const {
      salesRepresentiveEmail,
      salesRepresentiveName,
      executiveName,
      executiveEmail,
      objectId,
      donation,
      userId,
      calendarLink,
      jobTitle,
      companyName,
      city,
      state,
      country
    } = req.body;

    console.log("req.body", req.body);

    if (
      !salesRepresentiveEmail ||
      !salesRepresentiveName ||
      !executiveName ||
      !executiveEmail ||
      !objectId ||
      !donation ||
      !userId ||
      !calendarLink ||
      !jobTitle ||
      !companyName ||
      !city ||
      !state ||
      !country
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields in request body'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info@makelastingchange.com',
        pass: 'vcvk scep luhp qosk',
      },
    });

    const firstName = salesRepresentiveName.split(' ')[0];

    const mailOptions1 = {
      from: `${executiveName} via Give2Meet <info@makelastingchange.com>`,
      to: salesRepresentiveEmail,
      subject: `Your Donation Is Confirmed — Schedule Your Meeting with ${executiveName}`,
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F2F5F8; font-family: Arial, sans-serif; line-height: 1.6; color: #333333;">
          <tr>
            <td style="padding: 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; margin: 0 auto;">
                <!-- Header -->
                <tr>
                  <td style="padding-bottom: 30px; text-align: center;">
                    <img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Logo%20(7).png" alt="Give2Meet Logo" style="max-height: 50px;">
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding-bottom: 30px;">
                    <h1 style="font-size: 24px; color: #2C514C; margin-bottom: 20px;">You're All Set! Book Your Meeting Now</h1>
                    <p style="margin-bottom: 20px;">Hi ${firstName},</p>
                    <p style="margin-bottom: 20px;">Thank you for completing your donation to [Charity Name]. Your support means a lot, and we're one step closer to meeting!</p>
                    
                    <h2 style="font-size: 18px; color: #2C514C; margin: 30px 0 15px 0;">What's Next:</h2>
                    <p style="margin-bottom: 20px;">Please use the link below to select a date and time that works best for you. The meeting will be added directly to my calendar and you will receive a calendar invitation to accept.</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${calendarLink}" style="display: inline-block; padding: 12px 24px; background-color: #2C514C; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold;">👉 Schedule Your Meeting Here</a>
                    </div>
                    
                    <p style="margin-bottom: 20px;">A few quick reminders. Your donation will be held in escrow until the meeting takes place. If the meeting is completed as scheduled, the donation will be released to the charity.</p>
                    <p style="margin-bottom: 20px;">Thanks again for using Give2Meet to make our time together meaningful and impactful.</p>
                    
                    <p style="margin-top: 30px;">
                      Best,<br>
                      <strong>${executiveName}</strong><br>
                      ${jobTitle}<br>
                      ${companyName}<br>
                      ${city}, ${state}, ${country}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #999999; text-align: center;">
                    <p>© ${new Date().getFullYear()} Give2Meet. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `
    };

    const mailOptions2 = {
      from: 'Give2Meet <info@makelastingchange.com>',
      to: executiveEmail,
      subject: 'Payment Successfully Uploaded',
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F2F5F8; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden;">
               <tr>
                  <td align="left" style="padding: 20px;">
                    <img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Logo%20(7).png" alt="Logo" style="height: 40px;">
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px; font-size: 16px; color: #4A5568; line-height: 1.6;">
                    <p>Dear <strong>${executiveName}</strong>,</p>
                    <p><strong>${salesRepresentiveName}</strong> has successfully uploaded the payment.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      `
    };

    await transporter.sendMail(mailOptions1);
    await transporter.sendMail(mailOptions2);

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
      message: 'Emails sent successfully, survey status updated, and donation recorded',
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
    const { objectId, executiveEmail, executiveName, salesRepresentiveEmail, salesRepresentiveName } = req.body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info@makelastingchange.com',
        pass: 'vcvk scep luhp qosk',
      },
    });

    const mailOptions = {
      from: 'Email-Automation <info@makelastingchange.com>',
      to: salesRepresentiveEmail,
      subject: 'Meeting Rejected with ' + executiveName,
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
                      Meeting Rejected with ${executiveName}
                    </h1>
                  </td>
                </tr>
    
                <!-- Message -->
                <tr>
          <td style="padding: 20px; font-size: 14px; color: #4A5568; line-height: 1.5;">
            <p>Hello,</p>
            
            <p>We regret to inform you that your meeting request with ${executiveName} has been rejected.</p>
            <p>Thank you for your understanding.</p>
            <p>Best regards,<br>Email Automation Team</p>
          </td>
        </tr>
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
      `
    };

    await transporter.sendMail(mailOptions);

    const updatedForm = await Admin.findByIdAndUpdate(
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
    console.log("userId", userId);

    const donations = await Donation.find({ userId });
    console.log("donations", donations);

    res.status(200).json({
      success: true,
      message: "Donations retrieved successfully",
      data: donations,
    });
  } catch (error) {
    console.error("Error fetching donations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve donations",
      error: error.message,
    });
  }
};

module.exports = { uploadReciptData, fetchReciptData, sendAcceptEmailFromAdmin, addDonation, getDonation, sendRejectEmailFromAdmin };