import axios from "axios";
import connectToDatabase from "../lib/db";
// import { startEmailMonitoring } from "../services/EmailMonetering";
const User = require('../models/User');
const dotenv = require("dotenv");
dotenv.config();
const jwt = require('jsonwebtoken');

const CLIENT_ID = `${process.env.LINKEDIN_CLIENT_ID}`;
const CLIENT_SECRET = `${process.env.LINKEDIN_CLIENT_SECRET}`;
const REDIRECT_URI = `${process.env.REQUEST_URL}/login`;

const linkedInLogin = async (req, res) => {
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=openid profile email`;

  res.redirect(authUrl);
};

const linkedInCallback = async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error("LinkedIn OAuth error:", error);
    return res.status(400).send(`OAuth Error: ${error}`);
  }

  if (!code) {
    return res.status(400).send("Authorization code missing");
  }

  try {
    await connectToDatabase();
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token: linkedInAccessToken } = tokenRes.data;

    const profileRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${linkedInAccessToken}`,
      },
    });
        
    const { sub, name, email, picture } = profileRes.data;
    let user = await User.findOne({ userProfileEmail: email });

    if (!user) {
      user = new User({
        userName: name,
        userProfileEmail: email,
        userProfilePhoto: picture,
      });
      await user.save();

      return res.json({
        success: true,
        message: "Login successful! Please complete your profile by filling the next steps.",
        userProfileEmail: user.userProfileEmail,
        isNewUser: true
      });
    } else {
      user.userName = name;
      user.userProfilePhoto = picture;
      await user.save();
      
      const jwtToken = jwt.sign(
        {
          userId: user.userId,
          email: user.userProfileEmail,
        },
        process.env.JWT_SECRET,
        { expiresIn: '5h' }
      );

      // if (user.gmailAccessToken && user.gmailRefreshToken) {
      //   await startEmailMonitoring(user.userProfileEmail);
      // }

      return res.json({
        success: true,
        message: "Welcome back! You're logged in successfully.",
        token: jwtToken,
        userName: user.userName,
        userProfileEmail: user.userProfileEmail,
        userProfilePhoto: user.userProfilePhoto,
        userId: user.userId,
        isNewUser: false,
        hasGmailAuth: !!user.gmailAccessToken // Add this flag to indicate if email tracking is active
      });
    }

  } catch (error) {
    console.error(
      "LinkedIn API error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again."
    });
  }
};


module.exports = { linkedInLogin, linkedInCallback };
