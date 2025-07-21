"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  BadgeDollarSign,
  ChevronRight,
  ChevronLeft,
  Briefcase,
  Building,
  Phone,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

const SurveyForm = ({ userId }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);
  const [userQuestions, setUserQuestions] = useState({
    questionOne: "" || "Describe your Key And Features",
    questionTwo: "" || "Describe only your Features",
  });
  const [formData, setFormData] = useState({
    bidAmount: "",
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    jobTitle: "",
    phoneNumber: "",
    city: "",
    state: "",
    country: "",
    solutionDescription: "",
    businessChallengeSolution: "",
    businessProblem: "",
    resultsTimeframe: "",
    caseStudies: "",
    offeringType: "",
    performanceGuarantee: "",
    DonationWilling: "",
    escrowDonation: "",
    charityDonation: "",
  });
  const [profileData, setProfileData] = useState([]);
  const [case2Questions, setCase2Questions] = useState([]);
  const [case3Questions, setCase3Questions] = useState([]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const tabs = [
    { title: "Welcome" },
    { title: "Bid & Contact" },
    { title: "Solution Details" },
    { title: "Business Impact" },
    { title: "Commitment & Donation" },
  ];

  const isLastTab = currentTab === tabs.length - 1;
  const isFirstTab = currentTab === 0;

  const fetchCloseEndedQuestions = async () => {
    try {
      const response = await axios.post(
        "/api/routes/ProfileInfo?action=getCloseEndedQuestion",
        {
          userId,
        }
      );
      const allQuestions = response.data.closeEndedQuestions || [];

      setCase2Questions(allQuestions.slice(0, 4));
      setCase3Questions(allQuestions.slice(4, 8));
    } catch (error) {
      console.error("Error fetching close-ended questions:", error);
    }
  };

  const handleNext = () => {
    if (currentTab === 1) {
      const newErrors = {};

      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }

      if (!formData.company.trim()) {
        newErrors.company = "Company is required";
      }

      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = "Job title is required";
      }

      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      }

      if (!formData.city.trim()) {
        newErrors.city = "City is required";
      }
      if (!formData.state.trim()) {
        newErrors.state = "State is required";
      }
      if (!formData.country.trim()) {
        newErrors.country = "Country is required";
      }

      if (!formData.bidAmount) {
        newErrors.bidAmount = "Bid amount is required";
      } else if (isNaN(formData.bidAmount) || Number(formData.bidAmount) <= 0) {
        newErrors.bidAmount = "Bid amount must be a positive number";
      } else if (
        profileData.minimumBidDonation &&
        Number(formData.bidAmount) < Number(profileData.minimumBidDonation)
      ) {
        newErrors.bidAmount = `Bid amount must be at least $${profileData.minimumBidDonation}`;
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length > 0) {
        return;
      }
    }

    setCurrentTab(currentTab + 1);
  };

  const handleBack = () => {
    if (!isFirstTab) setCurrentTab(currentTab - 1);
  };

  const calculateTotalScore = (formData) => {
    let score = 0;

    // Add scores from case 2 questions
    case2Questions.forEach((question) => {
      const selectedOption = question.options.find(
        (opt) => opt.text === formData[`question_${question.questionId}`]
      );
      if (selectedOption) {
        score += selectedOption.score;
      }
    });

    // Add scores from case 3 questions
    case3Questions.forEach((question) => {
      const selectedOption = question.options.find(
        (opt) => opt.text === formData[`question_${question.questionId}`]
      );
      if (selectedOption) {
        score += selectedOption.score;
      }
    });

    // Existing scoring logic for other questions
    if (formData.performanceGuarantee === "No") {
      score += 1;
    } else if (formData.performanceGuarantee === "Yes, but with conditions") {
      score += 5;
    } else if (formData.performanceGuarantee === "Yes, unconditionally") {
      score += 10;
    }

    if (formData.DonationWilling === "No") {
      score += 1;
    } else if (formData.DonationWilling === "Yes") {
      score += 10;
    }

    if (formData.DonationWilling === "Yes") {
      if (formData.escrowDonation === "No") {
        score += 1;
      } else if (formData.escrowDonation === "Yes") {
        score += 10;
      }
    }

    if (formData.DonationWilling === "Yes" && formData.charityDonation) {
      const donationAmount = formData.charityDonation;
      if (donationAmount === "$10-$50") {
        score += 2;
      } else if (donationAmount === "$51-$100") {
        score += 4;
      } else if (donationAmount === "$101-$200") {
        score += 6;
      } else if (donationAmount === "$201-$300") {
        score += 8;
      } else if (donationAmount === "$301-$400") {
        score += 10;
      } else if (donationAmount === "$401-$500") {
        score += 12;
      }
    }

    return score.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const totalScore = calculateTotalScore(formData);

      const questionAnswers = [
        ...case2Questions.map((question) => ({
          questionId: question.questionId,
          questionText: question.questionText,
          answer: formData[`question_${question.questionId}`],
          score:
            question.options.find(
              (opt) => opt.text === formData[`question_${question.questionId}`]
            )?.score || 0,
        })),
        ...case3Questions.map((question) => ({
          questionId: question.questionId,
          questionText: question.questionText,
          answer: formData[`question_${question.questionId}`],
          score:
            question.options.find(
              (opt) => opt.text === formData[`question_${question.questionId}`]
            )?.score || 0,
        })),
      ];

      const response = await fetch(
        "/api/routes/SurvayForm?action=sendSurveyForm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            ...formData,
            totalScore,
            questionAnswers,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        router.push("/successful");
      } else {
        console.error("Error submitting form");
        alert("Error submitting survey. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting survey. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`/api/routes/ProfileInfo`, {
          params: { userId, action: "getProfileInfo" },
        });

        setProfileData(response.data.user);
        setUserQuestions({
          questionOne:
            response.data.user.questionSolution ||
            "Describe your solution and its key features.",
          questionTwo:
            response.data.user.howHeard ||
            "Give a brief description of your solution.",
        });

        await fetchCloseEndedQuestions();
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  const progressWidth = ((currentTab + 1) / tabs.length) * 100;

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 0:
        return (
          <div className="flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
              {/* Profile Image */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden self-center sm:self-start">
                {profileData.userProfilePhoto ? (
                  <img
                    src={profileData.userProfilePhoto}
                    alt={profileData.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {profileData.userName || "No name provided"}
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  {profileData.jobTitle || "No job title provided"}
                  {profileData.companyName && ` at ${profileData.companyName}`}
                </p>

                <div className="mt-3 flex justify-center sm:justify-start flex-wrap gap-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-sm font-medium text-green-800">
                      Responsive
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Request Info Popup Trigger */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                onClick={() => setShowMeetingInfo(true)}
                className="text-blue-500 hover:text-blue-700 sm:mr-2 sm:mt-1 flex-shrink-0"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <div className="text-center sm:text-left">
                <h3 className="font-semibold text-lg">
                  Want to meet with {profileData.userName || "this executive"}?
                </h3>
                <p className="text-sm sm:text-base">
                  Click the info icon to learn how meeting requests work.
                </p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
              {/* Personal Information */}
              <div className="col-span-1">
                <h2 className="text-xl font-semibold mb-4">
                  Personal Information
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                      LinkedIn
                    </h3>
                    <p className="text-base sm:text-lg">
                      {profileData.linkedInProfile || "Not specified"}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                      My Home Base
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                      <p className="text-base sm:text-lg">
                        {profileData.location || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                      About Me
                    </h3>
                    <p className="text-base sm:text-lg">
                      {profileData.aboutMe || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="col-span-1">
                <h2 className="text-xl font-semibold mb-4">
                  Company Information
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                      Company
                    </h3>
                    <p className="text-base sm:text-lg">
                      {profileData.companyName || "Not specified"}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                      My Position In The Company
                    </h3>
                    <p className="text-base sm:text-lg">
                      {profileData.jobTitle || "Not specified"}
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-sm sm:text-base">
                      My Department
                    </h3>
                    <p className="text-base sm:text-lg">
                      {profileData.department || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Focused On Section */}
            <h2 className="text-xl font-semibold mb-3 sm:mb-4">Focused On</h2>
            <div className="p-3 sm:p-4 border rounded-lg mb-8">
              <p className="text-base sm:text-lg">
                {profileData.focus || "Not specified"}
              </p>
            </div>

            {/* Popup Modals */}
            {/* Meeting Info Modal */}
            {showMeetingInfo && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">
                      How Meeting Requests Work
                    </h3>
                    <button
                      onClick={() => setShowMeetingInfo(false)}
                      className="text-gray-500 hover:text-gray-700 cursor-pointer"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-4 text-sm sm:text-base">
                    <p>
                      This executive uses CheckMeet to take only the most
                      relevant, high-value sales meetings.
                    </p>
                    <p>To request a meeting, you'll be asked to:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>
                        Pledge a donation to their selected charity (only
                        charged if they accept your meeting)
                      </li>
                      <li>
                        Answer questions about who you are and how you can help
                        solve a business problem
                      </li>
                    </ol>
                    <p>
                      This is a smarter way to earn time with top
                      decision-makers while supporting good causes.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <>
            <p className="font-medium text-2xl mb-6">Enter Your Information</p>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="First Name *"
                type="text"
                icon={<User />}
                value={formData.firstName}
                onChange={(val) => setFormData({ ...formData, firstName: val })}
                error={errors.firstName}
              />
              <InputField
                label="Last Name *"
                type="text"
                icon={<User />}
                value={formData.lastName}
                onChange={(val) => setFormData({ ...formData, lastName: val })}
                error={errors.lastName}
              />
            </div>

            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Company *"
                type="text"
                icon={<Building />}
                value={formData.company}
                onChange={(val) => setFormData({ ...formData, company: val })}
                error={errors.company}
              />
              <InputField
                label="Job Title *"
                type="text"
                icon={<Briefcase />}
                value={formData.jobTitle}
                onChange={(val) => setFormData({ ...formData, jobTitle: val })}
                error={errors.jobTitle}
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Email Address *"
                type="email"
                icon={<Mail />}
                value={formData.email}
                onChange={(val) => setFormData({ ...formData, email: val })}
                error={errors.email}
              />
              <InputField
                label="Phone Number *"
                type="tel"
                icon={<Phone />}
                value={formData.phoneNumber}
                onChange={(val) =>
                  setFormData({ ...formData, phoneNumber: val })
                }
                error={errors.phoneNumber}
              />
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="City *"
                type="text"
                icon={<MapPin />}
                value={formData.city}
                onChange={(val) => setFormData({ ...formData, city: val })}
                error={errors.city}
              />
              <InputField
                label="State *"
                type="text"
                icon={<MapPin />}
                value={formData.state}
                onChange={(val) => setFormData({ ...formData, state: val })}
                error={errors.state}
              />
              <InputField
                label="Country *"
                type="text"
                icon={<MapPin />}
                value={formData.country}
                onChange={(val) => setFormData({ ...formData, country: val })}
                error={errors.country}
              />
            </div>

            {/* Bid Amount */}
            <div className="mt-4">
              <InputField
                label="Bid Amount ($) *"
                type="number"
                icon={<BadgeDollarSign />}
                value={formData.bidAmount}
                onChange={(val) => setFormData({ ...formData, bidAmount: val })}
                error={errors.bidAmount}
                hint={
                  profileData.minimumBidDonation
                    ? `Minimum bid: $${profileData.minimumBidDonation}`
                    : null
                }
              />
            </div>
          </>
        );

      case 2:
        return (
          <>
            <p className="font-medium text-2xl mb-6">
              Help the Executive Qualify Your Request
            </p>
            {case2Questions.map((question, index) => (
              <RadioGroup
                key={question.questionId}
                label={`${index + 1}. ${question.questionText}`}
                options={question.options.map((opt) => opt.text)}
                value={formData[`question_${question.questionId}`] || ""}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    [`question_${question.questionId}`]: val,
                  })
                }
                error={errors[`question_${question.questionId}`]}
              />
            ))}
          </>
        );

      case 3:
        return (
          <>
            <p className="font-medium text-2xl mb-6">
              Help the Executive Qualify Your Request
            </p>
            {case3Questions.map((question, index) => (
              <RadioGroup
                key={question.questionId}
                label={`${index + 5}. ${question.questionText}`} // Continue numbering from 5
                options={question.options.map((opt) => opt.text)}
                value={formData[`question_${question.questionId}`] || ""}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    [`question_${question.questionId}`]: val,
                  })
                }
                error={errors[`question_${question.questionId}`]}
              />
            ))}
          </>
        );

      case 4:
        return (
          <>
            <p className="font-medium text-2xl mb-6">
              Tell Us How You Can Help
            </p>
            <TextAreaField
              label={`${userQuestions.questionOne}`}
              value={formData.solutionDescription}
              onChange={(val) =>
                setFormData({ ...formData, solutionDescription: val })
              }
              error={errors.solutionDescription}
              minLength={100}
            />
            <TextAreaField
              label={`${userQuestions.questionTwo}`}
              value={formData.businessChallengeSolution}
              onChange={(val) =>
                setFormData({ ...formData, businessChallengeSolution: val })
              }
              error={errors.businessChallengeSolution}
              minLength={100}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto sm:p-8 p-2 bg-white mt-10 relative overflow-hidden flex flex-col justify-between gap-10">
      <div className="w-full h-2 bg-[rgba(75,70,92,0.08)] rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full"
          style={{ backgroundColor: "rgba(44, 81, 76, 1)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progressWidth}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            {renderCurrentTab()}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-10 flex-wrap gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirstTab}
            className={`px-6 py-3 rounded-lg bg-[rgba(44,81,76,1)] text-white hover:bg-gray-400 disabled:opacity-50 transition cursor-pointer flex items-center justify-center ${
              isFirstTab ? "hidden" : ""
            }`}
          >
            <ChevronLeft size={16} className="mr-2" />
            Back
          </button>
          <div className="flex gap-4">
            {isLastTab ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 rounded-lg text-white transition cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: "rgba(44, 81, 76, 1)" }}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-lg text-white transition cursor-pointer flex items-center justify-center"
                style={{ backgroundColor: "rgba(44, 81, 76, 1)" }}
              >
                {currentTab == 0 ? "Request Meeting" : "Next"}{" "}
                <ChevronRight size={16} className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

const InputField = ({ label, type, icon, value, onChange, error, hint }) => (
  <div className="space-y-2">
    <label
      className="block font-semibold"
      style={{ color: "rgba(65, 62, 94, 1)", fontSize: "18px" }}
    >
      {label}
    </label>
    {hint && <p className="text-sm text-gray-500 mb-1">{hint}</p>}
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#2C514C]">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-10 p-3 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:ring-2 focus:ring-[#2C514C] focus:outline-none`}
      />
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const TextAreaField = ({ label, value, onChange, error }) => (
  <div className="space-y-2">
    <label
      className="block font-semibold"
      style={{ color: "rgba(65, 62, 94, 1)", fontSize: "18px" }}
    >
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={5}
      className={`w-full p-3 border ${
        error ? "border-red-500" : "border-gray-300"
      } rounded-lg focus:ring-2 focus:ring-[#2C514C] focus:outline-none`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const RadioGroup = ({ label, options, value, onChange, error }) => (
  <div className="space-y-2">
    <label
      className={`block font-medium ${
        error ? "text-red-500" : "text-[rgba(33, 37, 41, 1)]"
      }`}
      style={{ fontSize: "16px" }}
    >
      {label}
    </label>
    <div className="space-y-2">
      {options.map((option) => (
        <div key={option} className="flex items-center">
          <input
            type="radio"
            id={option}
            name={label}
            value={option}
            checked={value === option}
            onChange={(e) => onChange(e.target.value)}
            className={`h-4 w-4 ${
              error ? "text-red-500" : "text-[rgba(112,122,136,1)]"
            } border-gray-900`}
          />
          <label
            htmlFor={option}
            className="ml-3 text-sm text-[rgba(112,122,136,1)] cursor-pointer"
          >
            {option}
          </label>
        </div>
      ))}
    </div>
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default SurveyForm;
