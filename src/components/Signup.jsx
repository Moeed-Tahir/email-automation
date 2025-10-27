"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  CircleDollarSign,
  Link2Icon,
  Mail,
  Briefcase,
  MapPin,
  Building,
  Loader2,
  Trash2,
  Plus,
} from "lucide-react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter, useSearchParams } from "next/navigation";

const SignupFlow = () => {
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    location: "",
    calendarLink: "",
    charityCompany: "",
    minBidDonation: "",
    industry: "",
    linkedInProfile: "",
    motivation: "What problem does your product or service solve, and why is it relevant to this executive's business?",
    howHeard:
      "If this meeting happens, what would success look like for both of you?",
    businessChallenge: {
      questionType: "Business Challenge",
      question: "What business challenge does your solution help solve?",
      questionScore: 4,
      options: [
        { text: "Reduce costs", score: 10 },
        { text: "Increase revenue", score: 10 },
        { text: "Improve operational efficiency", score: 9 },
        { text: "Accelerate time-to-market", score: 8 },
        { text: "Enhance security or compliance", score: 7 },
        { text: "Improve customer experience", score: 7 },
        { text: "Other (please specify)", score: 5 },
      ],
    },
    solutionType: {
      questionType: "Solution Type",
      question: "What type of solution are you offering?",
      questionScore: 4,
      options: [
        { text: "Product (SaaS or Hardware)", score: 8 },
        { text: "Service (Consulting, Agency, etc.)", score: 6 },
        { text: "Hybrid (Product + Service)", score: 9 },
        { text: "Marketplace / Platform", score: 7 },
        { text: "Other (please specify)", score: 5 },
      ],
    },
    industryExperience: {
      questionType: "Industry Experience",
      question:
        "Have you worked with companies in this executive's industry before?",
      questionScore: 3,
      options: [
        { text: "Yes", score: 10 },
        { text: "No", score: 2 },
        { text: "Not sure", score: 5 },
      ],
    },
    proofOfSuccess: {
      questionType: "Proof of Success",
      question:
        "Do you have a relevant case study, customer example, or proof of success?",
      questionScore: 4,
      options: [
        { text: "Yes, and I can share it", score: 10 },
        { text: "No, not yet", score: 3 },
        { text: "Working on it", score: 6 },
      ],
    },
    customerSegment: {
      questionType: "Customer Segment",
      question: "What is your typical customer size or segment?",
      questionScore: 3,
      options: [
        { text: "Startups (<50 employees)", score: 5 },
        { text: "Mid-Market (50-500 employees)", score: 8 },
        { text: "Enterprise (500+ employees)", score: 10 },
        { text: "We serve all sizes", score: 7 },
        { text: "Not sure / varies", score: 4 },
      ],
    },
    salesTiming: {
      questionType: "Sales Timing",
      question:
        "How soon are you looking to engage with a solution like yours?",
      questionScore: 4,
      options: [
        { text: "Actively seeking now", score: 10 },
        { text: "Within 3 months", score: 8 },
        { text: "Within 6 months", score: 6 },
        { text: "Longer-term", score: 4 },
        { text: "Just exploring", score: 2 },
      ],
    },
    familiarity: {
      questionType: "Familiarity",
      question:
        "How familiar are you with this executive's company or industry?",
      questionScore: 3,
      options: [
        {
          text: "Very familiar - We've researched their company and market",
          score: 10,
        },
        { text: "Somewhat familiar - We understand the basics", score: 7 },
        { text: "Not very familiar - We're still learning", score: 4 },
        {
          text: "New to this industry but believe we can bring value",
          score: 2,
        },
      ],
    },
    donationEscrowPreference: {
      questionType: "Donation Escrow Preference",
      question:
        "Are you open to putting the donation into escrow until after the meeting?",
      questionScore: 2,
      options: [
        { text: "Yes", score: 10 },
        { text: "No", score: 0 },
        { text: "Need more information", score: 5 },
      ],
    },
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    companyName: "",
    jobTitle: "",
    jobDescription: "",
    location: "",
    calendarLink: "",
    charityCompany: "",
    minBidDonation: "",
    industry: "",
    linkedInProfile: ""
  });
  const router = useRouter();

  const validateStep = () => {
    let isValid = true;
    const newErrors = {
      companyName: "",
      jobTitle: "",
      jobDescription: "",
      location: "",
      calendarLink: "",
      linkedInProfile: "",
      charityCompany: "",
      minBidDonation: "",
      industry: "",
    };

    if (currentStep === 2) {
      if (!formData.companyName.trim()) {
        newErrors.companyName = "Company name is required";
        isValid = false;
      }
      if (!formData.jobTitle.trim()) {
        newErrors.jobTitle = "Job title is required";
        isValid = false;
      }
      if (!formData.jobDescription.trim()) {
        newErrors.jobDescription = "Job description is required";
        isValid = false;
      }
      if (!formData.location.trim()) {
        newErrors.location = "Location is required";
        isValid = false;
      }
    }

    if (currentStep === 3 && !formData.calendarLink.trim()) {
      newErrors.calendarLink = "Calendar link is required";
      isValid = false;
    }

    if (currentStep === 3 && !formData.linkedInProfile.trim()) {
      newErrors.linkedInProfile = "LinkedIn link is required";
      isValid = false;
    }

    if (currentStep === 3) {
      if (!formData.minBidDonation.trim()) {
        newErrors.minBidDonation = "Minimum bid donation is required";
        isValid = false;
      } else if (isNaN(Number(formData.minBidDonation))) {
        newErrors.minBidDonation = "Please enter a valid number";
        isValid = false;
      } else if (!formData.industry.trim()) {
        newErrors.industry = "Please enter your Industry";
        isValid = false;
      }
    }

    if (currentStep === 4 || currentStep === 5) {
      const questions = currentStep === 4
        ? ["businessChallenge", "solutionType", "industryExperience", "proofOfSuccess"]
        : ["customerSegment", "salesTiming", "familiarity", "donationEscrowPreference"];

      questions.forEach((q) => {
        // Validate question score is between 0-4
        if (formData[q].questionScore < 0 || formData[q].questionScore > 4) {
          newErrors[q] = "Question weight must be between 0 and 4";
          isValid = false;
        }

        const hasScore = formData[q].options.some((opt) => opt.score > 0);
        if (!hasScore) {
          newErrors[q] = "Please select at least one option with a score > 0";
          isValid = false;
        }

        const invalidScores = formData[q].options.some((opt) => opt.score < 0 || opt.score > 10);
        if (invalidScores) {
          newErrors[q] = "Option scores must be between 0 and 10";
          isValid = false;
        }
      });
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleQuestionChange = (questionName, value) => {
    setFormData((prev) => ({
      ...prev,
      [questionName]: {
        ...prev[questionName],
        question: value,
      },
    }));
  };

  const handleQuestionScoreChange = (questionName, value) => {
    const scoreValue = Math.min(4, Math.max(0, parseInt(value) || 0));
    setFormData((prev) => ({
      ...prev,
      [questionName]: {
        ...prev[questionName],
        questionScore: scoreValue,
      },
    }));
  };

  const handleOptionChange = (questionName, optionIndex, value) => {
    setFormData((prev) => {
      const updatedOptions = [...prev[questionName].options];
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        text: value,
      };
      return {
        ...prev,
        [questionName]: {
          ...prev[questionName],
          options: updatedOptions,
        },
      };
    });
  };

  const handleScoreChange = (questionName, optionIndex, value) => {
    const scoreValue = Math.min(10, Math.max(0, parseInt(value) || 0));
    setFormData((prev) => {
      const updatedOptions = [...prev[questionName].options];
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        score: scoreValue,
      };
      return {
        ...prev,
        [questionName]: {
          ...prev[questionName],
          options: updatedOptions,
        },
      };
    });
  };

  const addOption = (questionName) => {
    setFormData((prev) => ({
      ...prev,
      [questionName]: {
        ...prev[questionName],
        options: [...prev[questionName].options, { text: "", score: 0 }],
      },
    }));
  };

  const removeOption = (questionName, optionIndex) => {
    setFormData((prev) => {
      const updatedOptions = [...prev[questionName].options];
      updatedOptions.splice(optionIndex, 1);
      return {
        ...prev,
        [questionName]: {
          ...prev[questionName],
          options: updatedOptions,
        },
      };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  };

  useEffect(() => {
    const currentStepParam = searchParams.get("currentStep");
    const userEmail = searchParams.get("userEmail");

    if (userEmail) {
      Cookies.set("userEmail", userEmail, {
        path: "/",
        expires: 7,
      });
    }

    if (currentStepParam) {
      const step = parseInt(currentStepParam, 10);
      if (!isNaN(step) && step >= 1 && step <= 5) {
        setCurrentStep(step);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    const checkUserStatus = async () => {
      const email = Cookies.get("userEmail");
      if (!email) return;

      try {
        const res = await axios.get(
          `/api/routes/ProfileInfo?action=checkUser`,
          {
            params: { userProfileEmail: email },
          }
        );
        if (res.data.currentStep === 0) {
          setCurrentStep(1);
        } else if (res.data.currentStep === 1) {
          setCurrentStep(2);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkUserStatus();
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        const handleGmailAuth = () => {
          window.location.href = `${process.env.NEXT_PUBLIC_REQUEST_URL}/api/routes/Google?action=startAuth`;
        };

        return (
          <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-7 sm:px-8"
          >
            <div className="w-full lg:max-w-md space-y-8 text-start">
              <h1 className="text-3xl md:text-[40px] font-semibold text-[var(--secondary-color)] mb-4 text-left leading-[51px]">
                Please add your gmail to continue
              </h1>
              <div className="w-full space-y-6 flex flex-col items-start justify-start sm:mr-24">
                <Button
                  onClick={handleGmailAuth}
                  className="w-full bg-[rgba(44,81,76,1)] border-2 border-[rgba(44,81,76,0.9)] hover:bg-transparent hover:text-[rgba(44,81,76,1)] h-12 text-lg cursor-pointer"
                >
                  <svg
                    className="size-5 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                  Continue with Google
                </Button>
                {/* Privacy Policy and Terms Links */}
                <div className="w-full text-left pt-2">
                  <p className="text-sm text-gray-500 leading-relaxed inline">
                    By continuing, you acknowledge that you have read and agree
                    to our{" "}
                    <span>
                      <Link
                        href="/t&cs"
                        className="text-[rgba(44,81,76,1)] underline font-bold"
                      // target="_blank"
                      >
                        Terms of Service
                      </Link>
                    </span>{" "}
                    and{" "}
                    <span>
                      <Link
                        href="/privacy"
                        className="text-[rgba(44,81,76,1)] underline font-bold"
                      // target="_blank"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                    . This includes consent to access your Gmail data for
                    automated email processing.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            key="step2"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-7 sm:px-8"
          >
            <div className="w-full lg:max-w-md space-y-6">
              <h1 className="text-3xl md:text-[40px] font-semibold text-[var(--secondary-color)] mb-4 text-left leading-[51px]">
                Professional Information
              </h1>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Company Name
                  </Label>
                  <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                    <Building className="text-[rgba(44,81,76,1)] size-5" />
                    <Input
                      onChange={handleInputChange}
                      value={formData.companyName}
                      name="companyName"
                      type="text"
                      placeholder="Enter your company name"
                      className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                    />
                  </div>
                  {errors.companyName && (
                    <p className="text-red-500 text-sm">{errors.companyName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Job Title
                  </Label>
                  <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                    <Briefcase className="text-[rgba(44,81,76,1)] size-5" />
                    <Input
                      onChange={handleInputChange}
                      value={formData.jobTitle}
                      name="jobTitle"
                      type="text"
                      placeholder="Enter your job title"
                      className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                    />
                  </div>
                  {errors.jobTitle && (
                    <p className="text-red-500 text-sm">{errors.jobTitle}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Job Description
                  </Label>
                  <Textarea
                    onChange={handleInputChange}
                    value={formData.jobDescription}
                    name="jobDescription"
                    placeholder="Describe your role and responsibilities"
                    className="w-full min-h-[100px] resize-none text-base sm:text-lg p-4 focus-visible:ring-0 bg-white"
                  />
                  {errors.jobDescription && (
                    <p className="text-red-500 text-sm">
                      {errors.jobDescription}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                    <MapPin className="text-[rgba(44,81,76,1)] size-5" />
                    <Input
                      onChange={handleInputChange}
                      value={formData.location}
                      name="location"
                      type="text"
                      placeholder="Enter your work location"
                      className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                    />
                  </div>
                  {errors.location && (
                    <p className="text-red-500 text-sm">{errors.location}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-between w-full gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="h-12 w-32 md:w-36 cursor-pointer text-base sm:text-lg border-gray-300 text-gray-700"
                >
                  Back
                </Button>
                <Button
                  onClick={nextStep}
                  size={"default"}
                  className="h-12 w-44 text-lg bg-[#2c514c] text-white cursor-pointer border-2 
                  border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)]"
                >
                  Next
                </Button>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            key="step3"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-7 sm:px-8"
          >
            <div className="w-full lg:max-w-md space-y-6">
              <h1 className="text-3xl md:text-[40px] font-semibold text-[var(--secondary-color)] mb-4 text-left leading-[51px]">
                Charity & Calendar Information
              </h1>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Calendar Link
                  </Label>
                  <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                    <Link2Icon className="text-[rgba(44,81,76,1)] size-5" />
                    <Input
                      onChange={handleInputChange}
                      value={formData.calendarLink}
                      name="calendarLink"
                      type="link"
                      placeholder="Enter your calendar link"
                      className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                      required
                    />
                  </div>
                  {errors.calendarLink && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.calendarLink}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    LinkedIn Link
                  </Label>
                  <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                    <Link2Icon className="text-[rgba(44,81,76,1)] size-5" />
                    <Input
                      onChange={handleInputChange}
                      value={formData.linkedInProfile}
                      name="linkedInProfile"
                      type="link"
                      placeholder="Enter your LinkedIn link"
                      className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                      required
                    />
                  </div>
                  {errors.linkedInProfile && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.linkedInProfile}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Minimum Bid Donation
                  </Label>
                  <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                    <CircleDollarSign className="text-[rgba(44,81,76,1)] size-5" />
                    <Input
                      onChange={handleInputChange}
                      value={formData.minBidDonation}
                      name="minBidDonation"
                      type="text"
                      placeholder="Enter amount (e.g., 50)"
                      className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                    />
                  </div>
                  {errors.minBidDonation && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.minBidDonation}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Industry
                  </Label>
                  <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                    <CircleDollarSign className="text-[rgba(44,81,76,1)] size-5" />
                    <Input
                      onChange={handleInputChange}
                      value={formData.industry}
                      name="industry"
                      type="text"
                      placeholder="Enter Industry"
                      className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                    />
                  </div>
                  {errors.industry && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.industry}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between w-full gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  className="h-12 w-32 md:w-36 cursor-pointer text-base sm:text-lg border-gray-300 text-gray-700"
                >
                  Back
                </Button>
                <Button
                  onClick={nextStep}
                  size={"default"}
                  className="h-12 w-44 text-lg bg-[#2c514c] text-white cursor-pointer border-2 
      border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)]"
                >
                  Next
                </Button>
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div
            key="step4"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="flex flex-col justify-start items-center w-full mx-auto h-full text-left px-4 sm:px-6"
          >
            <div className="w-full max-w-4xl space-y-6 py-6">
              <h1 className="text-3xl font-semibold text-[var(--secondary-color)]">
                Close-Ended Questions
              </h1>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-2">
                  <h2 className="text-lg font-medium text-gray-800">
                    Please set weights for questions (0-4) and scores for options (0-10)
                  </h2>
                  <p className="text-sm text-gray-500">
                    Score each question from 0 (not important) to 4 (very important) and each option from 0 (not relevant) to 10 (very relevant)
                  </p>
                </div>

                <div className="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto">
                  {[
                    "businessChallenge",
                    "solutionType",
                    "industryExperience",
                    "proofOfSuccess",
                  ].map((questionName) => (
                    <div key={questionName} className="p-6 space-y-4">
                      <p className="text-sm font-bold">
                        {formData[questionName].questionType}
                      </p>

                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-10 space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Question
                          </Label>
                          <Input
                            value={formData[questionName].question}
                            onChange={(e) =>
                              handleQuestionChange(questionName, e.target.value)
                            }
                            className="text-base"
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Weight (0-4)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="4"
                            value={formData[questionName].questionScore}
                            onChange={(e) =>
                              handleQuestionScoreChange(questionName, e.target.value)
                            }
                            className="text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Options (Score 0-10)
                        </Label>
                        <div className="space-y-2">
                          {formData[questionName].options.map(
                            (option, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-12 gap-3 items-center"
                              >
                                <div className="col-span-7">
                                  <Input
                                    value={option.text}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        questionName,
                                        index,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Option text"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={option.score}
                                    onChange={(e) =>
                                      handleScoreChange(
                                        questionName,
                                        index,
                                        e.target.value
                                      )
                                    }
                                    className="text-center"
                                    placeholder="Score (0-10)"
                                  />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeOption(questionName, index)
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => addOption(questionName)}
                          className="mt-2"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Option
                        </Button>
                      </div>
                      {errors[questionName] && (
                        <p className="text-red-500 text-sm">
                          {errors[questionName]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="h-12 w-32"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="h-12 w-44 bg-[#2c514c] text-white hover:bg-[#1f3a36]"
                  >
                    Continue to Part 2
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 5:
        return (
          <motion.div
            key="step5"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="flex flex-col justify-start items-center w-full mx-auto h-full text-left px-4 sm:px-6"
          >
            <div className="w-full max-w-4xl space-y-6 py-6">
              <h1 className="text-3xl font-semibold text-[var(--secondary-color)]">
                Close-Ended Questions
              </h1>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 space-y-2">
                  <h2 className="text-lg font-medium text-gray-800">
                    Please set weights for questions (0-4) and scores for options (0-10)
                  </h2>
                  <p className="text-sm text-gray-500">
                    Score each question from 0 (not important) to 4 (very important) and each option from 0 (not relevant) to 10 (very relevant)
                  </p>
                </div>

                <div className="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto">
                  {[
                    "customerSegment",
                    "salesTiming",
                    "familiarity",
                    "donationEscrowPreference",
                  ].map((questionName) => (
                    <div key={questionName} className="p-6 space-y-4">
                      <p className="text-sm font-bold">
                        {formData[questionName].questionType}
                      </p>

                      <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-10 space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Question
                          </Label>
                          <Input
                            value={formData[questionName].question}
                            onChange={(e) =>
                              handleQuestionChange(questionName, e.target.value)
                            }
                            className="text-base"
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-sm font-medium text-gray-700">
                            Weight (0-4)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="4"
                            value={formData[questionName].questionScore}
                            onChange={(e) =>
                              handleQuestionScoreChange(questionName, e.target.value)
                            }
                            className="text-center"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700">
                          Options (Score 0-10)
                        </Label>
                        <div className="space-y-2">
                          {formData[questionName].options.map(
                            (option, index) => (
                              <div
                                key={index}
                                className="grid grid-cols-12 gap-3 items-center"
                              >
                                <div className="col-span-7">
                                  <Input
                                    value={option.text}
                                    onChange={(e) =>
                                      handleOptionChange(
                                        questionName,
                                        index,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Option text"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={option.score}
                                    onChange={(e) =>
                                      handleScoreChange(
                                        questionName,
                                        index,
                                        e.target.value
                                      )
                                    }
                                    className="text-center"
                                    placeholder="Score (0-10)"
                                  />
                                </div>
                                <div className="col-span-2 flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeOption(questionName, index)
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => addOption(questionName)}
                          className="mt-2"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Option
                        </Button>
                      </div>
                      {errors[questionName] && (
                        <p className="text-red-500 text-sm">
                          {errors[questionName]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="h-12 w-32"
                  >
                    Back to Part 1
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="h-12 w-44 bg-[#2c514c] text-white hover:bg-[#1f3a36]"
                  >
                    Continue to Final Step
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 6:
        const submitProfileInformation = async () => {
          setLoading(true);
          try {
            const userEmail = Cookies.get("userEmail");

            if (!userEmail) {
              alert("User email not found. Please log in again.");
              setLoading(false);
              return;
            }

            const closeEndedQuestions = Object.entries(formData)
              .filter(
                ([key, value]) =>
                  typeof value === "object" &&
                  value !== null &&
                  value.question &&
                  Array.isArray(value.options)
              )
              .map(([key, value]) => ({
                questionText: value.question,
                questionScore: value.questionScore,
                options: value.options,
              }));

            const response = await axios.post(
              "/api/routes/ProfileInfo?action=addProfileInfo",
              {
                userEmail: userEmail,
                jobDescription: formData.jobDescription,
                location: formData.location,
                jobTitle: formData.jobTitle,
                companyName: formData.companyName,
                questionSolution: formData.motivation,
                calendarLink: formData.calendarLink,
                linkedInProfile: formData.linkedInProfile,
                charityCompany: formData.charityCompany,
                minimumBidDonation: formData.minBidDonation,
                howHeard: formData.howHeard,
                industry: formData.industry,
                closeEndedQuestions: closeEndedQuestions,
              }
            );

            Cookies.set("UserId", response.data.user.userId, {
              path: "/",
              expires: 7,
            });
            Cookies.set("Token", response.data.token, {
              path: "/",
              expires: 7,
            });
            Cookies.set("userName", response.data.userName, {
              path: "/",
              expires: 7,
            });
            Cookies.set("userEmail", response.data.userEmail, {
              path: "/",
              expires: 7,
            });
            Cookies.set("userPhoto", response.data.userPhoto, {
              path: "/",
              expires: 7,
            });
            Cookies.set("charityCompany", response.data.charityCompany, {
              path: "/",
              expires: 7,
            });

            router.push(`/${response.data.user.userId}/dashboard`);
          } catch (error) {
            console.error("Error occurred:", error);
            alert(
              error.response?.data?.message ||
              "Failed to update profile. Please try again."
            );
            setLoading(false);
          }
        };
        return (
          <motion.div
            key="step6"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-7 md:px-8 overflow-auto"
          >
            <div className="w-full lg:max-w-xl md:space-y-8 lg:space-y-5">
              <h1 className="text-3xl md:text-2xl font-semibold text-[var(--secondary-color)] mb-4 text-left leading-[50px]">
                Survey For Sales Representative
              </h1>

              <div className="md:space-y-12 lg:space-y-4 border border-gray-200 rounded-sm p-4 md:p-6 lg:p-4 bg-white">
                <section className="space-y-6 lg:space-y-3">
                  <h2 className="text-xl md:text-xl font-[500] text-gray-800 mb-3">
                    Open-Ended Questions
                  </h2>

                  <div className="md:space-y-6 lg:space-y-5">
                    <div className="space-y-2">
                      <Textarea
                        className="w-full min-h-[100px] resize-none text-base sm:text-lg p-4 focus-visible:ring-0"
                        onChange={handleInputChange}
                        value={formData.motivation}
                        name="motivation"
                        placeholder="Add an open-added question here"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        className="w-full min-h-[100px] resize-none text-base sm:text-lg p-4 focus-visible:ring-0"
                        placeholder="Add an open-added question here"
                        onChange={handleInputChange}
                        value={formData.howHeard}
                        name="howHeard"
                        rows={4}
                      />
                    </div>
                  </div>
                </section>

                <hr className="border-gray-200 my-4 xl:my-8" />

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="h-12 w-32 md:w-36 text-base sm:text-lg px-6 sm:px-8 border-gray-300 text-gray-700 cursor-pointer"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={submitProfileInformation}
                    className="h-12 w-32 md:w-44 text-base sm:text-lg bg-[#2c514c] text-white border-2 border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)] cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Finishing...
                      </>
                    ) : (
                      "Finish"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const getImageForStep = () => {
    switch (currentStep) {
      case 1:
        return "/framer.png";
      case 2:
        return "/framer.png";
      case 3:
        return "/login-page-2.svg";
      case 4:
        return "/login-page-3.svg";
      default:
        return "/framer.png";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[rgb(255,253,240)] overflow-hidden">
      <motion.div
        key={`image-${currentStep}`}
        className="hidden lg:flex items-center justify-center max-h-screen"
      >
        <img
          src={getImageForStep()}
          alt={`Step ${currentStep}`}
          className="w-[400px] min-h-screen object-cover shrink-0"
        />
      </motion.div>

      <div className="w-full flex lg:hidden items-center justify-center p-5">
        <img
          src="/Givetomeet-updated.png"
          alt="Logo"
          className="max-w-full object-contain shrink-0"
        />
      </div>

      <div className="w-full lg:w-[118%] relative h-full">
        <AnimatePresence custom={direction} initial={false}>
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignupFlow;