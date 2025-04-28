"use client";
import React, { useState } from "react";

const ReceiptUpload = () => {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto p-6 bg-white">
        <h1 className="text-4xl font-semibold text-black mb-6">
          Upload Your receipt here
        </h1>

        <div className="mb-6 text-[16px]">
          <p className="text-gray-700 mb-2">Dear John</p>
          <p className="text-gray-700 mb-4">
            Great news! Michael has accepted your meeting request. You can now
            schedule your meeting using the link below:
          </p>

          <p className="text-gray-700 mb-4">
            Please complete your donation to{" "}
            <span className="font-semibold">Executives Selected Charity</span>{" "}
            as per the agreed amount of <span className="font-bold">$100</span>
          </p>
        </div>

        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="text-green-500 mr-2">✔</span>
            <span className="font-semibold">Business Executive Details:</span>
          </div>
          <ul className="list-disc pl-6 text-gray-700">
            <li>Name: John</li>
            <li>Company: Company Aix</li>
            <li>LinkedIn Profile: My Profile</li>
            <li>Proposed Donations: $100</li>
          </ul>
        </div>

        <div className="mb-4">
          <h2 className="font-semibold text-black text-[20px] mb-2">
            File Upload
          </h2>
          <div className="border-b border-gray-300 mb-4"></div>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.docx,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="w-12 h-12 text-[rgba(72,72,72,1)] mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="text-gray-600 mb-1">
                {file
                  ? file.name
                  : isDragging
                  ? "Drop your file here"
                  : "Click or drag file to this area to upload"}
              </p>
              <p className="text-sm text-gray-500">
                Formats accepted are .pdf, .docx, .doc, .docx, .png, .jpg, .jpeg
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer">
            Cancel
          </button>
          <button
            className="px-6 py-3 rounded-lg bg-[rgba(44,81,76,1)] text-white hover:bg-gray-400 disabled:opacity-50 transition cursor-pointer flex items-center justify-center"
            disabled={!file}
          >
            Send to Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptUpload;
