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
    const newErrors = {};

    if (currentTab === 1) {
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
    }

    if (currentTab === 2 || currentTab === 3) {
      const questions = currentTab === 2 ? case2Questions : case3Questions;

      questions.forEach((question) => {
        const answer = formData[`question_${question.questionId}`];
        if (!answer) {
          newErrors[`question_${question.questionId}`] = "Please select an option";
        } else if (answer === "Other (please specify)" && !formData[`other_${question.questionId}`]) {
          newErrors[`other_${question.questionId}`] = "Please specify your answer";
        }
      });
    }

    if (currentTab === 4) {
      if (!formData.solutionDescription || formData.solutionDescription.length < 100) {
        newErrors.solutionDescription = "Please provide at least 100 characters";
      }
      if (!formData.businessChallengeSolution || formData.businessChallengeSolution.length < 100) {
        newErrors.businessChallengeSolution = "Please provide at least 100 characters";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setCurrentTab(currentTab + 1);
  };

  const handleBack = () => {
    if (!isFirstTab) setCurrentTab(currentTab - 1);
  };

  const calculateTotalScore = (formData) => {
    let score = 0;

    case2Questions.forEach((question) => {
      const selectedValue = formData[`question_${question.questionId}`];
      let selectedOption;

      if (selectedValue === "Other (please specify)") {
        selectedOption = question.options.find(opt => opt.text === "Other (please specify)");
      } else {
        selectedOption = question.options.find(
          (opt) => opt.text === selectedValue
        );
      }

      if (selectedOption) {
        score += selectedOption.score;
      }
    });

    case3Questions.forEach((question) => {
      const selectedValue = formData[`question_${question.questionId}`];
      let selectedOption;

      if (selectedValue === "Other (please specify)") {
        selectedOption = question.options.find(opt => opt.text === "Other (please specify)");
      } else {
        selectedOption = question.options.find(
          (opt) => opt.text === selectedValue
        );
      }

      if (selectedOption) {
        score += selectedOption.score;
      }
    });

    return score.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!formData.solutionDescription || formData.solutionDescription.length < 100) {
      newErrors.solutionDescription = "Please provide at least 100 characters";
    }
    if (!formData.businessChallengeSolution || formData.businessChallengeSolution.length < 100) {
      newErrors.businessChallengeSolution = "Please provide at least 100 characters";
    }

    [...case2Questions, ...case3Questions].forEach((question) => {
      const answerKey = `question_${question.questionId}`;
      if (!formData[answerKey]) {
        newErrors[answerKey] = "Please select an option";
      } else if (formData[answerKey] === "Other (please specify)" && !formData[`other_${question.questionId}`]) {
        newErrors[`other_${question.questionId}`] = "Please specify your answer";
      }
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const totalScore = calculateTotalScore(formData);

      const questionAnswers = [
        ...case2Questions.map((question) => {
          const answer = formData[`question_${question.questionId}`];
          const isOther = answer === "Other (please specify)";
          const selectedOption = question.options.find(
            opt => isOther ? opt.text === "Other (please specify)" : opt.text === answer
          );

          return {
            questionId: question.questionId,
            questionText: question.questionText,
            questionScore: question.questionScore, // Add this line
            answer: isOther ? formData[`other_${question.questionId}`] : answer,
            originalAnswer: answer,
            isOther: isOther,
            score: selectedOption?.score || 0,
            options: question.options.map(opt => ({
              text: opt.text,
              score: opt.score,
              isSelected: opt.text === answer
            }))
          };
        }),
        ...case3Questions.map((question) => {
          const answer = formData[`question_${question.questionId}`];
          const isOther = answer === "Other (please specify)";
          const selectedOption = question.options.find(
            opt => isOther ? opt.text === "Other (please specify)" : opt.text === answer
          );

          return {
            questionId: question.questionId,
            questionText: question.questionText,
            questionScore: question.questionScore, // Add this line
            answer: isOther ? formData[`other_${question.questionId}`] : answer,
            originalAnswer: answer,
            isOther: isOther,
            score: selectedOption?.score || 0,
            options: question.options.map(opt => ({
              text: opt.text,
              score: opt.score,
              isSelected: opt.text === answer
            }))
          };
        }),
      ];

      const submissionData = {
        userId,
        ...formData,
        totalScore,
        questionAnswers,
        submittedAt: new Date().toISOString(),
        profileData: {
          userName: profileData.userName,
          companyName: profileData.companyName,
          minimumBidDonation: profileData.minimumBidDonation
        },
        userQuestions: {
          questionOne: userQuestions.questionOne,
          questionTwo: userQuestions.questionTwo
        }
      };

      const response = await fetch(
        "/api/routes/SurvayForm?action=sendSurveyForm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submissionData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        router.push("/successful");
      } else {
        console.error("Error submitting form");
        const errorData = await response.json();
        alert(errorData.message || "Error submitting survey. Please try again.");
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
          <div className="flex flex-col max-w-7xl mx-auto pl-0 pr-4 sm:pl-0 sm:pr-6 lg:pl-0 lg:pr-2">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-6">
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

              <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {profileData.userName || "No name provided"}
                  </h1>
                  {profileData.linkedInProfile && (
                    <a
                      href={profileData.linkedInProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 mt-2 sm:mt-0"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                </div>
                <p className="text-base sm:text-lg text-gray-600">
                  {profileData.jobTitle || "No job title provided"}
                  {profileData.companyName && ` at ${profileData.companyName}`}
                </p>
              </div>
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                  My Home Base
                </h3>
                <p className="text-base sm:text-lg">
                  {profileData.location || "Not specified"}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                  Company
                </h3>
                <p className="text-base sm:text-lg">
                  {profileData.companyName || "Not specified"}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                  My Position
                </h3>
                <p className="text-base sm:text-lg">
                  {profileData.jobTitle || "Not specified"}
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">
                  My Department
                </h3>
                <p className="text-base sm:text-lg">
                  {profileData.department || "Not specified"}
                </p>
              </div>
            </div>

            <div className="w-full mb-8">
              <h2 className="text-xl font-semibold mb-4">About Me</h2>
              <div className="p-4 border rounded-lg">
                <p className="text-base sm:text-lg">
                  {profileData.aboutMe || "Not specified"}
                </p>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4">Focused On</h2>
            <div className="p-4 border rounded-lg mb-8">
              <p className="text-base sm:text-lg">
                {profileData.focus || "Not specified"}
              </p>
            </div>

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
                      This executive uses Give2Meet to take only the most relevant, high-value sales meetings.
                    </p>
                    <p>To request a meeting, you'll be asked to:</p>
                    <ol className="list-decimal pl-6 space-y-2">
                      <li>
                        Pledge a donation to their selected charity. Only charged if they accept your meeting and it occurs.
                      </li>
                      <li>
                        Answer a few quick questions to explain who you are, what you offer, and how you can help solve a real business problem.
                      </li>
                    </ol>
                    <p>
                      This isn't a pay-to-play wall. It's a smarter, impact-driven way to earn time with top decision-makers. Make your outreach thoughtful. If accepted, you'll get direct calendar access and your donation will support a great cause.
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
                placeholder="John"
                icon={<User />}
                value={formData.firstName}
                onChange={(val) => setFormData({ ...formData, firstName: val })}
                error={errors.firstName}
              />
              <InputField
                label="Last Name *"
                type="text"
                placeholder="Doe"
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
                placeholder="Acme Inc."
                icon={<Building />}
                value={formData.company}
                onChange={(val) => setFormData({ ...formData, company: val })}
                error={errors.company}
              />
              <InputField
                label="Job Title *"
                type="text"
                placeholder="Marketing Director"
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
                placeholder="john.doe@example.com"
                icon={<Mail />}
                value={formData.email}
                onChange={(val) => setFormData({ ...formData, email: val })}
                error={errors.email}
              />
              <InputField
                label="Phone Number *"
                type="tel"
                icon={<Phone />}
                placeholder="(123) 456-7890"
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
                placeholder="New York"
                icon={<MapPin />}
                value={formData.city}
                onChange={(val) => setFormData({ ...formData, city: val })}
                error={errors.city}
              />
              <InputField
                label="State *"
                type="text"
                placeholder="NY"
                icon={<MapPin />}
                value={formData.state}
                onChange={(val) => setFormData({ ...formData, state: val })}
                error={errors.state}
              />
              <InputField
                label="Country *"
                type="text"
                placeholder="United States"
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
                placeholder="500"
                icon={<BadgeDollarSign />}
                value={formData.bidAmount}
                onChange={(val) => setFormData({ ...formData, bidAmount: val })}
                error={errors.bidAmount}
                hint={
                  <div className="text-sm text-gray-600 mt-1">
                    <p className="mb-1">
                      Your bid represents a donation to {profileData.userName || "this executive"}'s selected charity.
                      This donation will only be processed if your meeting request is accepted.
                    </p>
                    {profileData.minimumBidDonation ? (
                      <p className="font-medium">
                        Minimum bid amount: ${profileData.minimumBidDonation}
                      </p>
                    ) : null}
                  </div>
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
            {case2Questions.map((question, index) => {
              const questionTitle = [
                "1. Business Challenge Focus",
                "2. Solution Type",
                "3. Industry Experience",
                "4. Proof of Success"
              ][index];

              return (
                <div key={question.questionId} className="mb-6">
                  <h3 className="text-lg font-medium text-[#2C514C] mb-2">
                    {questionTitle}
                  </h3>
                  <RadioGroup
                    label={question.questionText}
                    options={question.options.map((opt) => opt.text)}
                    value={formData[`question_${question.questionId}`] || ""}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        [`question_${question.questionId}`]: val,
                      })
                    }
                    error={errors[`question_${question.questionId}`]}
                    questionId={question.questionId}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                  />
                </div>
              );
            })}
          </>
        );

      case 3:
        return (
          <>
            <p className="font-medium text-2xl mb-6">
              Help the Executive Qualify Your Request
            </p>
            {case3Questions.map((question, index) => {
              const questionTitle = [
                "5. Customer Segment",
                "6. Sales Timing",
                "7. Familiarity with Executive's Space",
                "8. Donation Escrow Preference"
              ][index];

              return (
                <div key={question.questionId} className="mb-6">
                  <h3 className="text-lg font-medium text-[#2C514C] mb-2">
                    {questionTitle}
                  </h3>
                  <RadioGroup
                    label={question.questionText}
                    options={question.options.map((opt) => opt.text)}
                    value={formData[`question_${question.questionId}`] || ""}
                    onChange={(val) =>
                      setFormData({
                        ...formData,
                        [`question_${question.questionId}`]: val,
                      })
                    }
                    error={errors[`question_${question.questionId}`]}
                    questionId={question.questionId}
                    formData={formData}
                    setFormData={setFormData}
                    errors={errors}
                  />
                </div>
              );
            })}
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
            className={`px-6 py-3 rounded-lg bg-[rgba(44,81,76,1)] text-white hover:bg-gray-400 disabled:opacity-50 transition cursor-pointer flex items-center justify-center ${isFirstTab ? "hidden" : ""
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

const InputField = ({ label, type, icon, value, onChange, error, hint, placeholder }) => {
  const handleChange = (e) => {
    let newValue = e.target.value;

    if (type === 'tel') {
      newValue = newValue.replace(/\D/g, '');
    }

    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (newValue && !emailRegex.test(newValue)) {
      }
    }

    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <label className="block font-semibold" style={{ color: "rgba(65, 62, 94, 1)", fontSize: "18px" }}>
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
          placeholder={placeholder}
          onChange={handleChange}
          className={`w-full pl-10 p-3 border ${error ? "border-red-500" : "border-gray-300"
            } rounded-lg focus:ring-2 focus:ring-[#2C514C] focus:outline-none`}
          inputMode={type === 'tel' ? 'numeric' : type === 'email' ? 'email' : 'text'}
          pattern={type === 'tel' ? '[0-9]*' : null}
          maxLength={type === 'tel' ? 15 : undefined}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

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
      className={`w-full p-3 border ${error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:ring-2 focus:ring-[#2C514C] focus:outline-none`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

const RadioGroup = ({
  label,
  options,
  value,
  onChange,
  error,
  questionId,
  formData,
  setFormData,
  errors
}) => {

  const handleChange = (val) => {
    onChange(val);
    if (val !== "Other (please specify)") {
      setFormData(prev => ({
        ...prev,
        [`other_${questionId}`]: ""
      }));
    }
  };

  const handleOtherChange = (val) => {
    setFormData(prev => ({
      ...prev,
      [`other_${questionId}`]: val
    }));
  };

  return (
    <div className="space-y-2">
      <label
        className={`block font-medium ${error ? "text-red-500" : "text-[rgba(33, 37, 41, 1)]"}`}
        style={{ fontSize: "16px" }}
      >
        {label}
      </label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option} className="flex items-start flex-col">
            <div className="flex items-center">
              <input
                type="radio"
                id={`${questionId}_${option}`}
                name={label}
                value={option}
                checked={value === option}
                onChange={(e) => handleChange(e.target.value)}
                className={`h-4 w-4 ${error ? "text-red-500" : "text-[rgba(112,122,136,1)]"} border-gray-900`}
              />
              <label
                htmlFor={`${questionId}_${option}`}
                className="ml-3 text-sm text-[rgba(112,122,136,1)] cursor-pointer"
              >
                {option}
              </label>
            </div>
            {option === "Other (please specify)" && value === "Other (please specify)" && (
              <div className="ml-7 mt-2 w-full">
                <input
                  type="text"
                  value={formData[`other_${questionId}`] || ""}
                  onChange={(e) => handleOtherChange(e.target.value)}
                  placeholder="Please specify your answer..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C514C] focus:outline-none"
                />
                {errors && errors[`other_${questionId}`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`other_${questionId}`]}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default SurveyForm;
