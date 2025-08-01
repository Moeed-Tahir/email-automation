import React from 'react'
import { Button } from "@/components/ui/button";
import Link from "next/link";

const NavigatePopup = () => {
    return (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg border-b-2 border-[#2C514C]">
                <div className="text-center">
                    <div className="p-4 bg-[#2C514C]/10 rounded-full inline-block mb-4">
                        <svg
                            width="60"
                            height="60"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="12" cy="12" r="10" fill="#2C514C" opacity="0.1" />
                            <path
                                d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                                stroke="#2C514C"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-semibold text-[#2C514C] mb-4">
                        Email Already Exists
                    </h2>
                    <p className="text-gray-600 mb-6">
                        The email you're trying to use is already registered. Please login instead.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link href="/login" passHref>
                            <Button className="bg-[#2C514C] hover:bg-[#1f3a36] text-white">
                                Go to Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NavigatePopup