"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Page() {

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 w-full items-center justify-center min-h-[80vh]">
            <div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center gap-6 border-b-2 border-[#2C514C] shadow-[0_8px_30px_rgb(0,0,0,0.10)] max-w-2xl w-full">
                <div className="p-4 bg-[#2C514C]/10 rounded-full">
                    <svg
                        width="60"
                        height="60"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <circle cx="12" cy="12" r="10" fill="#2C514C" opacity="0.1" />
                        <path
                            d="M16 9L10.5 15L8 12.5"
                            stroke="#2C514C"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-[#2C514C] mb-2">
                        {`Congratulations User!`} 🎉
                    </h1>
                    <p className="text-lg text-gray-600">
                        Your form has been submitted successfully.
                    </p>
                </div>
            </div>
        </div>
    );
}