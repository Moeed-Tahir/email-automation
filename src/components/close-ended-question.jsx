"use client";

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
        questionScore: 1,
        options: [{ text: "", score: 5 }]
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

                const questionsWithWeights = (response.data.closeEndedQuestions || []).map(q => ({
                    ...q,
                    questionScore: Math.min(4, Math.max(0, q.questionScore || 1))
                }));
                setQuestions(questionsWithWeights);
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
            options: [...newQuestion.options, { text: "", score: 5 }]
        });
    };

    const handleOptionChange = (index, field, value) => {
        const updatedOptions = [...newQuestion.options];
        let numericValue = field === "score" ? Number(value) : value;
        
        if (field === "score") {
            numericValue = Math.min(10, Math.max(0, numericValue));
        }
        
        updatedOptions[index][field] = numericValue;
        setNewQuestion({
            ...newQuestion,
            options: updatedOptions
        });
    };

    const handlequestionScoreChange = (value) => {
        const numericValue = Math.min(4, Math.max(0, Number(value)));
        setNewQuestion({
            ...newQuestion,
            questionScore: numericValue
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

    const calculateNormalizedScore = (question) => {
        if (!question.options.length) return 0;
        
        const maxOptionScore = Math.max(...question.options.map(opt => opt.score));
        
        const weightedScore = maxOptionScore * question.questionScore;
        
        const normalizedScore = (weightedScore / 4).toFixed(1);
        
        return Math.min(10, Math.max(0, parseFloat(normalizedScore)));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!newQuestion.questionText.trim()) {
            setError("Question text is required");
            return;
        }

        if (newQuestion.questionScore < 0 || newQuestion.questionScore > 4) {
            setError("Question weight must be between 0 and 4");
            return;
        }

        if (newQuestion.options.length < 2) {
            setError("At least two options are required");
            return;
        }

        for (const option of newQuestion.options) {
            if (!option.text.trim()) {
                setError("All options must have text");
                return;
            }
            if (option.score < 0 || option.score > 10) {
                setError("Option scores must be between 0 and 10");
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
                    questionScore: newQuestion.questionScore,
                    options: newQuestion.options
                });
            } else {
                response = await axios.post("/api/routes/ProfileInfo?action=postCloseEndedQuestion", {
                    userId,
                    questionText: newQuestion.questionText,
                    questionScore: newQuestion.questionScore,
                    options: newQuestion.options
                });
            }

            const updatedQuestions = (response.data.questions || []).map(q => ({
                ...q,
                questionScore: Math.min(4, Math.max(0, q.questionScore || 1))
            }));
            
            setQuestions(updatedQuestions);
            setNewQuestion({
                questionText: "",
                questionScore: 1,
                options: [{ text: "", score: 5 }]
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
            questionScore: Math.min(4, Math.max(0, question.questionScore || 1)),
            options: [...question.options.map(opt => ({
                ...opt,
                score: Math.min(10, Math.max(0, opt.score))
            }))]
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingQuestionId(null);
        setNewQuestion({
            questionText: "",
            questionScore: 1,
            options: [{ text: "", score: 5 }]
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
                            <Label htmlFor="questionScore">Question Weight (0-4)</Label>
                            <Input
                                id="questionScore"
                                type="number"
                                min="0"
                                max="4"
                                step="0.1"
                                value={newQuestion.questionScore}
                                onChange={(e) => handlequestionScoreChange(e.target.value)}
                                placeholder="Enter weight (0-4)"
                                className="mt-2"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                This weight will multiply the selected option's score (0-4 scale)
                            </p>
                        </div>

                        <div>
                            <Label>Options (Scores must be 0-10)</Label>
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
                                                min="0"
                                                max="10"
                                                value={option.score}
                                                onChange={(e) => handleOptionChange(index, "score", e.target.value)}
                                                placeholder="Score (0-10)"
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
                                const normalizedScore = calculateNormalizedScore(question);

                                return (
                                    <div key={question.questionId} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <h4 className="font-medium text-[#2C514C]">
                                                        {qIndex < questionTitles.length ? questionTitles[qIndex] : `Question ${qIndex + 1}`}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                                            Weight: {question.questionScore.toFixed(1)}/4
                                                        </span>
                                                        {/* <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                                                            Normalized: {normalizedScore}/10
                                                        </span> */}
                                                    </div>
                                                </div>
                                                <p className="mt-1">{questionTextWithoutTitle}</p>
                                                <ul className="mt-3 space-y-2">
                                                    {question.options.map((option, idx) => (
                                                        <li key={idx} className="flex items-center gap-2">
                                                            <span className="text-gray-600">{option.text}</span>
                                                            <span className="text-sm text-gray-400">(Score: {option.score}/10)</span>
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