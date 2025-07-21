"use client";
export default function Page() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 w-full items-center justify-center h-screen">
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
                    <h1 className="text-2xl font-semibold text-[#2C514C] mb-4">
                        Request Submitted!
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">
                        Thank you for taking the time to thoughtfully complete your request.
                    </p>
                    
                    <div className=" space-y-4 text-gray-700">
                        <p>
                            Your meeting request has been sent for review. If they decide to accept, 
                            you'll receive an email with a link to schedule the meeting. Your pledged 
                            donation will only be processed after the meeting takes place.
                        </p>
                        
                        <p>
                            We appreciate you making your outreach purposeful—and turning your pitch 
                            into real-world impact.
                        </p>
                        
                        <p className="font-medium text-[#2C514C]">
                            Thank you!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}