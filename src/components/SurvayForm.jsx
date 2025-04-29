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
    questionTwo: ""
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
    { title: "Bid & Contact" },
    { title: "Solution Details" },
    { title: "Business Impact" },
    { title: "Commitment & Donation" },
  ];

  const isLastTab = currentTab === tabs.length - 1;
  const isFirstTab = currentTab === 0;

  const handleNext = () => {
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

      const response = await fetch('/api/routes/SurvayForm?action=sendSurvayForm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...formData,
          totalScore
        }),
      });

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
        const response = await fetch('/api/routes/SurvayForm?action=getQuestionFromUserId', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const data = await response.json();
          setUserQuestions({
            questionOne: data.questionOne || "",
            questionTwo: data.questionTwo || ""
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
      case 1:
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
      case 2:
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
      case 3:
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
                Next <ChevronRight size={16} className="ml-2" />
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
        className={`w-full pl-10 p-3 border ${error ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-[#2C514C] focus:outline-none`}
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
      className={`w-full p-3 border ${error ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-[#2C514C] focus:outline-none`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

// Radio group component
const RadioGroup = ({ label, options, value, onChange, error }) => (
  <div className="space-y-2">
    <label
      className={`block font-medium ${error ? "text-red-500" : "text-[rgba(33, 37, 41, 1)]"}`}
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
            className={`h-4 w-4 ${error ? "text-red-500" : "text-[rgba(112,122,136,1)]"} border-gray-900`}
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