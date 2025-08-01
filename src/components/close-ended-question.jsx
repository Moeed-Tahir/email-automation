"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const CloseEndedQuestionsPage = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        questionText: "",
        options: [{ text: "", score: 0 }]
    });
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const userId = Cookies.get("UserId");

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

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setLoading(true);
                const response = await axios.post("/api/routes/ProfileInfo?action=getCloseEndedQuestion", {
                    userId
                });
                setQuestions(response.data.closeEndedQuestions || []);
            } catch (err) {
                setError("Failed to fetch questions");
                console.error("Error fetching questions:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchQuestions();
        }
    }, [userId]);

    const handleAddOption = () => {
        setNewQuestion({
            ...newQuestion,
            options: [...newQuestion.options, { text: "", score: 0 }]
        });
    };

    const handleOptionChange = (index, field, value) => {
        const updatedOptions = [...newQuestion.options];
        updatedOptions[index][field] = field === "score" ? Number(value) : value;
        setNewQuestion({
            ...newQuestion,
            options: updatedOptions
        });
    };

    const removeOption = (index) => {
        const updatedOptions = [...newQuestion.options];
        updatedOptions.splice(index, 1);
        setNewQuestion({
            ...newQuestion,
            options: updatedOptions
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!newQuestion.questionText.trim()) {
            setError("Question text is required");
            return;
        }

        if (newQuestion.options.length < 2) {
            setError("At least two options are required");
            return;
        }

        for (const option of newQuestion.options) {
            if (!option.text.trim() || option.score === undefined) {
                setError("All options must have text and score");
                return;
            }
        }

        try {
            setLoading(true);
            let response;

            if (editingQuestionId) {
                response = await axios.post("/api/routes/ProfileInfo?action=updateCloseEndedQuestion", {
                    userId,
                    questionId: editingQuestionId,
                    questionText: newQuestion.questionText,
                    options: newQuestion.options
                });
            } else {
                response = await axios.post("/api/routes/ProfileInfo?action=postCloseEndedQuestion", {
                    userId,
                    questionText: newQuestion.questionText,
                    options: newQuestion.options
                });
            }

            setQuestions(response.data.questions || []);
            setNewQuestion({
                questionText: "",
                options: [{ text: "", score: 0 }]
            });
            setEditingQuestionId(null);
        } catch (err) {
            setError(editingQuestionId ? "Failed to update question" : "Failed to add question");
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditQuestion = (question) => {
        setEditingQuestionId(question.questionId);
        setNewQuestion({
            questionText: question.questionText,
            options: [...question.options]
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingQuestionId(null);
        setNewQuestion({
            questionText: "",
            options: [{ text: "", score: 0 }]
        });
    };

    return (
        <div className="flex flex-1 flex-col w-full mx-auto py-4 px-6 space-y-10 border rounded-xl">
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Close-Ended Questions</h2>
                
                <div className="border-b pb-6">
                    <h3 className="text-xl font-medium mb-4">
                        {editingQuestionId ? "Edit Question" : "Add New Question"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="questionText">Question Text</Label>
                            <Input
                                id="questionText"
                                value={newQuestion.questionText}
                                onChange={(e) => setNewQuestion({
                                    ...newQuestion,
                                    questionText: e.target.value
                                })}
                                placeholder="Enter your question"
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label>Options</Label>
                            <div className="mt-2 space-y-3">
                                {newQuestion.options.map((option, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <div className="flex-1 grid grid-cols-2 gap-2">
                                            <Input
                                                value={option.text}
                                                onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                                                placeholder="Option text"
                                            />
                                            <Input
                                                type="number"
                                                value={option.score}
                                                onChange={(e) => handleOptionChange(index, "score", e.target.value)}
                                                placeholder="Score"
                                            />
                                        </div>
                                        {newQuestion.options.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeOption(index)}
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="mt-2"
                                onClick={handleAddOption}
                            >
                                Add Option
                            </Button>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm">{error}</div>
                        )}

                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                className="bg-[#2C514C] hover:bg-[#1a3835]"
                                disabled={loading}
                            >
                                {loading ? "Processing..." :
                                    editingQuestionId ? "Update Question" : "Add Question"}
                            </Button>
                            {editingQuestionId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={cancelEdit}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Existing Questions */}
                <div className="space-y-6">
                    <h3 className="text-xl font-medium">Your Questions</h3>
                    {loading && !questions.length ? (
                        <div>Loading questions...</div>
                    ) : questions.length === 0 ? (
                        <div className="text-gray-500">No questions added yet</div>
                    ) : (
                        <div className="space-y-4">
                            {questions.map((question, qIndex) => {
                                const questionParts = question.questionText.split('\n');
                                const questionTextWithoutTitle = questionParts.length > 1 ? questionParts.slice(1).join('\n') : question.questionText;

                                return (
                                    <div key={question.questionId} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-[#2C514C]">
                                                    {qIndex < questionTitles.length ? questionTitles[qIndex] : `Question ${qIndex + 1}`}
                                                </h4>
                                                <p className="mt-1">{questionTextWithoutTitle}</p>
                                                <ul className="mt-3 space-y-2">
                                                    {question.options.map((option, idx) => (
                                                        <li key={idx} className="flex items-center gap-2">
                                                            <span className="text-gray-600">{option.text}</span>
                                                            <span className="text-sm text-gray-400">(Score: {option.score})</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditQuestion(question)}
                                                disabled={loading}
                                            >
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CloseEndedQuestionsPage;