"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export default function MeetingRequest() {
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("surveyId");
  const [surveyData, setSurveyData] = useState(null);
  const [userQuestions, setUserQuestions] = useState({
    questionOne: "",
    questionTwo: "",
  });
  const userId = Cookies.get("UserId") || null;
  console.log("userId", userId);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`/api/routes/ProfileInfo`, {
          params: { userId, action: "getProfileInfo" },
        });

        setUserQuestions({
          questionOne: response.data.user.questionSolution || "",
          questionTwo: response.data.user.howHeard || "",
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    if (userId) {
      fetchProfileData();
    }
  }, [userId]);

  useEffect(() => {
    const fetchSurveyData = async () => {
      if (surveyId) {
        try {
          const response = await axios.post(
            `/api/routes/SurvayForm?action=fetchSurvayDataAgainstObjectId`,
            {
              surveyId: surveyId,
            }
          );

          if (response.data.success) {
            setSurveyData(response.data.data || null);
          } else {
            console.error(
              "Failed to fetch survey data:",
              response.data.message
            );
          }
        } catch (error) {
          console.error("Error fetching survey data:", error);
        }
      }
    };

    fetchSurveyData();
  }, [surveyId]);

  if (!surveyData) {
    return <div>Loading...</div>;
  }

  const businessProblems = [
    "Reducing operational costs",
    "Increasing revenue",
    "Enhancing customer experience",
    "Improving productivity/efficiency",
    "Regulatory compliance",
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-light">
            <span>Dear </span>
            <span className="text-[#2C514C] font-medium">
              <strong>{Cookies.get("userName")}</strong>
            </span>
          </CardTitle>
          <CardDescription className="text-xl">
            You have received a meeting request from {surveyData.name}, who is
            interested in connecting with you. Please review the details below
            and choose to accept or decline the request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xl">
          <div>
            <p className="font-medium">Sales Rep Details:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Name: {surveyData.name}</li>
              <li>Email: {surveyData.email}</li>
              <li>
                Proposed Donation: <strong>${surveyData.bidAmount}</strong>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Survey Form */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl">Survey From Sales Rep</CardTitle>
          </div>
          <Button
            variant="default"
            className="bg-[#2C514C] hover:bg-transparent cursor-pointer border-2 border-[#2C514C] text-white hover:text-[#2C514C]"
          >
            {`Survey Score ${surveyData.totalScore}`}
          </Button>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Open-Ended Questions */}
          <div>
            <h3 className="text-[23px] font-semibold mb-2">
              Open-Ended Questions
            </h3>
            <div className="grid gap-6">
              <div>
                <Label>{userQuestions.questionOne}</Label>
                <Textarea
                  placeholder="Describe your solution..."
                  className="mt-2"
                  value={surveyData.questionOneSolution}
                  readOnly
                />
              </div>
              <div>
                <Label>{userQuestions.questionTwo}</Label>
                <Textarea
                  placeholder="Describe key features..."
                  className="mt-2"
                  value={surveyData.questionTwoSolution}
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Closed-Ended Questions */}
          <div className="pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">
              Closed-Ended Questions
            </h3>
            <div className="grid gap-6">
              {/* Specific Business Problem */}
              <div>
                <Label>
                  What specific business problem does your solution address?
                </Label>
                <div className="flex flex-col gap-2 mt-2">
                  {businessProblems.map((problem, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Checkbox
                        id={`problem-${index}`}
                        checked={surveyData.businessProblems?.includes(problem)}
                        disabled
                      />
                      <Label
                        htmlFor={`problem-${index}`}
                        className="text-gray-500"
                      >
                        {problem}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time to See Results */}
              <div>
                <Label>
                  How long does it typically take for clients to see results
                  with your solution?
                </Label>
                <RadioGroup
                  className="mt-2"
                  value={surveyData.resultsTimeframe}
                >
                  {[
                    "Over 12 months",
                    "6-12 months",
                    "3-6 months",
                    "1-3 months",
                    "Immediate",
                  ].map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={time}
                        id={`time-${index}`}
                        disabled
                      />
                      <Label
                        htmlFor={`time-${index}`}
                        className="text-gray-500"
                      >
                        {time}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Case Studies */}
              <div>
                <Label>
                  Do you have proven results or case studies in my industry that
                  you would be willing to provide?
                </Label>
                <RadioGroup className="mt-2" value={surveyData.caseStudies}>
                  {[
                    "No case studies available",
                    "One relevant case study",
                    "Multiple relevant case studies",
                  ].map((study, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={study}
                        id={`study-${index}`}
                        disabled
                      />
                      <Label
                        htmlFor={`study-${index}`}
                        className="text-gray-500"
                      >
                        {study}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Offering Summary */}
              <div>
                <Label>How would you summarize your offering?</Label>
                <RadioGroup className="mt-2" value={surveyData.offeringType}>
                  {[
                    "Product",
                    "Service",
                    "Consulting/Advisory",
                    "Comprehensive Solution",
                  ].map((offer, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={offer}
                        id={`offer-${index}`}
                        disabled
                      />
                      <Label
                        htmlFor={`offer-${index}`}
                        className="text-gray-500"
                      >
                        {offer}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Performance Guarantee */}
              <div>
                <Label>
                  Are you willing to offer a performance-based guarantee or
                  proof of concept?
                </Label>
                <RadioGroup
                  className="mt-2"
                  value={surveyData.performanceGuarantee}
                >
                  {[
                    "No",
                    "Yes, but with conditions",
                    "Yes, unconditionally",
                  ].map((guarantee, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={guarantee}
                        id={`guarantee-${index}`}
                        disabled
                      />
                      <Label
                        htmlFor={`guarantee-${index}`}
                        className="text-gray-500"
                      >
                        {guarantee}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Donation Willingness */}
              <div>
                <Label>
                  Are you willing to make a donation to my favorite charity if a
                  meeting is accepted?
                </Label>
                <RadioGroup className="mt-2" value={surveyData.DonationWilling}>
                  {["Yes", "No"].map((donation, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={donation}
                        id={`donation-${index}`}
                        disabled
                      />
                      <Label
                        htmlFor={`donation-${index}`}
                        className="text-gray-500"
                      >
                        {donation}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Escrow Willingness */}
              <div>
                <Label>
                  Would you be willing to escrow this donation amount to be
                  released after the meeting takes place?
                </Label>
                <RadioGroup className="mt-2" value={surveyData.escrowDonation}>
                  {["Yes", "No"].map((escrow, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={escrow}
                        id={`escrow-${index}`}
                        disabled
                      />
                      <Label
                        htmlFor={`escrow-${index}`}
                        className="text-gray-500"
                      >
                        {escrow}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Donation Amount */}
              <div>
                <Label>How much would you be willing to donate?</Label>
                <RadioGroup className="mt-2" value={surveyData.charityDonation}>
                  {[
                    "$10-$50",
                    "$51-$100",
                    "$101-$200",
                    "$201-$300",
                    "$301-$500",
                    "Over $500",
                  ].map((amount, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={amount}
                        id={`amount-${index}`}
                        disabled
                      />
                      <Label
                        htmlFor={`amount-${index}`}
                        className="text-gray-500"
                      >
                        {amount}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
