const User = require("../models/User");
const SurvayForm = require("../models/SurvayForm");
const AdminForm = require("../models/Admin");
const Donation = require("../models/Donation");
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

const sendSurveyForm = async (req, res) => {
  try {
    await connectToDatabase();

    const {
      userId,
      bidAmount,
      firstName,
      lastName,
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
      totalScore,
      company,
      jobTitle,
      phoneNumber,
      city,
      state,
      country,
      questionAnswers
    } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }
    if (!bidAmount || isNaN(bidAmount)) {
      return res.status(400).json({ message: "Valid bidAmount is required" });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const userData = await User.findOne({ userId: userId });
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    if (Number(bidAmount) < Number(userData.minimumBidDonation)) {
      return res.status(400).json({
        message: `Bid amount must be greater than ${userData.minimumBidDonation}`,
        minimumBid: userData.minimumBidDonation
      });
    }

    const surveyData = {
      userId,
      bidAmount: Number(bidAmount),
      name: `${firstName} ${lastName}`,
      email,
      questionOneSolution: solutionDescription,
      questionTwoSolution: businessChallengeSolution,
      businessProblem,
      resultsTimeframe,
      caseStudies,
      offeringType,
      performanceGuarantee,
      DonationWilling: Boolean(DonationWilling),
      escrowDonation: Boolean(escrowDonation),
      charityDonation,
      totalScore: Number(totalScore) || 0,
      submittedAt: new Date(),
      company,
      jobTitle,
      phoneNumber,
      city,
      state,
      country,
      closeEndedQuestions: questionAnswers.map(qa => ({
        questionId: qa.questionId,
        questionText: qa.questionText,
        correctAnswer: qa.answer,
        isOther: qa.isOther,
        originalAnswer: qa.originalAnswer,
        score: qa.score,
        options: qa.options.map(opt => ({
          text: opt.text,
          score: opt.score,
          isSelected: opt.isSelected,
          isOther: opt.text === "Other (please specify)"
        }))
      }))
    };

    const newSurvey = new SurvayForm(surveyData);
    await newSurvey.save();
    let finalName = `${firstName} ${lastName}`;

    sendEmailFromCompany(email, finalName, userData.userName, userData.location, userData.jobTitle, userData.industry);

    return res.status(201).json({
      success: true,
      message: "Survey submitted successfully",
      data: newSurvey
    });

  } catch (error) {
    console.error("Error submitting survey:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const sendEmailFromCompany = async (
  sendEmailTo,
  recipientName,
  executiveName,
  location,
  jobTitle,
  companyName,
  industry
) => {
  try {
    if (!sendEmailTo) {
      return res.status(400).json({ message: "sendEmailTo is required" });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'info@makelastingchange.com',
        pass: 'vcvk scep luhp qosk',
      },
    });

    const mailOptions = {
      from: 'Give2Meet <info@makelastingchange.com>',
      to: sendEmailTo,
      subject: `Your Meeting Request Has Been Submitted to ${executiveName}`,
      html: `
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F2F5F8; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 4px; overflow: hidden;">
                
                <!-- Logo Header -->
                <tr>
                  <td align="left" style="padding: 20px;">
                    <img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project/email-automation/Logo%20(7).png" alt="Give2Meet Logo" style="height: 40px;">
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 20px;">
                    <h1 style="font-size: 22px; font-weight: 600; color: #2D3748; margin: 0 0 20px 0;">
                      Here's What Happens Next
                    </h1>
                    
                    <p style="font-size: 16px; color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
                      Hi ${recipientName || 'there'},
                    </p>
                    
                    <p style="font-size: 16px; color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
                      Thanks for submitting your meeting request through Give2Meet.
                    </p>
                    
                    <h2 style="font-size: 18px; font-weight: 600; color: #2D3748; margin: 20px 0 10px 0;">
                      What Happens Next:
                    </h2>
                    
                    <ul style="font-size: 16px; color: #4A5568; line-height: 1.6; margin: 0 0 20px 0; padding-left: 20px;">
                      <li style="margin-bottom: 8px;">If your request is accepted, you'll receive an email with a link to schedule the meeting.</li>
                      <li style="margin-bottom: 8px;">Your pledged donation will only be processed after the meeting takes place.</li>
                      <li>If ${executiveName} decides not to move forward, you'll also be notified.</li>
                    </ul>
                    
                    <p style="font-size: 16px; color: #4A5568; line-height: 1.6; margin-bottom: 20px;">
                      I appreciate your thoughtful approach and for your willingness to support a worthy cause.
                    </p>
                    
                    <p style="font-size: 16px; color: #4A5568; line-height: 1.6; margin-bottom: 0;">
                      Thanks again for your submission!
                    </p>
                  </td>
                </tr>
                
                <!-- Executive Signature -->
                <tr>
                  <td style="padding: 20px; border-top: 1px solid #E2E8F0; font-size: 16px; color: #4A5568; line-height: 1.6;">
                    <p style="margin: 0 0 5px 0;">Best,</p>
                    <p style="margin: 0 0 5px 0; font-weight: 600;">${executiveName}</p>
                    <p style="margin: 0 0 5px 0;">${jobTitle}</p>
                    <p style="margin: 0 0 5px 0;">${companyName}</p>
                    <p style="margin: 0;">${location}</p>
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
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Confirmation email sent to ${sendEmailTo}`);

  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
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

    // Fetch all necessary data in parallel for better performance
    const [surveyData, userData, adminForms] = await Promise.all([
      SurvayForm.find({ userId }).lean(),
      User.find({ userId }).lean(),
      AdminForm.find().lean()
    ]);

    if (!surveyData || surveyData.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No survey data found",
        data: []
      });
    }

    // Create a map of adminForms by surveyId for faster lookup
    const adminFormMap = adminForms.reduce((map, form) => {
      if (form.surveyId) {
        map[form.surveyId.toString()] = form;
      }
      return map;
    }, {});

    const enrichSurveyData = (survey) => {
      const adminForm = adminFormMap[survey._id.toString()];
      const status = adminForm ? adminForm.status : "Not Submitted";

      const baseData = {
        ...survey,
        donationStatus: status,
        ...(adminForm && {
          executiveEmail: adminForm.executiveEmail,
          executiveName: adminForm.executiveName,
          salesRepresentiveEmail: adminForm.salesRepresentiveEmail,
          salesRepresentiveName: adminForm.salesRepresentiveName,
          donation: adminForm.donation,
          receiptFormLink: adminForm.receiptFormLink
        })
      };

      if (userData && userData.length > 0) {
        const user = userData[0];
        return {
          ...baseData,
          location: user.location,
          companyName: user.companyName,
          jobTitle: user.jobTitle,
          industry: user.industry,
          city: survey.city,
          state: survey.state,
          country: survey.country
        };
      }

      return baseData;
    };

    const enrichedSurveyData = surveyData.map(enrichSurveyData);

    return res.status(200).json({
      success: true,
      message: "Survey data retrieved successfully",
      data: enrichedSurveyData,
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
      bidAmount: surveyData.bidAmount,
      charityDonation:surveyData.charityDonation,
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

    const [surveyData, adminForms] = await Promise.all([
      SurvayForm.findOne({ _id: surveyId }).lean(),
      AdminForm.find().lean()
    ]);

    if (!surveyData) {
      return res.status(404).json({
        success: false,
        message: "Survey data not found"
      });
    }

    const adminFormMap = adminForms.reduce((map, form) => {
      if (form.surveyId) {
        map[form.surveyId.toString()] = form;
      }
      return map;
    }, {});

    const adminForm = adminFormMap[surveyId.toString()];
    const status = adminForm ? adminForm.status : "Not Submitted";

    const enrichedSurveyData = {
      ...surveyData,
      donationStatus: status,
      ...(adminForm && {
        executiveEmail: adminForm.executiveEmail,
        executiveName: adminForm.executiveName,
        salesRepresentiveEmail: adminForm.salesRepresentiveEmail,
        salesRepresentiveName: adminForm.salesRepresentiveName,
        donation: adminForm.donation,
        receiptFormLink: adminForm.receiptFormLink
      })
    };

    return res.status(200).json({
      success: true,
      message: "Survey data retrieved successfully",
      data: enrichedSurveyData
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
    await connectToDatabase();
    const { userId } = req.body;
    const allBids = await SurvayForm.find({ userId });

    const validBids = allBids.filter(bid => bid.bidAmount && !isNaN(parseFloat(bid.bidAmount)));
    const totalBidAmount = validBids.reduce((sum, bid) => sum + parseFloat(bid.bidAmount), 0);
    const highestBid = validBids.length > 0 ? Math.max(...validBids.map(bid => parseFloat(bid.bidAmount))) : 0;
    const averageBid = validBids.length > 0 ? totalBidAmount / validBids.length : 0;
    const pendingBidsCount = allBids.filter(bid => bid.status === "Pending").length;

    const now = new Date();
    const lastWeek = new Date();
    lastWeek.setDate(now.getDate() - 7);
    const previousWeek = new Date();
    previousWeek.setDate(lastWeek.getDate() - 7);

    const lastWeekBids = await SurvayForm.find({
      userId,
      createdAt: { $gte: lastWeek, $lte: now }
    });
    const weekBeforeLastBids = await SurvayForm.find({
      userId,
      createdAt: { $gte: previousWeek, $lt: lastWeek }
    });

    const percentChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Extract amounts
    const lastWeekAmounts = lastWeekBids.map(b => parseFloat(b.bidAmount)).filter(n => !isNaN(n));
    const previousWeekAmounts = weekBeforeLastBids.map(b => parseFloat(b.bidAmount)).filter(n => !isNaN(n));

    // Calculate values
    const lastWeekTotal = lastWeekAmounts.reduce((a, b) => a + b, 0);
    const previousWeekTotal = previousWeekAmounts.reduce((a, b) => a + b, 0);

    const highestLastWeek = Math.max(...lastWeekAmounts, 0);
    const highestPreviousWeek = Math.max(...previousWeekAmounts, 0);

    const avgLastWeek = lastWeekAmounts.length > 0 ? lastWeekTotal / lastWeekAmounts.length : 0;
    const avgPreviousWeek = previousWeekAmounts.length > 0 ? previousWeekTotal / previousWeekAmounts.length : 0;

    const lastWeekPending = lastWeekBids.filter(bid => bid.status === "Pending").length;
    const previousWeekPending = weekBeforeLastBids.filter(bid => bid.status === "Pending").length;

    const response = {
      totalBidAmount: totalBidAmount.toFixed(2),
      highestBidAmount: highestBid.toFixed(2),
      averageBidAmount: averageBid.toFixed(2),
      pendingBidsCount,
      totalBidsCount: allBids.length,
      validBidsCount: validBids.length,
      totalBidsCountChange: percentChange(lastWeekBids.length, weekBeforeLastBids.length).toFixed(1),
      highestBidChange: percentChange(highestLastWeek, highestPreviousWeek).toFixed(1),
      averageBidChange: percentChange(avgLastWeek, avgPreviousWeek).toFixed(1),
      pendingBidsChange: percentChange(lastWeekPending, previousWeekPending).toFixed(1),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching bid information:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getDashboardStatsOfUser = async (req, res) => {
  try {
    const { userId, filter } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let startDate, endDate = new Date();

    switch (filter) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'daily':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'yearly':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
    }

    const matchQuery = {
      userId: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    const allBids = await SurvayForm.find(matchQuery);
    const totalDonations = await Donation.countDocuments(matchQuery);

    if (allBids.length === 0 && totalDonations === 0) {
      return res.json({
        totalBids: 0,
        pendingBids: 0,
        highestBid: 0,
        averageBid: "0.00",
        totalDonations: 0,
        timePeriod: {
          start: startDate,
          end: endDate
        },
        message: "No bids or donations found for the selected period"
      });
    }

    const bidAmounts = allBids
      .map(bid => {
        const amount = parseFloat(bid.bidAmount);
        return isNaN(amount) ? 0 : amount;
      })
      .filter(amount => amount > 0);

    const totalBids = allBids.length;
    const pendingBids = allBids.filter(bid => bid.status === 'Pending').length;
    const highestBid = bidAmounts.length > 0 ? Math.max(...bidAmounts) : 0;
    const averageBid = bidAmounts.length > 0 ?
      (bidAmounts.reduce((sum, amount) => sum + amount, 0) / bidAmounts.length).toFixed(2) : "0.00";

    res.json({
      totalBids,
      pendingBids,
      highestBid,
      averageBid,
      totalDonations,
      timePeriod: {
        start: startDate,
        end: endDate
      }
    });

  } catch (error) {
    console.error("Error in getDashboardStatsOfUser:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


module.exports = { getQuestionFromUserId, sendSurveyForm, fetchSurvayData, getBidInfo, fetchNameAgainstId, fetchSurvayDataAgainstObjectId, getDashboardStatsOfUser };