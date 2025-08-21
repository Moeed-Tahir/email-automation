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
  console.log("surveyData", surveyData);

  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    survey: null,
    actionType: null,
  });
  const userId = Cookies.get("UserId") || null;

  // Function to calculate the score for each question
  const calculateQuestionScore = (question) => {
    if (!question || !question.options) return 0;
    
    // Find the selected option
    const selectedOption = question.options.find(option => option.isSelected);
    if (!selectedOption) return 0;
    
    // Multiply option score with question score and normalize to be under 10
    const rawScore = (selectedOption.score * question.questionScore) / 10;
    
    // Ensure the score doesn't exceed 10
    return Math.min(rawScore, 10);
  };

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

  const handleConfirmAction = async () => {
    const { survey, actionType } = confirmationDialog;
    if (!survey) return;

    setActionLoading({ id: survey._id, type: actionType });
    try {
      const fromEmail = Cookies.get("userEmail");
      const userName = Cookies.get("userName");
      const mainUserId = Cookies.get("UserId");
      const charityCompany = Cookies.get("charityCompany");

      if (!fromEmail) {
        throw new Error("User email not found in cookies");
      }

      if (actionType === 'accept') {
        const response = await axios.post(
          "/api/routes/Google?action=sendAcceptEmailToAdmin",
          {
            sendFromEmail: fromEmail,
            sendToEmail: survey.email,
            dashboardUserId: survey.userId,
            mainUserId: mainUserId,
            objectId: survey._id,
            bidAmount: survey.bidAmount,
            name: survey.name,
            surveyId: survey._id,
            userName: userName,
            charityCompany: charityCompany,
            location: `${survey.city}, ${survey.state}, ${survey.country}`,
            jobTitle: survey.jobTitle,
            companyName: survey.company,
          }
        );

        if (!response.data.message) {
          throw new Error(response.data.message || "Failed to send acceptance email");
        }
      } else if (actionType === 'reject') {
        const response = await axios.post(
          "/api/routes/Google?action=sendRejectEmailToAdmin",
          {
            sendFromEmail: fromEmail,
            sendToEmail: survey.email,
            objectId: survey._id,
            userName: userName
          }
        );

        if (!response.data.message) {
          throw new Error(response.data.message || "Failed to send rejection email");
        }
      }

      setSurveyData(prev => ({
        ...prev,
        status: actionType === 'accept' ? 'Accepted' : 'Rejected'
      }));
    } catch (error) {
      console.error(`Error in ${actionType} action:`, error);
    } finally {
      setActionLoading({ id: null, type: null });
      closeConfirmationDialog();
    }
  };

  const openConfirmationDialog = (survey, actionType) => {
    setConfirmationDialog({
      open: true,
      survey,
      actionType
    });
  };

  const closeConfirmationDialog = () => {
    setConfirmationDialog({
      open: false,
      survey: null,
      actionType: null
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Accept': 'bg-green-100 text-green-800',
      'Accepted': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Donated': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };

    const statusClass = statusMap[status] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusClass}`}>
        {status}
      </span>
    );
  };

  if (!surveyData) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto flex justify-center items-center h-64">
        <div className="text-lg font-medium">Loading survey data...</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 max-w-7xl mx-auto">
      {/* Request Card */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
          <div className="space-y-2">
            <CardTitle className="text-xl font-light">
              <span>Dear </span>
              <span className="text-[#2C514C] font-medium">
                <strong>{Cookies.get("userName")}</strong>
              </span>
            </CardTitle>
            <CardDescription className="text-base">
              You have received a meeting request from {surveyData.name}, who is
              interested in connecting with you. Please review the details below
              and choose to accept or decline the request.
            </CardDescription>
          </div>
          {surveyData.status === 'Accepted' || surveyData.status === 'Rejected' || surveyData.status === 'Donated' ? (
            <div>
              {getStatusBadge(surveyData.status)}
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              <Button
                variant="outline"
                className="bg-red-500 text-white hover:bg-red-600 min-w-[100px]"
                onClick={() => openConfirmationDialog(surveyData, 'reject')}
                disabled={actionLoading.id === surveyData._id && actionLoading.type === 'reject'}
              >
                {actionLoading.id === surveyData._id && actionLoading.type === 'reject' ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                className="bg-[#2C514C] hover:bg-[#1a3835] min-w-[100px]"
                onClick={() => openConfirmationDialog(surveyData, 'accept')}
                disabled={actionLoading.id === surveyData._id && actionLoading.type === 'accept'}
              >
                {actionLoading.id === surveyData._id && actionLoading.type === 'accept' ? 'Processing...' : 'Accept'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Respondent Details */}
            <div className="space-y-4">
              <p className="font-medium text-lg">Respondent Details:</p>
              <ul className="space-y-3">
                <li className="break-words"><strong>Name:</strong> {surveyData.name || "Not provided"}</li>
                <li className="break-words"><strong>Job Title:</strong> {surveyData.jobTitle || "Not provided"}</li>
                <li className="break-words"><strong>Company:</strong> {surveyData.company || "Not provided"}</li>
                <li className="break-words">
                  <strong>Location:</strong> {[surveyData.city, surveyData.state, surveyData.country].filter(Boolean).join(', ') || "Not provided"}
                </li>
                <li className="break-words"><strong>Email:</strong> {surveyData.email || "Not provided"}</li>
                <li className="break-words"><strong>Phone:</strong> {surveyData.phoneNumber || "Not provided"}</li>
              </ul>
            </div>

            {/* Donation Details */}
            <div className="space-y-4">
              <p className="font-medium text-lg">Donation Details:</p>
              <ul className="space-y-3">
                <li className="break-words">
                  <strong>Proposed Donation:</strong>
                  <span className="ml-2 font-bold text-[#2C514C]">
                    {surveyData.bidAmount ? `$${surveyData.bidAmount}` : "Not specified"}
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <strong>Donation Status:</strong>
                  {getStatusBadge(surveyData.donationStatus || "Not specified")}
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Survey Responses Card */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
          <div>
            <CardTitle className="text-xl font-medium">Survey Responses</CardTitle>
          </div>
          <div className="bg-[#2C514C] border-2 border-[#2C514C] text-white px-4 py-2 rounded-lg text-center text-base font-medium">
            {`Survey Score: ${surveyData.totalScore || "0"}`}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 p-6">
          {/* Open-Ended Questions Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-medium">
              Open-Ended Questions
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Describe your solution and its key features.</Label>
                <div className="mt-2 p-4 border rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap break-words">
                  {surveyData.questionOneSolution || "No response provided"}
                </div>
              </div>
              
              <div>
                <Label className="text-base font-medium">Give a brief description of your solution.</Label>
                <div className="mt-2 p-4 border rounded-md bg-gray-50 min-h-[100px] whitespace-pre-wrap break-words">
                  {surveyData.questionTwoSolution || "No response provided"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t space-y-6">
            <h3 className="text-xl font-medium">
              Closed-Ended Questions
            </h3>
            
            <div className="space-y-8">
              {surveyData.closeEndedQuestions?.map((question, qIndex) => {
                const questionTitles = [
                  "Business Challenge Focus",
                  "Solution Type",
                  "Industry Experience",
                  "Proof of Success",
                  "Customer Segment",
                  "Sales Timing",
                  "Familiarity with Executive's Space",
                  "Donation Escrow Preference"
                ];
                
                // Calculate the score for this question
                const calculatedScore = calculateQuestionScore(question);

                return (
                  <div key={qIndex} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium text-[#2C514C]">
                        {qIndex + 1}. {questionTitles[qIndex]}
                      </h4>
                      <div className="text-sm font-medium text-[#2C514C]">
                        Score: {calculatedScore.toFixed(1)}
                      </div>
                    </div>
                    <Label className="text-base">{question.questionText}</Label>
                    
                    <div className="space-y-3 ml-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-start gap-3">
                          <Checkbox
                            id={`question-${qIndex}-option-${oIndex}`}
                            checked={option.isSelected}
                            disabled
                            className="mt-1"
                          />
                          <Label
                            htmlFor={`question-${qIndex}-option-${oIndex}`}
                            className={`${option.isSelected ? 'font-medium' : 'text-gray-600'} break-words`}
                          >
                            {option.text} 
                            {option.isSelected && (
                              <span className="text-[#2C514C] ml-2">
                                (Option: {option.score}, Question: {question.questionScore})
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                      
                      {question.isOther && question.originalAnswer && (
                        <div className="mt-3 ml-7">
                          <Label className="text-gray-600">Other Answer:</Label>
                          <div className="mt-1 p-3 border rounded-md bg-gray-50 whitespace-pre-wrap break-words">
                            {question.originalAnswer}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {confirmationDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              Confirm {confirmationDialog.actionType === 'accept' ? 'Acceptance' : 'Rejection'}
            </h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to {confirmationDialog.actionType} this meeting request?
              {confirmationDialog.actionType === 'accept' && ' A donation will be expected if the meeting occurs.'}
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={closeConfirmationDialog}
                className="min-w-[80px]"
              >
                Cancel
              </Button>
              <Button
                className={`min-w-[80px] ${confirmationDialog.actionType === 'accept' ? 'bg-[#2C514C] hover:bg-[#1a3835]' : 'bg-red-500 hover:bg-red-600'}`}
                onClick={handleConfirmAction}
                disabled={actionLoading.id === confirmationDialog.survey?._id}
              >
                {actionLoading.id === confirmationDialog.survey?._id ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}