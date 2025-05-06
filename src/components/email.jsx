import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ConfirmationPage() {
  return (
    <div className="min-h-fit flex flex-col items-center py-12 px-8 max-w-2xl mx-auto bg-[#F2F5F8]">
      {/* Logo */}
      <div className="mb-8 flex items-start justify-start w-full">
        <img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project//Logo%20(6).png" alt="Logo" className="h-10" />
      </div>

      {/* Card */}
      <Card className="w-full max-w-2xl rounded-sm">
        <CardContent className="p-8 space-y-6">
          {/* Heading */}
          <h1 className="text-xl font-semibold text-gray-800 border-b border-dotted pb-2">
            Meeting Confirmed with Micheal
          </h1>

          {/* Message */}
          <div className="text-gray-700 space-y-4 text-[16px] font-[400] leading-relaxed">
            <p>
              Dear <span className="font-bold">John</span>,
            </p>
            <p>
              Great news! Micheal has accepted your meeting request. You can now
              schedule your meeting using the link below:
            </p>
            <p>
              Please complete your donation to [Executive's Selected Charity] as
              per the agreed amount of <span className="font-bold">$100</span>.
            </p>

            {/* Business Executive Details */}
            <div className="bg-gray-100 p-4 rounded-md space-y-2">
              <div className="flex items-center space-x-2">
                <span>📌</span>
                <span className="">Business Executive Details:</span>
              </div>
              <ul className="list-disc list-inside pl-4">
                <li>
                  <span className="">Name:</span> John
                </li>
                <li>
                  <span className="">Company:</span> Company Abc
                </li>
                <li>
                  <span className="">Proposed Donation:</span>{" "}
                  <strong>$100</strong>
                </li>
              </ul>
            </div>

            {/* Closing */}
            <p>
              Thank you for your generosity and participation!
              <br />
              Best,
            </p>
            <p>[Email-Automation] Team</p>
          </div>

          {/* Button */}
          <div className="pt-4">
            <Button className="bg-[#2C514C] hover:text-[#2C514C] hover:bg-transparent border-2 border-[#2C514C] cursor-pointer">
              Complete Your Donation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between w-full max-w-2xl mt-8 text-gray-500 text-xs px-4">
        <img src="https://rixdrbokebnvidwyzvzo.supabase.co/storage/v1/object/public/new-project//Logo%20(6).png" alt="Footer Logo" className="h-6" />
        <div className="flex space-x-4">
          <a href="#">
            <img src="/twitter.svg" alt="Twitter" className="h-5" />
          </a>
          <a href="#">
            <img src="/facebook.svg" alt="Facebook" className="h-5" />
          </a>
          <a href="#">
            <img src="/linkedin.svg" alt="LinkedIn" className="h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
