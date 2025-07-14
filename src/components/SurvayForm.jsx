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

      // Validate first name
      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }

      // Validate last name
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }

      // Validate email
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }

      // Validate company
      if (!formData.company.trim()) {
        newErrors.company = "Company is required";
      }

      // Validate job title
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = "Job title is required";
      }

      // Validate phone number
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = "Phone number is required";
      }

      // Validate location fields
      if (!formData.city.trim()) {
        newErrors.city = "City is required";
      }
      if (!formData.state.trim()) {
        newErrors.state = "State is required";
      }
      if (!formData.country.trim()) {
        newErrors.country = "Country is required";
      }

      // Validate bid amount
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
          <div className="flex flex-col max-w-7xl mx-auto">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profileData.userProfilePhoto ? (
                  <img
                    src={profileData.userProfilePhoto}
                    alt={profileData.userName}
                    className="w-full h-full object-cover"
                  />
                ) : (
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
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold">
                  {profileData.userName || "No name provided"}
                </h1>
                <p className="text-lg text-gray-600">
                  {profileData.jobTitle || "No job title provided"}
                  {profileData.companyName && ` at ${profileData.companyName}`}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                    <span className="text-sm font-medium text-green-800">
                      Responsive
                    </span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 border border-blue-200">
                    <span className="text-sm font-medium text-blue-800">
                      Company
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Personal Information */}
              <div className="col-span-1">
                <h2 className="text-xl font-semibold mb-4">Personal</h2>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">LinkedIn</h3>
                    <p className="text-lg">
                      {profileData.linkedInProfile || "Not specified"}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">My Home Base</h3>
                    <div className="flex gap-4">
                      <p className="text-lg">
                        {profileData.location || "Not specified"}
                      </p>
                      <p className="text-lg">
                        {profileData.timezone || "America/New York"}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">About Me</h3>
                    <p className="text-lg">
                      {profileData.aboutMe || "Not specified"}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">My Department</h3>
                    <p className="text-lg">
                      {profileData.department || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="col-span-1">
                <h2 className="text-xl font-semibold mb-4">Response Status</h2>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Company</h3>
                    <p className="text-lg">
                      {profileData.companyName || "Not specified"}
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">My Position In The Company</h3>
                    <p className="text-lg">
                      {profileData.jobTitle || "Not specified"}
                    </p>
                  </div>
                </div>

                <h2 className="text-xl font-semibold mb-4 mt-6">Focused On</h2>
                <div className="p-4 border rounded-lg">
                  <p className="text-lg">
                    {profileData.focus || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
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
                onChange={(val) => setFormData({ ...formData, phoneNumber: val })}
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
            {formData.DonationWilling === "Yes" && (
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
            )}
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
        className={`w-full pl-10 p-3 border ${error ? "border-red-500" : "border-gray-300"
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
      className={`w-full p-3 border ${error ? "border-red-500" : "border-gray-300"
        } rounded-lg focus:ring-2 focus:ring-[#2C514C] focus:outline-none`}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

// Radio group component
const RadioGroup = ({ label, options, value, onChange, error }) => (
  <div className="space-y-2">
    <label
      className={`block font-medium ${error ? "text-red-500" : "text-[rgba(33, 37, 41, 1)]"
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
            className={`h-4 w-4 ${error ? "text-red-500" : "text-[rgba(112,122,136,1)]"
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