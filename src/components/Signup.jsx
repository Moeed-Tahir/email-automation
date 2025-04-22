"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SignupFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward
  const [formData, setFormData] = useState({
    calendarLink: "",
    charityCompany: "",
    minBidDonation: "",
    motivation: "",
    howHeard: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
            className="w-[70%] flex flex-col justify-center p-12 h-full"
          >
            <h1 className="text-4xl font-bold text-[var(--secondary-color)] mb-4">
              Continue With LinkedIn
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Please attach your LinkedIn profile so your information can be
              automatically filled from it.
            </p>

            <button
              className="flex items-center justify-center bg-[rgba(44,81,76,1)] text-white py-3 px-6 rounded-lg w-fit hover:bg-[rgba(44,81,76,0.9)] transition-colors"
              onClick={nextStep}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              Continue with LinkedIn
            </button>
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
            className="w-[70%] flex flex-col justify-center p-12 h-full"
          >
            <h1 className="text-4xl font-bold text-[var(--secondary-color)] mb-4">
              Email Access
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              To personalize your experience, we need access to your email.
            </p>

            <button
              className="flex items-center justify-center bg-[rgba(44,81,76,1)] text-white py-3 px-6 rounded-lg w-fit hover:bg-[rgba(44,81,76,0.9)] transition-colors"
              onClick={nextStep}
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              Give Access to Email
            </button>
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
            className="w-[70%] flex flex-col justify-center p-12 h-full"
          >
            <h1 className="text-4xl font-bold text-[rgba(44,81,76,1)] mb-4">
              Connect Your Calendar
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Paste your existing calendar link to sync your availability.
            </p>

            <div className="relative mb-8 w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
                </svg>
              </div>
              <input
                type="text"
                name="calendarLink"
                value={formData.calendarLink}
                onChange={handleInputChange}
                placeholder="Paste your calendar link here"
                className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(44,81,76,1)] focus:border-[rgba(44,81,76,1)]"
              />
            </div>

            <div className="flex gap-4">
              <button
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={prevStep}
              >
                Back
              </button>
              <button
                className="bg-[rgba(44,81,76,1)] text-white py-2 px-6 rounded-lg hover:bg-[rgba(44,81,76,0.9)] transition-colors"
                onClick={nextStep}
              >
                Next
              </button>
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
            className="w-[70%] flex flex-col justify-center p-12 h-full"
          >
            <h1 className="text-4xl font-bold text-[rgba(44,81,76,1)] mb-4">
              Charity Preferences
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Tell us about your charity preferences.
            </p>

            <div className="space-y-6 mb-8 w-full max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="charityCompany"
                  value={formData.charityCompany}
                  onChange={handleInputChange}
                  placeholder="Charity/Company"
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(44,81,76,1)] focus:border-[rgba(44,81,76,1)]"
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" />
                  </svg>
                </div>
                <input
                  type="number"
                  name="minBidDonation"
                  value={formData.minBidDonation}
                  onChange={handleInputChange}
                  placeholder="Minimum Bid Donation ($)"
                  className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(44,81,76,1)] focus:border-[rgba(44,81,76,1)]"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={prevStep}
              >
                Back
              </button>
              <button
                className="bg-[rgba(44,81,76,1)] text-white py-2 px-6 rounded-lg hover:bg-[rgba(44,81,76,0.9)] transition-colors"
                onClick={nextStep}
              >
                Next
              </button>
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
            className="w-[70%] flex flex-col justify-center p-12 h-full"
          >
            <h1 className="text-4xl font-bold text-[rgba(44,81,76,1)] mb-4">
              Almost There!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Answer these final questions to complete your profile.
            </p>

            <div className="space-y-6 mb-8 w-full max-w-lg">
              <div>
                <label className="block text-gray-700 mb-2">
                  What motivates you to participate in charity auctions?
                </label>
                <textarea
                  rows={3}
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(44,81,76,1)] focus:border-[rgba(44,81,76,1)]"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  How did you hear about our platform?
                </label>
                <textarea
                  rows={3}
                  name="howHeard"
                  value={formData.howHeard}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(44,81,76,1)] focus:border-[rgba(44,81,76,1)]"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                className="bg-gray-200 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={prevStep}
              >
                Back
              </button>
              <button
                className="bg-[rgba(44,81,76,1)] text-white py-2 px-6 rounded-lg hover:bg-[rgba(44,81,76,0.9)] transition-colors"
                onClick={() => alert("Signup complete!")}
              >
                Finish
              </button>
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
        return "/signup-image-1.png";
      case 2:
        return "/signup-image-2.png";
      case 3:
        return "/signup-image-3.png";
      case 4:
        return "/signup-image-4.png";
      case 5:
        return "/signup-image-5.png";
      default:
        return "/signup-image-1.png";
    }
  };

  return (
    <div className="flex h-screen bg-[rgb(255,253,240)] overflow-hidden">
      {/* Image Section (30%) - Same for all steps */}
      <motion.div
        key={`image-${currentStep}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-[30%] flex items-center justify-center p-8"
      >
        <img
          src={getImageForStep()}
          alt={`Step ${currentStep}`}
          className="max-w-full max-h-full object-contain"
        />
      </motion.div>

      {/* Content Section (70%) - Changes based on step */}
      <div className="w-[70%] relative overflow-hidden">
        <AnimatePresence custom={direction} initial={false}>
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignupFlow;
