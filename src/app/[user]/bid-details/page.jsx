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
  const [actionLoading, setActionLoading] = useState({ id: null, type: null });
  const [confirmationDialog, setConfirmationDialog] = useState({
    open: false,
    survey: null,
    actionType: null,
  });
  const userId = Cookies.get("UserId") || null;

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
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
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
          </div>
          {surveyData.status === 'Accepted' || surveyData.status === 'Rejected' || surveyData.status === 'Donated' ? (
            <div>
              {getStatusBadge(surveyData.status)}
            </div>
          ) : (
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => openConfirmationDialog(surveyData, 'reject')}
                disabled={actionLoading.id === surveyData._id && actionLoading.type === 'reject'}
              >
                {actionLoading.id === surveyData._id && actionLoading.type === 'reject' ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                className="bg-[#2C514C] hover:bg-[#1a3835]"
                onClick={() => openConfirmationDialog(surveyData, 'accept')}
                disabled={actionLoading.id === surveyData._id && actionLoading.type === 'accept'}
              >
                {actionLoading.id === surveyData._id && actionLoading.type === 'accept' ? 'Processing...' : 'Accept'}
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6 text-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium mb-2">Respondent Details:</p>
              <ul className="space-y-2">
                <li><strong>Name:</strong> {surveyData.name}</li>
                <li><strong>Job Title:</strong> {surveyData.jobTitle}</li>
                <li><strong>Company:</strong> {surveyData.company}</li>
                <li><strong>Location:</strong> {surveyData.city}, {surveyData.state}, {surveyData.country}</li>
                <li><strong>Email:</strong> {surveyData.email}</li>
                <li><strong>Phone:</strong> {surveyData.phoneNumber}</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Donation Details:</p>
              <ul className="space-y-2">
                <li>
                  <strong>Proposed Donation:</strong>
                  <span className="ml-2 font-bold text-[#2C514C]">${surveyData.bidAmount}</span>
                </li>
                <li>
                  <strong>Donation Status:</strong>
                  <span className="ml-2">
                    {getStatusBadge(surveyData.escrowDonation === "true" ? "Escrowed" : surveyData.DonationWilling === "true" ? "Pending" : "Not Willing")}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-[23px] font-medium mb-2">Survey Responses</CardTitle>
          </div>
          <div
            variant="default"
            className="bg-[#2C514C] border-2 border-[#2C514C] text-white px-3 py-1.5 rounded-lg text-center text-[16px]"
          >
            {`Survey Score: ${surveyData.totalScore}`}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Open-Ended Questions */}
          <div>
            <h3 className="text-[23px] font-medium mb-2">
              Open-Ended Questions
            </h3>
            <div className="grid gap-6">
              <div>
                <Label>Describe your solution and its key features.</Label>
                <Textarea
                  placeholder="Describe your solution..."
                  className="mt-2"
                  value={surveyData.questionOneSolution}
                  readOnly
                />
              </div>
              <div>
                <Label>Give a brief description of your solution.</Label>
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
            <h3 className="text-[23px] font-medium mb-2">
              Closed-Ended Questions
            </h3>
            <div className="grid gap-6">
              {surveyData.closeEndedQuestions?.map((question, qIndex) => {
                // Define the sequence titles
                const questionTitles = [
                  "1. Business Challenge Focus",
                  "2. Solution Type",
                  "3. Industry Experience",
                  "4. Proof of Success",
                  "5. Customer Segment",
                  "6. Sales Timing",
                  "7. Familiarity with Executive's Space",
                  "8. Donation Escrow Preference"
                ];

                return (
                  <div key={qIndex} className="space-y-2">
                    {/* Add the sequence title above each question */}
                    <h4 className="text-lg font-medium text-[#2C514C]">
                      {questionTitles[qIndex]}
                    </h4>
                    <Label>{question.questionText}</Label>
                    <div className="space-y-3">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          {option.isSelected ? (
                            <>
                              <Checkbox
                                id={`question-${qIndex}-option-${oIndex}`}
                                checked={true}
                                disabled
                              />
                              <Label
                                htmlFor={`question-${qIndex}-option-${oIndex}`}
                                className={`${option.isSelected ? 'font-medium' : 'text-gray-500'}`}
                              >
                                {option.text} {option.isSelected && `(Score: ${question.score})`}
                              </Label>
                            </>
                          ) : (
                            <>
                              <Checkbox
                                id={`question-${qIndex}-option-${oIndex}`}
                                checked={false}
                                disabled
                              />
                              <Label
                                htmlFor={`question-${qIndex}-option-${oIndex}`}
                                className="text-gray-500"
                              >
                                {option.text}
                              </Label>
                            </>
                          )}
                        </div>
                      ))}
                      {question.isOther && (
                        <div className="mt-2">
                          <Label>Other Answer:</Label>
                          <Textarea
                            className="mt-1"
                            value={question.originalAnswer}
                            readOnly
                          />
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

      {confirmationDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">
              Confirm {confirmationDialog.actionType === 'accept' ? 'Acceptance' : 'Rejection'}
            </h3>
            <p className="mb-6">
              Are you sure you want to {confirmationDialog.actionType} this meeting request?
              {confirmationDialog.actionType === 'accept' && ' A donation will be expected if the meeting occurs.'}
            </p>
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={closeConfirmationDialog}
              >
                Cancel
              </Button>
              <Button
                className={confirmationDialog.actionType === 'accept' ? 'bg-[#2C514C] hover:bg-[#1a3835]' : 'bg-red-500 hover:bg-red-600'}
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