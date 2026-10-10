"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export default function AccountPage() {
  const [email] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("studentEmail") || "your registered email" : "your registered email"));
  const [password, setPassword] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("studentPassword") || "" : ""));
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(() => (typeof window !== "undefined" ? localStorage.getItem("emailMessage") : null));

  const triggerSendEmail = useCallback(async (targetEmail: string) => {
    setIsSending(true);
    try {
      const studentName = typeof window !== "undefined" ? localStorage.getItem("studentName") || "Student" : "Student";
      const track = typeof window !== "undefined" ? localStorage.getItem("studentTrack") || "Senior High Track" : "Senior High Track";

      const response = await fetch("/api/send-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, studentName, track }),
      });
      const data = await response.json();

      if (data.password) {
        setPassword(data.password);
        localStorage.setItem("studentPassword", data.password);
      }
      if (data.message) {
        setFeedbackMessage(data.message);
      }
    } catch (err) {
      console.error("Failed to send credentials:", err);
      setFeedbackMessage("Unable to connect to email service. Your temporary password is shown below.");
    } finally {
      setIsSending(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    if (email && email !== "your registered email" && !password) {
      const timeoutId = setTimeout(() => {
        if (!isCancelled) {
          triggerSendEmail(email);
        }
      }, 50);
      return () => {
        isCancelled = true;
        clearTimeout(timeoutId);
      };
    }
  }, [email, password, triggerSendEmail]);

  const handleCopyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f6f4] px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* HEADER */}
        <header className="mb-6 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#063b2b] sm:text-2xl">
                Anselmo A. Sandoval Memorial National High School
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Online Enrollment Portal
              </p>
            </div>
            <Link
              href="/"
              className="w-fit rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Back to Home
            </Link>
          </div>
        </header>

        {/* PROGRESS */}
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

            <div className="mx-3 h-px flex-1 bg-[#176b4d]" />

            {/* STEP 3 */}
            <div className="flex items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176b4d] text-sm font-bold text-white">
                ✓
              </div>
              <span className="ml-2 hidden text-sm font-semibold text-[#176b4d] sm:block">
                Requirements
              </span>
            </div>

            <div className="mx-3 h-px flex-1 bg-[#176b4d]" />

            {/* STEP 4 */}
            <div className="flex items-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#176b4d] text-sm font-bold text-white">
                4
              </div>
              <span className="ml-2 hidden text-sm font-semibold text-[#176b4d] sm:block">
                Account
              </span>
            </div>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="rounded-2xl bg-white px-6 py-10 shadow-sm sm:px-12">
          {/* SUCCESS ICON */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 ring-8 ring-green-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#176b4d] text-2xl font-bold text-white shadow-md">
                ✓
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-[#063b2b] sm:text-3xl">
              Enrollment Submitted Successfully!
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              Your enrollment application and requirements have been received. Your login credentials have been automatically generated and sent to your email.
            </p>
          </div>

          {/* CREDENTIALS CARD */}
          <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-[#cfe4d8] bg-[#f0f8f3] p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#176b4d] text-2xl text-white shadow-sm">
                ✉
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-[#063b2b] text-base sm:text-lg">
                    Account Credentials Sent
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Automatic
                  </span>
                </div>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Your official portal login credentials have been generated and dispatched to your registered email address.
                </p>

                {/* Email Box */}
                <div className="mt-4 rounded-xl bg-white p-4 shadow-xs border border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Registered Email (Username)
                  </p>
                  <p className="mt-1 font-mono text-sm sm:text-base font-semibold text-[#176b4d] break-all">
                    {email}
                  </p>
                </div>

                {/* Password Box */}
                <div className="mt-3 rounded-xl bg-white p-4 shadow-xs border border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      Temporary Password
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-[#176b4d] hover:underline font-medium cursor-pointer"
                    >
                      {showPassword ? "Hide" : "Reveal"}
                    </button>
                  </div>

                  <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p className="font-mono text-base sm:text-lg font-bold tracking-wide text-[#063b2b]">
                      {password ? (
                        showPassword ? password : "••••••••••••"
                      ) : (
                        <span className="text-gray-400 text-sm font-normal">
                          {isSending ? "Generating temporary password..." : "AASMNHS-••••"}
                        </span>
                      )}
                    </p>

                    {password && (
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-[#176b4d]/30 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#176b4d] hover:bg-emerald-100 transition"
                      >
                        {copied ? (
                          <>
                            <span>✓</span>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <span>📋</span>
                            <span>Copy Password</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Resend button */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#cfe4d8]/60">
                  <p className="text-xs text-gray-500">
                    Did not receive the email? Check spam or resend:
                  </p>
                  <button
                    type="button"
                    disabled={isSending}
                    onClick={() => triggerSendEmail(email)}
                    className="cursor-pointer text-xs font-bold text-[#176b4d] hover:text-[#0b432f] hover:underline disabled:opacity-50"
                  >
                    {isSending ? "Sending..." : "↻ Resend Email Credentials"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback note if any */}
          {feedbackMessage && (
            <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-xs text-emerald-900">
              ℹ️ {feedbackMessage}
            </div>
          )}

          {/* PASSWORD NOTICE */}
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
              <span>⚠️</span> Important Security Reminders
            </h3>

            <ul className="mt-2 space-y-1.5 text-xs sm:text-sm leading-6 text-amber-800">
              <li>• Check your email inbox and spam folder for the account confirmation notice.</li>
              <li>• Keep your temporary password confidential and do not share it with others.</li>
              <li>• You will be prompted to change this temporary password upon your first sign in.</li>
            </ul>
          </div>

          {/* APPLICATION STATUS */}
          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h3 className="font-semibold text-[#063b2b]">
              What happens next?
            </h3>

            <div className="mt-4 space-y-4">
              <StatusItem
                number="1"
                title="Application & Credentials Dispatched"
                description="Your enrollment information has been recorded and temporary login credentials sent."
                completed
              />
              <StatusItem
                number="2"
                title="Application Review"
                description="The school registrar will review your information and submitted requirements."
              />
              <StatusItem
                number="3"
                title="Enrollment Verification"
                description="Your enrollment status will be updated after the school completes the review."
              />
              <StatusItem
                number="4"
                title="Section & Adviser Assignment"
                description="Once approved, your assigned section and adviser will be posted on your portal."
              />
            </div>
          </div>

          {/* BUTTON */}
          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="cursor-pointer rounded-xl bg-[#176b4d] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f573d] hover:shadow-md"
            >
              Finish & Return to Portal Home →
            </Link>
          </div>

          {/* FOOTNOTE */}
          <p className="mt-6 text-center text-xs text-gray-400">
            Please use your registered email address and temporary password when signing in.
          </p>
        </div>
      </div>
    </main>
  );
}

/* ============================================================= */
/* STATUS ITEM                                                    */
/* ============================================================= */

function StatusItem({
  number,
  title,
  description,
  completed = false,
}: {
  number: string;
  title: string;
  description: string;
  completed?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          completed ? "bg-[#176b4d] text-white" : "bg-gray-200 text-gray-500"
        }`}
      >
        {completed ? "✓" : number}
      </div>

      <div>
        <h4 className={`text-sm font-semibold ${completed ? "text-[#176b4d]" : "text-gray-700"}`}>
          {title}
        </h4>
        <p className="mt-0.5 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}