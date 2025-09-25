import React from "react";
import Head from "next/head";
import Link from "next/link";
import { ArrowBigLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Privacy Policy - Givetomeet.com</title>
        <meta
          name="description"
          content="Privacy Policy for Givetomeet.com - AI-powered email management for executives"
        />
      </Head>

      <div className="max-w-7xl mx-auto mb-6">
        <Link
          href="/signup"
          className="text-[rgba(44,81,76,1)] underline mb-4 flex items-center"
        >
          <ArrowBigLeft /> Back to Home
        </Link>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[rgba(44,81,76,1)] px-6 py-8">
          <h1 className="text-4xl font-bold text-white text-center">
            Privacy Policy
          </h1>
          <p className="text-blue-100 text-center mt-2 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-8 lg:px-8">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-700 mb-4">
                Welcome to Givetomeet.com ("we," "our," or "us"). We are
                committed to protecting your privacy and ensuring the security
                of your personal information. This Privacy Policy explains how
                we collect, use, disclose, and safeguard your information when
                you use our AI-powered email management service.
              </p>
              <p className="text-gray-700">
                By using Givetomeet.com, you consent to the data practices
                described in this policy. If you do not agree with the terms of
                this policy, please do not access or use our services.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                2.1 Personal Information
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>
                  Google account information (name, email address, profile
                  picture)
                </li>
                <li>Email content and metadata from your Gmail account</li>
                <li>Communication preferences and settings</li>
                <li>Onboarding form data submitted through our platform</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                2.2 Technical Information
              </h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Usage data and service interaction logs</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            {/* How We Use Your Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>To provide and maintain our email management services</li>
                <li>To automatically scan and categorize incoming emails</li>
                <li>
                  To generate and send automated responses to sales inquiries
                </li>
                <li>
                  To facilitate the onboarding process for potential clients
                </li>
                <li>To improve and optimize our service performance</li>
                <li>
                  To communicate with you about service updates and security
                </li>
                <li>To comply with legal obligations and protect our rights</li>
              </ul>
            </section>

            {/* Google API Services Disclosure */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Google API Services Disclosure
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-700 font-medium">
                  Important: Gmail API Usage
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  Our use and transfer of information received from Google APIs
                  will adhere to the
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    className="underline ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google API Services User Data Policy
                  </a>
                  , including the Limited Use requirements.
                </p>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.1 Limited Use Compliance
              </h3>
              <p className="text-gray-700 mb-3">
                We strictly comply with Google's Limited Use requirements. The
                data we access through Gmail APIs is used only to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>
                  Provide our email categorization and automated response
                  service
                </li>
                <li>Improve the quality and security of our service</li>
                <li>
                  Facilitate user-initiated actions (sending responses, managing
                  emails)
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">
                4.2 Data Access Scope
              </h3>
              <p className="text-gray-700">
                We only access email content necessary to identify sales
                inquiries and generate appropriate responses. We do not:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                <li>
                  Read personal or sensitive emails unrelated to sales inquiries
                </li>
                <li>
                  Share email content with third parties for advertising
                  purposes
                </li>
                <li>
                  Use email data for training AI models without explicit consent
                </li>
                <li>
                  Retain email content longer than necessary for service
                  operation
                </li>
              </ul>
            </section>

            {/* Data Sharing and Disclosure */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Sharing and Disclosure
              </h2>
              <p className="text-gray-700 mb-3">
                We do not sell, trade, or rent your personal information to
                others.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                5.1 Service Providers
              </h3>
              <p className="text-gray-700">
                We may share information with trusted third-party service
                providers who assist us in:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                <li>Cloud hosting and infrastructure services</li>
                <li>Email delivery and communication services</li>
                <li>Analytics and performance monitoring</li>
                <li>Customer support platforms</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">
                5.2 Legal Requirements
              </h3>
              <p className="text-gray-700">
                We may disclose your information if required by law or in
                response to valid requests by public authorities.
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Data Security
              </h2>
              <p className="text-gray-700">
                We implement appropriate technical and organizational security
                measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and monitoring</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure development practices and code reviews</li>
              </ul>
            </section>

            {/* User Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Your Rights and Choices
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                7.1 Access and Control
              </h3>
              <p className="text-gray-700 mb-3">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Access and review your personal information</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your personal information</li>
                <li>Export your data in a portable format</li>
                <li>Withdraw consent and discontinue service use</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-4">
                7.2 Google Permissions
              </h3>
              <p className="text-gray-700">
                You can review and manage Google permissions through your Google
                Account settings. You may revoke our access to your Gmail data
                at any time.
              </p>
            </section>

            {/* Data Retention */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Data Retention
              </h2>
              <p className="text-gray-700">
                We retain personal information only for as long as necessary to
                provide our services and fulfill the purposes outlined in this
                policy. Email content processed for sales inquiry detection is
                typically retained for 30 days unless required for ongoing
                service operations.
              </p>
            </section>

            {/* International Data Transfers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-gray-700">
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place to protect your data in accordance with this
                privacy policy.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Children's Privacy
              </h2>
              <p className="text-gray-700">
                Our service is not intended for users under the age of 18. We do
                not knowingly collect personal information from children. If we
                become aware of such collection, we will take steps to delete
                the information.
              </p>
            </section>

            {/* Changes to This Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Changes to This Policy
              </h2>
              <p className="text-gray-700">
                We may update this privacy policy from time to time. We will
                notify you of any changes by posting the new policy on this page
                and updating the "Last updated" date.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Contact Us
              </h2>
              <p className="text-gray-700 mb-2">
                If you have any questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong>{" "}
                  <a
                    href="mailto:info@makelastingchange.com"
                    className="text-blue-600 underline"
                  >
                    info@makelastingchange.com
                  </a>
                </p>
                <p className="text-gray-700">
                  <strong>Website:</strong>{" "}
                  <Link
                    href="https://givetomeet.com"
                    className="text-blue-600 underline"
                  >
                    givetomeet.com
                  </Link>
                </p>
              </div>
            </section>

            {/* Compliance Note */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-8">
              <p className="text-green-700 font-medium">Compliance Status</p>
              <p className="text-green-600 text-sm mt-1">
                This privacy policy complies with Google API Services User Data
                Policy requirements and general data protection regulations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
