"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  CircleDollarSign,
  Link,
  Mail,
  Briefcase,
  MapPin,
  Building,
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
    motivation: "Describe your solution and its key features.",
    howHeard: "Give a brief description of your solution.",
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
      charityCompany: "",
      minBidDonation: "",
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

    if (currentStep === 4) {
      if (!formData.charityCompany.trim()) {
        newErrors.charityCompany = "Charity company is required";
        isValid = false;
      }
      if (!formData.minBidDonation.trim()) {
        newErrors.minBidDonation = "Minimum bid donation is required";
        isValid = false;
      } else if (isNaN(Number(formData.minBidDonation))) {
        newErrors.minBidDonation = "Please enter a valid number";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
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
    setCurrentStep((prev) => Math.min(prev + 1, 5));
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
  const currentStepParam = searchParams.get('currentStep');
  const userEmail = searchParams.get('userEmail');

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
                  Give Access to Email
                </Button>
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
            <div className="w-full lg:max-w-md space-y-8 text-start">
              <h1 className="text-base sm:text-lg font-[500] text-[#413E5E] mb-4">
                Submit your pre-existing calendar links
              </h1>
              <div>
                <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                  <Link className="text-[rgba(44,81,76,1)]" />
                  <Input
                    onChange={handleInputChange}
                    value={formData.calendarLink}
                    name="calendarLink"
                    type="link"
                    placeholder="Calendar Link"
                    required
                    className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                  />
                </div>
                {errors.calendarLink && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.calendarLink}
                  </p>
                )}
              </div>

              <div className="flex justify-between w-full gap-4">
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
            className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-7 sm:px-8"
          >
            <div className="w-full lg:max-w-md space-y-8">
              <div className="gap-2 flex flex-col w-full">
                <h1 className="text-base sm:text-lg font-[500] text-[var(--secondary-color)]">
                  Charity Company
                </h1>
                <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                  <Input
                    onChange={handleInputChange}
                    value={formData.charityCompany}
                    name="charityCompany"
                    type="text"
                    placeholder="UNICEF"
                    className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                  />
                </div>
                {errors.charityCompany && (
                  <p className="text-red-500 text-sm">
                    {errors.charityCompany}
                  </p>
                )}
              </div>

              <div className="gap-2 flex flex-col w-full">
                <h1 className="text-base sm:text-lg font-[500] text-[var(--secondary-color)]">
                  Minimum Bid Donation
                </h1>
                <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                  <CircleDollarSign className="text-[rgba(44,81,76,1)]" />
                  <Input
                    onChange={handleInputChange}
                    value={formData.minBidDonation}
                    name="minBidDonation"
                    type="string"
                    placeholder="Enter amount (e.g., 50)"
                    className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                  />
                </div>
                {errors.minBidDonation && (
                  <p className="text-red-500 text-sm">
                    {errors.minBidDonation}
                  </p>
                )}
              </div>

              <div className="flex justify-between w-full gap-4">
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
      case 5:
        const submitProfileInformation = async () => {
          try {
            const userEmail = Cookies.get("userEmail");

            if (!userEmail) {
              alert("User email not found. Please log in again.");
              return;
            }

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
                charityCompany: formData.charityCompany,
                minimumBidDonation: formData.minBidDonation,
                howHeard: formData.howHeard,
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
          }
        };
        return (
          <motion.div
            key="step5"
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
                  >
                    {loading ? "Finishing..." : "Finish"}
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
        return "/login-page.svg";
      case 2:
        return "/login-page.svg";
      case 3:
        return "/login-page-2.svg";
      case 4:
        return "/login-page-3.svg";
      default:
        return "/login-page.svg";
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
          className="max-w-full min-h-screen object-cover shrink-0"
        />
      </motion.div>

      <div className="w-full flex lg:hidden items-center justify-center p-5">
        <img
          src="/email-logo.jpg"
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