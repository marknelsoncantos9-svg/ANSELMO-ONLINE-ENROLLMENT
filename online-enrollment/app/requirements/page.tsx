"use client";

import Link from "next/link";
import { useState } from "react";

export default function RequirementsPage() {
  const [reportCard, setReportCard] = useState<File | null>(null);
  const [birthCertificate, setBirthCertificate] = useState<File | null>(null);
  const [otherRequirements, setOtherRequirements] = useState<File | null>(
    null
  );

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportCard || !birthCertificate) {
      alert(
        "Please upload the required Report Card and Birth Certificate."
      );
      return;
    }

    setSubmitting(true);

    try {
      const email = typeof window !== "undefined" ? localStorage.getItem("studentEmail") || "" : "";
      const studentName = typeof window !== "undefined" ? localStorage.getItem("studentName") || "Student" : "Student";
      const track = typeof window !== "undefined" ? localStorage.getItem("studentTrack") || "Senior High Track" : "Senior High Track";

      if (email) {
        const response = await fetch("/api/send-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, studentName, track }),
        });
        const data = await response.json();

        if (data.password) {
          localStorage.setItem("studentPassword", data.password);
        }
        localStorage.setItem("emailSentStatus", data.emailSent ? "sent" : "simulated");
        if (data.message) {
          localStorage.setItem("emailMessage", data.message);
        }
      }
    } catch (error) {
      console.warn("Could not automatically dispatch credentials email:", error);
    } finally {
      window.location.href = "/enroll/account";
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f6f4] px-4 py-8">

      <div className="mx-auto max-w-7xl">

        {/* ===================================================== */}
        {/* HEADER                                                 */}
        {/* ===================================================== */}

        <header className="mb-6 rounded-2xl bg-white px-6 py-5 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h1 className="text-xl font-bold text-[#063b2b] sm:text-2xl">
                Anselmo A. Sandoval Memorial National High School
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Online Enrollment
              </p>
            </div>

            <Link
              href="/enroll/form"
              className="w-fit rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              ← Back to Form
            </Link>

          </div>

        </header>


        {/* ===================================================== */}
        {/* PROGRESS                                               */}
        {/* ===================================================== */}

        <div className="mb-6 rounded-2xl bg-white px-6 py-5 shadow-sm">

          <div className="flex items-center">

            {/* STEP 1 */}

            <div className="flex items-center">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176b4d] text-sm font-bold text-white">
                ✓
              </div>

              <span className="ml-2 hidden text-sm font-semibold text-[#176b4d] sm:block">
                Track Selection
              </span>

            </div>


            {/* LINE */}

            <div className="mx-3 h-px flex-1 bg-[#176b4d]" />


            {/* STEP 2 */}

            <div className="flex items-center">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176b4d] text-sm font-bold text-white">
                ✓
              </div>

              <span className="ml-2 hidden text-sm font-semibold text-[#176b4d] sm:block">
                Enrollment Form
              </span>

            </div>


            {/* LINE */}

            <div className="mx-3 h-px flex-1 bg-[#176b4d]" />


            {/* STEP 3 */}

            <div className="flex items-center">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176b4d] text-sm font-bold text-white">
                3
              </div>

              <span className="ml-2 hidden text-sm font-semibold text-[#176b4d] sm:block">
                Requirements
              </span>

            </div>


            {/* LINE */}

            <div className="mx-3 h-px flex-1 bg-gray-200" />


            {/* STEP 4 */}

            <div className="flex items-center">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-500">
                4
              </div>

              <span className="ml-2 hidden text-sm font-semibold text-gray-500 sm:block">
                Account
              </span>

            </div>

          </div>

        </div>


        {/* ===================================================== */}
        {/* REQUIREMENTS FORM                                      */}
        {/* ===================================================== */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10"
        >

          {/* TITLE */}

          <div className="mb-10 border-l-4 border-[#e6a15c] pl-5">

            <h2 className="text-2xl font-bold text-[#063b2b] sm:text-3xl">
              Step 3: Enrollment Requirements
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Upload clear and readable copies of the required documents
              for your enrollment application.
            </p>

          </div>


          {/* =================================================== */}
          {/* REQUIREMENTS NOTICE                                  */}
          {/* =================================================== */}

          <div className="mb-8 rounded-xl border border-[#d8e8df] bg-[#f0f8f3] p-5">

            <div className="flex gap-3">

              <div className="text-lg">
                ℹ️
              </div>

              <div>

                <h3 className="font-semibold text-[#176b4d]">
                  Before uploading
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Make sure your documents are clear, complete, and
                  readable. Avoid blurry or cropped images.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================== */}
          {/* DOCUMENTS                                            */}
          {/* =================================================== */}

          <div className="space-y-6">


            {/* REPORT CARD */}

            <RequirementUpload
              number="1"
              title="Report Card"
              description="Upload a clear copy of your latest report card."
              required
              file={reportCard}
              onChange={setReportCard}
            />


            {/* BIRTH CERTIFICATE */}

            <RequirementUpload
              number="2"
              title="Birth Certificate"
              description="Upload a clear copy of your birth certificate."
              required
              file={birthCertificate}
              onChange={setBirthCertificate}
            />


            {/* OTHER REQUIREMENTS */}

            <RequirementUpload
              number="3"
              title="Other Requirements"
              description="Upload other enrollment documents required by the school, if applicable."
              file={otherRequirements}
              onChange={setOtherRequirements}
            />

          </div>


          {/* =================================================== */}
          {/* FILE REMINDER                                        */}
          {/* =================================================== */}

          <div className="mt-8 rounded-xl bg-gray-50 p-5">

            <h3 className="font-semibold text-[#063b2b]">
              Document Guidelines
            </h3>

            <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-600">

              <li>
                • Make sure all information on the document is visible.
              </li>

              <li>
                • Upload a clear and readable document.
              </li>

              <li>
                • Do not upload blank or unrelated files.
              </li>

              <li>
                • Check your files before submitting your application.
              </li>

            </ul>

          </div>


          {/* =================================================== */}
          {/* BUTTONS                                              */}
          {/* =================================================== */}

          <div className="mt-8 flex flex-col-reverse gap-4 border-t border-gray-200 pt-7 sm:flex-row sm:items-center sm:justify-between">

            <Link
              href="/enroll/form"
              className="rounded-xl border border-gray-300 bg-white px-7 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              ← Back to Form
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[#176b4d] px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f573d] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block" />
                  <span>Submitting & Sending Credentials...</span>
                </>
              ) : (
                <span>Submit Enrollment →</span>
              )}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}


/* ============================================================= */
/* REQUIREMENT UPLOAD COMPONENT                                  */
/* ============================================================= */

function RequirementUpload({
  number,
  title,
  description,
  required = false,
  file,
  onChange,
}: {
  number: string;
  title: string;
  description: string;
  required?: boolean;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-[#b9d5c7]">

      <div className="flex flex-col gap-5 sm:flex-row">

        {/* NUMBER */}

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f3ed] font-bold text-[#176b4d]">
          {number}
        </div>


        {/* CONTENT */}

        <div className="flex-1">

          <div className="mb-4">

            <h3 className="text-lg font-bold text-[#063b2b]">

              {title}

              {required && (
                <span className="ml-1 text-red-500">
                  *
                </span>
              )}

            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-500">
              {description}
            </p>

          </div>


          {/* FILE INPUT */}

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-[#176b4d] hover:bg-[#f7faf8]">

            <div className="mb-3 text-3xl">
              📄
            </div>

            <p className="text-sm font-semibold text-[#176b4d]">
              {file ? "Change document" : "Choose a document"}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Click here to select your file
            </p>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                onChange(selectedFile);
              }}
            />

          </label>


          {/* SELECTED FILE */}

          {file && (
            <div className="mt-3 flex items-center justify-between rounded-lg bg-[#f0f8f3] px-4 py-3">

              <div className="min-w-0">

                <p className="truncate text-sm font-medium text-[#176b4d]">
                  ✓ {file.name}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>

              </div>


              <button
                type="button"
                onClick={() => onChange(null)}
                className="ml-4 text-xs font-semibold text-red-500 hover:text-red-700"
              >
                Remove
              </button>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
