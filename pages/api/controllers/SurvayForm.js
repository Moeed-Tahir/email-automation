const mongoose = require("mongoose");
const User = require("../models/User");
const SurvayForm = require("../models/SurvayForm");
const connectToDatabase = require("../lib/db");

const getQuestionFromUserId = async (req, res) => {
    try {
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

        return res.status(201).json({
            message: "Survey submitted successfully",
            data: newSurvey
        });
    } catch (error) {
        console.error("Error submitting survey:", error);
        return res.status(500).json({ message: "Server error" });
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
        console.log("surveyData",surveyData);

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
        const allBids = await mongoose.models.SurvayForm.find({});
        
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

module.exports = { getQuestionFromUserId, sendSurvayForm, fetchSurvayData,getBidInfo };