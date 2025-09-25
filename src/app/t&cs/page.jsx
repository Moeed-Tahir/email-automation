import { ArrowBigLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Givetomeet.com",
  description:
    "Privacy Policy for Givetomeet.com - AI-powered email management for executives",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
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
                Welcome to Givetomeet.com. We are committed to protecting your
                privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our AI-powered email
                management service.
              </p>
            </section>

            {/* Information Collection */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                2.1 Personal Information
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                <li>
                  Google account information (name, email, profile picture)
                </li>
                <li>Email content and metadata for sales inquiry detection</li>
                <li>Onboarding form data and communication preferences</li>
                <li>Service usage data and interaction logs</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                2.2 Technical Information
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>IP address, browser type, and device information</li>
                <li>Cookies and similar tracking technologies</li>
                <li>Service performance and error logs</li>
              </ul>
            </section>

            {/* Google API Compliance */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. Google API Compliance
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-yellow-700 font-medium">
                  Limited Use Compliance
                </p>
                <p className="text-yellow-600 text-sm mt-1">
                  Our use of information from Google APIs adheres to the
                  <a
                    href="https://developers.google.com/terms/api-services-user-data-policy"
                    className="underline ml-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google API Services User Data Policy
                  </a>
                  .
                </p>
              </div>

              <p className="text-gray-700">
                We only access Gmail data necessary to identify sales inquiries
                and generate responses. We do not read personal emails unrelated
                to sales or use data for advertising purposes.
              </p>
            </section>

            {/* Data Usage */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Provide and maintain email management services</li>
                <li>Automatically scan and categorize incoming emails</li>
                <li>Generate and send automated responses</li>
                <li>Improve service performance and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Sharing
              </h2>
              <p className="text-gray-700 mb-4">
                We do not sell or rent your personal information. We may share
                data with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Service providers who assist in delivering our services</li>
                <li>Legal authorities when required by law</li>
                <li>Third parties during business transfers</li>
              </ul>
            </section>

            {/* User Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Your Rights
              </h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Access and correct your personal information</li>
                <li>Request deletion of your data</li>
                <li>Export your data in portable format</li>
                <li>Withdraw consent and delete your account</li>
                <li>Revoke Google OAuth access at any time</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Contact Us
              </h2>
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
          </div>
        </div>
      </div>
    </div>
  );
}
