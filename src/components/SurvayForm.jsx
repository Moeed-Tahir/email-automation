"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  BadgeDollarSign,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

const SurveyForm = ({ userId }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [userQuestions, setUserQuestions] = useState({
    questionOne: "",
    questionTwo: "",
  });
  const [formData, setFormData] = useState({
    bidAmount: "",
    name: "",
    email: "",
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

  const handleNext = () => {
    if (currentTab === 1) {
      const newErrors = {};

      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }

      if (!formData.bidAmount) {
        newErrors.bidAmount = "Bid amount is required";
      } else if (isNaN(formData.bidAmount) || Number(formData.bidAmount) <= 0) {
        newErrors.bidAmount = "Bid amount must be a positive number";
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

      const response = await fetch(
        "/api/routes/SurvayForm?action=sendSurvayForm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            ...formData,
            totalScore,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert("Survey submitted successfully!");
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
    const fetchUserQuestions = async () => {
      try {
        const response = await fetch(
          "/api/routes/SurvayForm?action=getQuestionFromUserId",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setUserQuestions({
            questionOne: data.questionOne || "",
            questionTwo: data.questionTwo || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user questions:", error);
      }
    };

    if (userId) {
      fetchUserQuestions();
    }
  }, [userId]);

  const progressWidth = ((currentTab + 1) / tabs.length) * 100;

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 0:
        return (
          <div className="flex flex-col max-w-7xl mx-auto">
            {/* Top Section with Image and Basic Info */}
            <div className="flex items-start gap-6 mb-6">
              {/* Profile Image (placeholder - replace with actual image) */}
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>

              {/* Name and Designation */}
              <div className="flex-1">
                <h1
                  className="text-3xl font-bold"
                  style={{ color: "rgba(44, 81, 76, 1)" }}
                >
                  Keith Wright
                </h1>
                <p className="text-lg text-gray-600">Executive at SweepLift</p>

                {/* Response Status */}
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-green-100 border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-sm font-medium text-green-800">
                    Instent response
                  </span>
                </div>
              </div>
            </div>

            {/* LinkedIn Profiles */}
            <div className="flex gap-6 mb-8">
              <div className="flex-1 p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Company Profile
                </h3>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <a
                    href="https://linkedin.com/company/sweeplift"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    SweepLift
                  </a>
                </div>
              </div>

              <div className="flex-1 p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Personal Profile
                </h3>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-blue-600 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  <a
                    href="https://linkedin.com/in/keithwright408"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    keithwright408
                  </a>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Position</h3>
                <p className="text-lg">CEO</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Department</h3>
                <p className="text-lg">Sales</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Timezone</h3>
                <p className="text-lg">America/New_York</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-3">Address</h3>
                <p className="text-lg">California, United States</p>
              </div>
            </div>

            {/* Pitch Me Section */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-8">
              <h3 className="text-xl font-bold mb-3">Pitch Me</h3>
              <p className="mb-4">
                Please fill out the form below to help me understand you.
              </p>
              <p className="text-sm italic text-gray-600">
                Note: please use this instead of cold prospecting.
              </p>
            </div>
          </div>
        );
      case 1:
        return (
          <>
            <p className="font-medium text-2xl mb-6">
              Enter Your Name and Email
            </p>
            <InputField
              label="Name"
              type="text"
              icon={<User />}
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val })}
              error={errors.name}
            />
            <InputField
              label="Email Address"
              type="email"
              icon={<Mail />}
              value={formData.email}
              onChange={(val) => setFormData({ ...formData, email: val })}
              error={errors.email}
            />
            <InputField
              label="Bid Amount ($)"
              type="number"
              icon={<BadgeDollarSign />}
              value={formData.bidAmount}
              onChange={(val) => setFormData({ ...formData, bidAmount: val })}
              error={errors.bidAmount}
            />
          </>
        );
      case 2:
        return (
          <>
            <p className="font-medium text-2xl mb-6">
              Open-Ended Questions (Qualitative Insight)
            </p>
            <TextAreaField
              label={`${userQuestions.questionOne}`}
              value={formData.solutionDescription}
              onChange={(val) =>
                setFormData({ ...formData, solutionDescription: val })
              }
              error={errors.solutionDescription}
            />
            <TextAreaField
              label={`${userQuestions.questionTwo}`}
              value={formData.businessChallengeSolution}
              onChange={(val) =>
                setFormData({ ...formData, businessChallengeSolution: val })
              }
              error={errors.businessChallengeSolution}
            />
          </>
        );
      case 3:
        return (
          <>
            <p className="font-medium text-2xl mb-6">
              Close-Ended Questions (Qualitative Insight)
            </p>
            <RadioGroup
              label="What specific business problem does your solution address?"
              options={[
                "Reducing operational costs",
                "Increasing revenue",
                "Enhancing customer experience",
                "Improving productivity/efficiency",
                "Regulatory compliance",
              ]}
              value={formData.businessProblem}
              onChange={(val) =>
                setFormData({ ...formData, businessProblem: val })
              }
              error={errors.businessProblem}
            />
            <RadioGroup
              label="How long does it typically take for clients to see results with your solution?"
              options={[
                "Over 12 months",
                "6-12 months",
                "3-6 months",
                "1-3 months",
                "Immediate",
              ]}
              value={formData.resultsTimeframe}
              onChange={(val) =>
                setFormData({ ...formData, resultsTimeframe: val })
              }
              error={errors.resultsTimeframe}
            />
            <RadioGroup
              label="Do you have proven results or case studies in my industry that you would be willing to provide?"
              options={[
                "No case studies available",
                "One relevant case study",
                "Multiple relevant case studies",
              ]}
              value={formData.caseStudies}
              onChange={(val) => setFormData({ ...formData, caseStudies: val })}
              error={errors.caseStudies}
            />
            <RadioGroup
              label="How would you summarize your offering?"
              options={[
                "Product",
                "Service",
                "Consulting/Advisory",
                "Comprehensive Solution",
              ]}
              value={formData.offeringType}
              onChange={(val) =>
                setFormData({ ...formData, offeringType: val })
              }
              error={errors.offeringType}
            />
          </>
        );
      case 4:
        return (
          <>
            <p className="font-medium text-2xl mb-6">
              Close-Ended Questions (Qualitative Insight)
            </p>
            <RadioGroup
              label="Are you willing to offer a performance-based guarantee or proof of concept?"
              options={[
                "No",
                "Yes, but with conditions",
                "Yes, unconditionally",
              ]}
              value={formData.performanceGuarantee}
              onChange={(val) =>
                setFormData({ ...formData, performanceGuarantee: val })
              }
              error={errors.performanceGuarantee}
            />
            <RadioGroup
              label="Are you willing to make a donation to my favorite charity if a meeting is accepted?"
              options={["No", "Yes"]}
              value={formData.DonationWilling}
              onChange={(val) =>
                setFormData({ ...formData, DonationWilling: val })
              }
              error={errors.DonationWilling}
            />
            <>
              <RadioGroup
                label="Would you be willing to escrow this donation amount to be released after the meeting takes place?"
                options={["No", "Yes"]}
                value={formData.escrowDonation}
                onChange={(val) =>
                  setFormData({ ...formData, escrowDonation: val })
                }
                error={errors.escrowDonation}
              />
              <RadioGroup
                label="How much would you be willing to donate?"
                options={[
                  "$10-$50",
                  "$51-$100",
                  "$101-$200",
                  "$201-$300",
                  "$301-$400",
                  "$401-$500",
                ]}
                value={formData.charityDonation}
                onChange={(val) =>
                  setFormData({ ...formData, charityDonation: val })
                }
                error={errors.charityDonation}
              />
            </>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white mt-10 relative overflow-hidden flex flex-col justify-between gap-10">
      {/* Progress bar */}
      <div className="w-full h-2 bg-[rgba(75,70,92,0.08)] rounded-full overflow-hidden mb-8">
        <motion.div
          className="h-full"
          style={{ backgroundColor: "rgba(44, 81, 76, 1)" }}
          initial={{ width: 0 }}
          animate={{ width: `${progressWidth}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Form */}
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

        {/* Buttons */}
        <div className="flex justify-between mt-10 flex-wrap gap-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={isFirstTab}
            className="px-6 py-3 rounded-lg bg-[rgba(44,81,76,1)] text-white hover:bg-gray-400 disabled:opacity-50 transition cursor-pointer flex items-center justify-center"
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
                {currentTab == 0 ? "Pitch me" : "Next"}{" "}
                <ChevronRight size={16} className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

// Input field component
const InputField = ({ label, type, icon, value, onChange, error }) => (
  <div className="space-y-2">
    <label
      className="block font-semibold"
      style={{ color: "rgba(65, 62, 94, 1)", fontSize: "18px" }}
    >
      {label}
    </label>
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

// TextArea field component
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

// Radio group component
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
