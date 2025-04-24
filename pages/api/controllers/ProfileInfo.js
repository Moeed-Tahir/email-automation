const connectToDatabase = require("../lib/db");
const User = require("../models/User");

const addProfileInfo = async (req,res) => {
   try{
     await connectToDatabase();
     const { linkedInProfileEmail, calendarLink,charityCompany, minimumBidDonation,questionSolution } = req.body;
     const user = await User.findOne({ linkedInProfileEmail: linkedInProfileEmail });
     if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    user.calendarLink = calendarLink;
    user.charityCompany = charityCompany;
    user.minimumBidDonation = minimumBidDonation;
    user.questionSolution = questionSolution;

    await user.save();

   }catch(error){
    console.error("Error adding sales representative info:", error);
    throw error;
   }
}

module.exports = {
    addProfileInfo,
};
