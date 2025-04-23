import axios from "axios";

const CLIENT_ID = "77b0khtosn6p36";
const CLIENT_SECRET = "WPL_AP1.jpONyVpb7FNHFTXW.6aq20w==";
const REDIRECT_URI = "http://localhost:3000/linkedInCallback";

const linkedInLogin = async (req, res) => {
  console.log("Call")
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=r_liteprofile%20r_emailaddress`;

  res.redirect(authUrl);
};

const linkedInCallback = async (req, res) => {
  const { code } = req.body;

  try {
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = tokenRes.data.access_token;

    const profileRes = await axios.get(
      "https://api.linkedin.com/v2/me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const emailRes = await axios.get(
      "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const profileData = profileRes.data;
    const email = emailRes.data.elements[0]["handle~"].emailAddress;

    console.log("Profile:", profileData);
    console.log("Email:", email);

    res.send("LinkedIn login successful!");
  } catch (error) {
    console.error("LinkedIn login error:", error.response?.data || error.message);
    res.status(500).send("Login failed");
  }
};


export default { linkedInLogin, linkedInCallback };
