// "use client";
// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
// import { CircleDollarSign, Link, Mail } from "lucide-react";
// import { Label } from "./ui/label";
// import { Textarea } from "./ui/textarea";

// const SignupFlow = () => {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [direction, setDirection] = useState(1);
//   const [formData, setFormData] = useState({
//     calendarLink: "",
//     charityCompany: "",
//     minBidDonation: "",
//     motivation: "",
//     howHeard: "",
//   });

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const nextStep = () => {
//     setDirection(1);
//     setCurrentStep((prev) => Math.min(prev + 1, 5));
//   };

//   const prevStep = () => {
//     setDirection(-1);
//     setCurrentStep((prev) => Math.max(prev - 1, 1));
//   };

//   const variants = {
//     enter: (direction) => ({
//       x: direction > 0 ? 1000 : -1000,
//       opacity: 0,
//     }),
//     center: {
//       x: 0,
//       opacity: 1,
//     },
//     exit: (direction) => ({
//       x: direction > 0 ? -1000 : 1000,
//       opacity: 0,
//     }),
//   };

//   const renderStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <motion.div
//             key="step1"
//             custom={direction}
//             variants={variants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
//             className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-4 sm:px-8"
//           >
//             <div className="w-full max-w-3xl space-y-8 text-start">
//               <h1 className="text-3xl md:text-3xl font-semibold text-[var(--secondary-color)] mb-4 text-center md:text-left">
//                 Continue With LinkedIn
//               </h1>
//               <p className="text-base md:text-lg text-gray-600 mb-8 md:text-left text-justify px-5 md:px-0">
//                 Please attach your LinkedIn profile so your information can be
//                 automatically filled from it.
//               </p>

//               <button
//                 className="w-8/9 md:w-full lg:w-full mx-auto flex items-center justify-center bg-[rgba(44,81,76,1)] text-white border-2 border-[rgba(44,81,76,1)] py-3 px-6 rounded-lg hover:bg-transparent hover:text-[rgba(44,81,76,1)] transition-colors cursor-pointer"
//                 onClick={nextStep}
//               >
//                 <svg
//                   className="w-5 h-5 mr-2"
//                   fill="currentColor"
//                   viewBox="0 0 24 24"
//                   xmlns="http://www.w3.org/2000/svg"
//                 >
//                   <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
//                 </svg>
//                 Continue with LinkedIn
//               </button>
//             </div>
//           </motion.div>
//         );
//       case 2:
//         return (
//           <motion.div
//             key="step2"
//             custom={direction}
//             variants={variants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
//             className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-7 sm:px-8"
//           >
//             <div className="w-full max-w-3xl space-y-8 text-start">
//               <h1 className="text-3xl md:text-3xl font-semibold text-[var(--secondary-color)] mb-4 text-left">
//                 Please add your gmail to continue
//               </h1>

//               <div className="w-full space-y-6 flex flex-col items-start justify-start sm:mr-24">
//                 <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
//                   <Mail className="text-[rgba(44,81,76,1)]" />
//                   <Input
//                     type="email"
//                     placeholder="Email Address"
//                     className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
//                   />
//                 </div>

//                 <Button
//                   onClick={nextStep}
//                   className="w-full cursor-pointer bg-[rgba(44,81,76,1)] border-2 border-[rgba(44,81,76,0.9)] hover:bg-transparent hover:text-[rgba(44,81,76,1)] h-12 text-base sm:text-lg"
//                 >
//                   <svg
//                     className="size-5 mr-1"
//                     fill="currentColor"
//                     viewBox="0 0 24 24"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
//                   </svg>
//                   Give Access to Email
//                 </Button>
//               </div>
//             </div>
//           </motion.div>
//         );
//       case 3:
//         return (
//           <motion.div
//             key="step3"
//             custom={direction}
//             variants={variants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
//             className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-7 sm:px-8"
//           >
//             <div className="w-full max-w-3xl space-y-8 text-start">
//               <h1 className="text-base sm:text-lg font-[500] text-[#413E5E] mb-4">
//                 Submit your pre-existing calendar links
//               </h1>

//               <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
//                 <Link className="text-[rgba(44,81,76,1)]" />
//                 <Input
//                   type="link"
//                   placeholder="Calendar Link"
//                   className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
//                 />
//               </div>

//               <p className="text-gray-600 text-base sm:text-lg underline font-[500]">
//                 Don't have a schedule calendar?
//               </p>

//               <div className="flex justify-between w-full gap-4">
//                 <Button
//                   variant="outline"
//                   onClick={prevStep}
//                   className="h-12 cursor-pointer w-32 md:w-36 text-base sm:text-lg border-gray-300 text-gray-700"
//                 >
//                   Back
//                 </Button>
//                 <Button
//                   onClick={nextStep}
//                   className="h-12 w-32 md:w-44 cursor-pointer text-base sm:text-lg bg-[#2c514c] text-white border-2 border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)]"
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           </motion.div>
//         );
//       case 4:
//         return (
//           <motion.div
//             key="step4"
//             custom={direction}
//             variants={variants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
//             className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-7 sm:px-8"
//           >
//             <div className="w-full max-w-3xl space-y-8">
//               <div className="gap-2 flex flex-col w-full">
//                 <h1 className="text-base sm:text-lg font-[500] text-[var(--secondary-color)]">
//                   Charity Company
//                 </h1>
//                 <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
//                   <Input
//                     type="text"
//                     placeholder="UNICEF"
//                     className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
//                   />
//                 </div>
//               </div>

//               <div className="gap-2 flex flex-col w-full">
//                 <h1 className="text-base sm:text-lg font-[500] text-[var(--secondary-color)]">
//                   Minimum Bid Donation
//                 </h1>
//                 <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
//                   <CircleDollarSign className="text-[rgba(44,81,76,1)]" />
//                   <Input
//                     type="number"
//                     placeholder=""
//                     className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-between w-full gap-4">
//                 <Button
//                   variant="outline"
//                   onClick={prevStep}
//                   className="h-12 w-32 cursor-pointer md:w-36 text-base sm:text-lg border-gray-300 text-gray-700"
//                 >
//                   Back
//                 </Button>
//                 <Button
//                   onClick={nextStep}
//                   className="h-12 w-32 cursor-pointer md:w-44 text-base sm:text-lg bg-[#2c514c] text-white border-2 border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)]"
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           </motion.div>
//         );
//       case 5:
//         return (
//           <motion.div
//             key="step5"
//             custom={direction}
//             variants={variants}
//             initial="enter"
//             animate="center"
//             exit="exit"
//             transition={{ type: "tween", ease: "easeInOut", duration: 0.5 }}
//             className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-7 md:px-8"
//           >
//             <div className="w-full max-w-3xl space-y-8 ">
//               <h1 className="text-3xl md:text-3xl font-semibold text-[var(--secondary-color)] mb-4 text-left">
//                 Survey For Sales Representative
//               </h1>

//               <div className="md:space-y-12 border border-gray-200 rounded-sm p-4 sm:p-6 bg-white">
//                 <section className="space-y-6">
//                   <h2 className="text-xl md:text-2xl font-[500] text-gray-800 mb-3">
//                     Open-Ended Questions
//                   </h2>

//                   <div className="space-y-4 md:space-y-8">
//                     <div className="space-y-2">
//                       <Label className="text-base sm:text-lg font-medium">
//                         Describe your solution and its key features.
//                       </Label>
//                       <Textarea
//                         className="w-full min-h-[100px] resize-none text-base sm:text-lg p-4 focus-visible:ring-0"
//                         placeholder="Enter your response here..."
//                         rows={4}
//                       />
//                     </div>

//                     <div className="space-y-2">
//                       <Label className="text-base sm:text-lg font-medium">
//                         What motivated you to participate in this program?
//                       </Label>
//                       <Textarea
//                         className="w-full min-h-[100px] resize-none text-base sm:text-lg p-4 focus-visible:ring-0"
//                         placeholder="Enter your response here..."
//                         rows={4}
//                       />
//                     </div>
//                   </div>
//                 </section>

//                 <hr className="border-gray-200 my-4 md:my-8" />

//                 <div className="flex justify-between">
//                   <Button
//                     variant="outline"
//                     onClick={prevStep}
//                     className="h-12 w-32 cursor-pointer md:w-36 text-base sm:text-lg px-6 sm:px-8 border-gray-300 text-gray-700"
//                   >
//                     Back
//                   </Button>
//                   <Button
//                     onClick={nextStep}
//                     className="h-12 w-32 cursor-pointer md:w-44 text-base sm:text-lg bg-[#2c514c] text-white border-2 border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)]"
//                   >
//                     Finish
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         );
//       default:
//         return null;
//     }
//   };

//   const getImageForStep = () => {
//     switch (currentStep) {
//       case 1:
//         return "/login-page.svg";
//       case 2:
//         return "/login-page.svg";
//       case 3:
//         return "/login-page-2.svg";
//       case 4:
//         return "/login-page-3.svg";
//       default:
//         return "/login-page.svg";
//     }
//   };

//   return (

//     <div className="flex flex-col lg:flex-row h-screen bg-[rgb(255,253,240)] overflow-hidden">
//   <motion.div
//     key={`image-${currentStep}`}
//     className=" hidden lg:flex items-center justify-center h-screen"
//   >
//     <img
//       src={getImageForStep()}
//       alt={`Step ${currentStep}`}
//       className="max-w-full object-cover shrink-0"
//     />
//   </motion.div>

//   <div className="w-full flex lg:hidden items-center justify-center p-5">
//     <img
//       src="/email-logo.jpg"
//       alt="Logo"
//       className="max-w-full object-contain shrink-0"
//     />
//   </div>

//   <div className="w-full lg:w-[75%] relative h-full">
//     <AnimatePresence custom={direction} initial={false}>
//       {renderStep()}
//     </AnimatePresence>
//   </div>
// </div>

//   );
// };

// export default SignupFlow;

"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { CircleDollarSign, Link, Mail } from "lucide-react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const SignupFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
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
            className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-4 sm:px-8"
          >
            <div className="w-full  lg:max-w-md space-y-8 text-start">
              <h1 className="text-3xl md:text-3xl font-semibold text-[var(--secondary-color)] mb-4 text-center md:text-left">
                Continue With LinkedIn
              </h1>
              <p className="text-base md:text-lg text-gray-600 mb-8 md:text-left text-justify px-5 md:px-0">
                Please attach your LinkedIn profile so your information can be
                automatically filled from it.
              </p>

              <button
                className="w-8/9 md:w-full lg:w-full mx-auto flex items-center justify-center bg-[rgba(44,81,76,1)] text-white border-2 border-[rgba(44,81,76,1)] py-3 px-6 rounded-lg hover:bg-transparent hover:text-[rgba(44,81,76,1)] transition-colors cursor-pointer"
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
            <div className="w-full  lg:max-w-md space-y-8 text-start">
              <h1 className="text-3xl md:text-3xl font-semibold text-[var(--secondary-color)] mb-4 text-left">
                Please add your gmail to continue
              </h1>

              <div className="w-full space-y-6 flex flex-col items-start justify-start sm:mr-24">
                <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                  <Mail className="text-[rgba(44,81,76,1)]" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                  />
                </div>

                <Button
                  onClick={nextStep}
                  className="w-full bg-[rgba(44,81,76,1)] border-2 cursor-pointer border-[rgba(44,81,76,0.9)] hover:bg-transparent hover:text-[rgba(44,81,76,1)] h-12 text-base sm:text-lg"
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
            <div className="w-full  lg:max-w-md space-y-8 text-start">
              <h1 className="text-base sm:text-lg font-[500] text-[#413E5E] mb-4">
                Submit your pre-existing calendar links
              </h1>

              <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                <Link className="text-[rgba(44,81,76,1)]" />
                <Input
                  type="link"
                  placeholder="Calendar Link"
                  className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                />
              </div>

              <p className="text-gray-600 text-base sm:text-lg underline font-[500]">
                Don't have a schedule calendar?
              </p>

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
                  className="h-12 w-32 md:w-44 cursor-pointer text-base sm:text-lg bg-[#2c514c] text-white border-2 border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)]"
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
            <div className="w-full  lg:max-w-md space-y-8">
              <div className="gap-2 flex flex-col w-full">
                <h1 className="text-base sm:text-lg font-[500] text-[var(--secondary-color)]">
                  Charity Company
                </h1>
                <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                  <Input
                    type="text"
                    placeholder="UNICEF"
                    className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                  />
                </div>
              </div>

              <div className="gap-2 flex flex-col w-full">
                <h1 className="text-base sm:text-lg font-[500] text-[var(--secondary-color)]">
                  Minimum Bid Donation
                </h1>
                <div className="flex items-center px-2 gap-2 border-2 rounded-lg w-full bg-white">
                  <CircleDollarSign className="text-[rgba(44,81,76,1)]" />
                  <Input
                    type="number"
                    placeholder=""
                    className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                  />
                </div>
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
                  className="h-12 w-32 md:w-44 cursor-pointer text-base sm:text-lg bg-[#2c514c] text-white border-2 border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)]"
                >
                  Next
                </Button>
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
            className="flex flex-col justify-center items-center w-full mx-auto h-full text-left px-7 md:px-8  overflow-auto "
          >
            <div className="w-full  lg:max-w-md md:space-y-8 lg:space-y-5 ">
              <h1 className="text-3xl md:text-2xl font-semibold text-[var(--secondary-color)] mb-4 text-left">
                Survey For Sales Representative
              </h1>

              <div className="md:space-y-12 lg:space-y-4 border border-gray-200 rounded-sm p-4 md:p-6 lg:p-4 bg-white">
                <section className="space-y-6 lg:space-y-3">
                  <h2 className="text-xl md:text-xl font-[500] text-gray-800 mb-3">
                    Open-Ended Questions
                  </h2>

                  <div className="md:space-y-6 lg:space-y-5">
                    <div className="space-y-2">
                      <Label className="text-base sm:text-lg font-medium">
                        Describe your solution and its key features.
                      </Label>
                      <Textarea
                        className="w-full min-h-[100px] resize-none text-base sm:text-lg p-4 focus-visible:ring-0"
                        placeholder="Enter your response here..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base sm:text-lg font-medium">
                        What motivated you to participate in this program?
                      </Label>
                      <Textarea
                        className="w-full min-h-[100px] resize-none text-base sm:text-lg p-4 focus-visible:ring-0"
                        placeholder="Enter your response here..."
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
                    onClick={nextStep}
                    className="h-12 w-32 md:w-44 text-base sm:text-lg bg-[#2c514c] text-white border-2 border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)] cursor-pointer"
                  >
                    Finish
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
        className=" hidden lg:flex items-center justify-center max-h-screen"
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

      <div className="w-full lg:w-[118%] relative h-full overflow-y-auto">
        <AnimatePresence custom={direction} initial={false}>
          {renderStep()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignupFlow;
