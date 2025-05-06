const User = require("../models/User");
const SurvayForm = require("../models/SurvayForm");
const connectToDatabase = require("../lib/db");
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
dotenv.config();

const getQuestionFromUserId = async (req, res) => {
  try {
    await connectToDatabase();
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required in the body" });
    }

    const user = await User.findOne({ userId }, 'questionSolution howHeard');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      questionOne: user.questionSolution || null,
      questionTwo: user.howHeard || null
    });
  } catch (error) {
    console.error("Error fetching questionSolution and howHeard:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const sendSurvayForm = async (req, res) => {
  try {
    await connectToDatabase();
    const {
      userId,
      bidAmount,
      name,
      email,
      solutionDescription,
      businessChallengeSolution,
      businessProblem,
      resultsTimeframe,
      caseStudies,
      offeringType,
      performanceGuarantee,
      DonationWilling,
      escrowDonation,
      charityDonation,
      totalScore
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const surveyData = {
      userId,
      bidAmount,
      name,
      email,
      questionOneSolution: solutionDescription,
      questionTwoSolution: businessChallengeSolution,
      businessProblem,
      resultsTimeframe,
      caseStudies,
      offeringType,
      performanceGuarantee,
      DonationWilling: DonationWilling,
      escrowDonation: escrowDonation,
      charityDonation,
      totalScore
    };

    const newSurvey = new SurvayForm(surveyData);
    await newSurvey.save();
    sendEmailFromCompany(email);
    return res.status(201).json({
      message: "Survey submitted successfully",
      data: newSurvey
    });
  } catch (error) {
    console.error("Error submitting survey:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const sendEmailFromCompany = async (sendEmailTo) => {
  try {

    if (!sendEmailTo) {
      return res.status(400).json({ message: "sendEmailTo are required" });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'moeedtahir29@gmail.com',
        pass: 'bdam zyum ygcv ntqq',
      },
    });

    const mailOptions = {
      from: 'Email-Automation',
      to: sendEmailTo,
      subject: 'Thank You for Completing the Survey!',
      html: `
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F2F5F8; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden;">
                    
                    <tr>
                      <td align="left" style="padding: 20px;">
                        <img src="https://i.ibb.co/Sw1L2drq/Logo-5.png" alt="Logo" style="height: 40px;">
                      </td>
                    </tr>
        
                    <tr>
                      <td style="padding: 0 20px;">
                        <h1 style="font-size: 22px; font-weight: 600; color: #2D3748; padding-bottom: 10px; margin: 0;">
                          Thank You!
                        </h1>
                      </td>
                    </tr>
        
                    <tr>
                      <td style="padding: 20px; font-size: 16px; color: #4A5568; line-height: 1.6;">
                        <p>Hi,</p>
                        <p>Thank you for taking the time to complete our survey. Your feedback is greatly appreciated!</p>
                      </td>
                    </tr>
        
                  </table>
        
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

  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email", error: error.message });
  }
};

const fetchSurvayData = async (req, res) => {
  try {
    await connectToDatabase();

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required as a query parameter"
      });
    }

    const surveyData = await SurvayForm.find({ userId }).lean();

    if (!surveyData || surveyData.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No survey data found",
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Survey data retrieved successfully",
      data: surveyData
    });

  } catch (error) {
    console.error("Error fetching survey data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

const fetchNameAgainstId = async (req, res) => {
  try {
    await connectToDatabase();

    const { surveyObjectId } = req.body;

    if (!surveyObjectId) {
      return res.status(400).json({
        success: false,
        message: "surveyId is required in the request body"
      });
    }

    const surveyData = await SurvayForm.findById(surveyObjectId).lean();

    if (!surveyData) {
      return res.status(404).json({
        success: false,
        message: "Survey data not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Survey data retrieved successfully",
      name: surveyData.name,
      bidAmount: surveyData.bidAmount
    });

  } catch (error) {
    console.error("Error fetching survey data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

const fetchSurvayDataAgainstObjectId = async (req, res) => {
  try {
    await connectToDatabase();
    const { surveyId } = req.body;

    if (!surveyId) {
      return res.status(400).json({
        success: false,
        message: "surveyId is required in the request body"
      });
    }

    const surveyData = await SurvayForm.findOne({ _id: surveyId }).lean();

    if (!surveyData) {
      return res.status(404).json({
        success: false,
        message: "Survey data not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Survey data retrieved successfully",
      data: surveyData
    });

  } catch (error) {
    console.error("Error fetching survey data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};



const getBidInfo = async (req, res) => {
  try {
    await connectToDatabase()
    const { userId } = req.body;
    const allBids = await SurvayForm.find({ userId });

    const validBids = allBids.filter(bid => bid.bidAmount && !isNaN(parseFloat(bid.bidAmount)));

    const totalBidAmount = validBids.reduce((sum, bid) => sum + parseFloat(bid.bidAmount), 0);

    const highestBid = validBids.length > 0
      ? Math.max(...validBids.map(bid => parseFloat(bid.bidAmount)))
      : 0;

    const averageBid = validBids.length > 0
      ? totalBidAmount / validBids.length
      : 0;

    const pendingBidsCount = allBids.filter(bid => bid.status === "Pending").length;

    const response = {
      totalBidAmount: totalBidAmount.toFixed(2),
      highestBidAmount: highestBid.toFixed(2),
      averageBidAmount: averageBid.toFixed(2),
      pendingBidsCount: pendingBidsCount,
      totalBidsCount: allBids.length,
      validBidsCount: validBids.length
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching bid information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { getQuestionFromUserId, sendSurvayForm, fetchSurvayData, getBidInfo, fetchNameAgainstId, fetchSurvayDataAgainstObjectId };