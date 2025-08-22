"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { Label } from "../../components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({
    email: "",
    otp: "",
  });
  const otpInputRefs = useRef([]);
  const router = useRouter();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email" }));
      return false;
    }
    setErrors((prev) => ({ ...prev, email: "" }));
    return true;
  };

  const validateOtp = () => {
    const otpString = otp.join("");
    if (!otpString.trim()) {
      setErrors((prev) => ({ ...prev, otp: "OTP is required" }));
      return false;
    }
    if (otpString.length !== 6) {
      setErrors((prev) => ({
        ...prev,
        otp: "Please enter complete 6-digit OTP",
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, otp: "" }));
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/routes/ProfileInfo?action=sendOTP",
        {
          email,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data?.message || "Failed to send OTP");
      }

      setIsOtpSent(true);
      setCountdown(30);
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email: error.response?.data?.message || "Error sending OTP",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/routes/ProfileInfo?action=sendOTP",
        {
          email,
        }
      );

      if (!response.data.success) {
        throw new Error(response.data?.message || "Failed to resend OTP");
      }

      setCountdown(30);
      setOtp(["", "", "", "", "", ""]);
      if (otpInputRefs.current[0]) {
        otpInputRefs.current[0].focus();
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        email: error.response?.data?.message || "Error resending OTP",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Handle paste operation
    if (value.length > 1) {
      const pastedOtp = value.split("").slice(0, 6);
      const newOtp = [...otp];

      pastedOtp.forEach((digit, i) => {
        if (i < 6 && /^\d$/.test(digit)) {
          newOtp[i] = digit;
        }
      });

      setOtp(newOtp);

      const lastFilledIndex = newOtp.findIndex((d) => d === "");
      const focusIndex =
        lastFilledIndex === -1 ? 5 : Math.min(lastFilledIndex - 1, 5);
      if (otpInputRefs.current[focusIndex]) {
        otpInputRefs.current[focusIndex].focus();
      }
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (
      e.key === "ArrowRight" &&
      index < 5 &&
      otpInputRefs.current[index + 1]
    ) {
      otpInputRefs.current[index + 1].focus();
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
      e.preventDefault();
    }

    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
        e.preventDefault();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleLogin = async () => {
    if (!validateEmail() || !validateOtp()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(
        "/api/routes/ProfileInfo?action=verifyOTP",
        {
          email,
          otp: otp.join(""),
        }
      );

      if (!response.data.success) {
        throw new Error(response.data?.message || "Failed to verify OTP");
      }

      if (response.data.user) {
        const {
          userEmail,
          userName,
          userPhoto,
          userId,
        } = response.data.user;
        const token = response.data.token;
        const charityCompany = response.data.user.charityCompany;

        Cookies.set("userEmail", userEmail, {
          path: "/",
          expires: 7,
        });
        Cookies.set("userName", userName, {
          path: "/",
          expires: 7,
        });
        if (userPhoto) {
          Cookies.set("userPhoto", userPhoto, {
            path: "/",
            expires: 7,
          });
        }
        Cookies.set("Token", token, {
          path: "/",
          expires: 7,
        });
        Cookies.set("UserId", userId, {
          path: "/",
          expires: 7,
        });
        if (charityCompany) {
          Cookies.set("charityCompany", charityCompany, {
            path: "/",
            expires: 7,
          });
        }

        // console.log("Login successful:", {
        //   userEmail,
        //   userName,
        //   userPhoto,
        //   token,
        //   charityCompany,
        //   userId,
        // });
        router.push(`/${userId}/dashboard`);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        otp: error.response?.data?.message || "Error verifying OTP",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[rgb(255,253,240)] overflow-hidden">
      {/* Left side - Image (hidden on mobile) */}
      <motion.div
        className="hidden lg:flex items-center justify-center max-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src="/login-page.svg"
          alt="Login illustration"
          className="max-w-full min-h-screen object-cover shrink-0"
        />
      </motion.div>

      {/* Mobile logo */}
      <div className="w-full flex lg:hidden items-center justify-center p-5">
        <img
          src="/email-logo.jpg"
          alt="Logo"
          className="max-w-full object-contain shrink-0"
        />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-[118%] flex items-center justify-center p-7 sm:px-8">
        <motion.div
          className="w-full lg:max-w-md space-y-8"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl md:text-[40px] font-semibold text-[var(--secondary-color)] mb-2 leading-[51px]">
              Welcome Back
            </h1>
            <p className="text-gray-600">
              Enter your details to login to your account
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <div className="flex items-center px-3 gap-2 border-2 rounded-lg w-full bg-white">
                <Mail className="text-[rgba(44,81,76,1)] size-5" />
                <Input
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="Enter your email"
                  className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                  disabled={isOtpSent}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            {isOtpSent && (
              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">OTP</Label>
                <div className="flex justify-between gap-2">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      ref={(el) => (otpInputRefs.current[index] = el)}
                      value={otp[index]}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pastedData =
                          e.clipboardData.getData("text/plain");
                        handleOtpChange(0, pastedData);
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      aria-label={`OTP digit ${index + 1}`}
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl border-2 border-[rgba(44,81,76,0.5)] rounded-lg focus:border-[rgba(44,81,76,1)] focus-visible:ring-0 hover:border-[rgba(44,81,76,0.8)] transition-colors"
                    />
                  ))}
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-sm">{errors.otp}</p>
                )}
                <div className="flex justify-between items-center pt-2">
                  <button
                    className="text-sm text-[#2c514c] hover:underline focus:outline-none"
                    onClick={() => {
                      setIsOtpSent(false);
                      setOtp(["", "", "", "", "", ""]);
                    }}
                  >
                    Change Email
                  </button>
                  {countdown > 0 ? (
                    <span className="text-sm text-gray-500">
                      Resend code in {countdown}s
                    </span>
                  ) : (
                    <button
                      className="text-sm text-[#2c514c] hover:underline focus:outline-none"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin inline" />
                      ) : (
                        "Resend Code"
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              {!isOtpSent ? (
                <Button
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-[#2c514c] text-white cursor-pointer border-2 
                  border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)] transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-[#2c514c] text-white cursor-pointer border-2 
                  border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)] transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Login"
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="text-center pt-4">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[#2c514c] font-medium hover:underline focus:outline-none"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
