import axios from "axios";
import connectToDatabase from "../lib/db";
const User = require('../models/User');

const CLIENT_ID = "8616qrav1c1mf7";
const CLIENT_SECRET = "WPL_AP1.uZs73YcU2Hmhrj84.pVbiIQ==";
const REDIRECT_URI = "https://email-automation-ivory.vercel.app/login";

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

    const { access_token } = tokenRes.data;

    const profileRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const { sub, name, email, picture } = profileRes.data;
    let user = await User.findOne({ linkedInProfileEmail: email });

    if (!user) {
      user = new User({
        linkedInProfileName: name,
        linkedInProfileEmail: email,
        linkedInProfilePhoto: picture,
      });
    } else {
      user.linkedInProfileName = name;
      user.linkedInProfilePhoto = picture;
    }

    await user.save();

    res.json({
      message: "LinkedIn login successful and user saved!",
      userEmail: email
    });

  } catch (error) {
    console.error(
      "LinkedIn API error:",
      error.response?.data || error.message
    );
    res.status(500).send("Login failed");
  }
};


module.exports = { linkedInLogin, linkedInCallback };
