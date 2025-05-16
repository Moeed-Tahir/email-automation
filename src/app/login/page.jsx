"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from "../../components/ui/input";
import { Button } from '../../components/ui/button';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Label } from '../../components/ui/label';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    otp: ''
  });
  const router = useRouter();

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  const validateOtp = () => {
    if (!otp.trim()) {
      setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
      return false;
    }
    if (otp.length !== 6) {
      setErrors(prev => ({ ...prev, otp: 'OTP must be 6 digits' }));
      return false;
    }
    setErrors(prev => ({ ...prev, otp: '' }));
    return true;
  };

  const handleSendOtp = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/routes/ProfileInfo?action=sendOTP', {
        email,
      });

      if (!response.data.success) {
        throw new Error(response.data?.message || 'Failed to send OTP');
      }

      setIsOtpSent(true);
    } catch (error) {
      console.log("error",error)
      setErrors(prev => ({ ...prev, email: error.response?.data?.message || 'Error sending OTP' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!validateEmail() || !validateOtp()) return;

    setIsLoading(true);
    try {
      const response = await axios.post('/api/routes/ProfileInfo?action=verifyOTP', {
        email,
        otp,
      });

      if (!response.data.success) {
        throw new Error(response.data?.message || 'Failed to verify OTP');
      }


      if (response.data.user) {
        const { userEmail, userName, userPhoto, token, charityCompany, userId } = response.data.user;

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
        Cookies.set("token", response.data.token, {
          path: "/",
          expires: 7,
        });
        Cookies.set("userId", userId, {
          path: "/",
          expires: 7,
        });
        if (charityCompany) {
          Cookies.set("charityCompany", charityCompany, {
            path: "/",
            expires: 7,
          });
        }

        router.push(`/${userId}/dashboard`);
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, otp: error.response?.data?.message || 'Error verifying OTP' }));
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
            <p className="text-gray-600">Enter your details to login to your account</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <div className="flex items-center px-3 gap-2 border-2 rounded-lg w-full bg-white">
                <Mail className="text-[rgba(44,81,76,1)] size-5" />
                <Input
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
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">OTP</Label>
                <div className="flex items-center px-3 gap-2 border-2 rounded-lg w-full bg-white">
                  <Lock className="text-[rgba(44,81,76,1)] size-5" />
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    className="border-none focus-visible:ring-0 shadow-none text-base sm:text-lg py-4 sm:py-6"
                    maxLength={6}
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-500 text-sm">{errors.otp}</p>
                )}
                <div className="text-right">
                  <button
                    className="text-sm text-[#2c514c] hover:underline"
                    onClick={() => {
                      setIsOtpSent(false);
                      setOtp('');
                    }}
                  >
                    Change Email
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {!isOtpSent ? (
                <Button
                  onClick={handleSendOtp}
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-[#2c514c] text-white cursor-pointer border-2 
                  border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)]"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Send OTP'
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full h-12 text-lg bg-[#2c514c] text-white cursor-pointer border-2 
                  border-[rgba(44,81,76,1)] hover:bg-transparent hover:text-[rgba(44,81,76,1)]"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Login'
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#2c514c] font-medium hover:underline">
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