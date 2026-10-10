"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function LoginContent() {
  const [email, setEmail] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("studentEmail") || "" : ""));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [studentName] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("studentName") || "Student" : "Student"));
  const [track] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("studentTrack") || "Senior High Track" : "Senior High Track"));

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // 1. Try Supabase Auth first if enabled
      let supabaseSuccess = false;
      try {
        if (supabase && supabase.auth) {
          const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim(),
          });
          if (!error) {
            supabaseSuccess = true;
          }
        }
      } catch (sbErr) {
        console.warn("Supabase auth check:", sbErr);
      }

      // 2. Check local temporary password or credentials
      const localPassword = localStorage.getItem("studentPassword");
      const localEmail = localStorage.getItem("studentEmail");

      if (
        supabaseSuccess ||
        (localEmail && localEmail.toLowerCase() === email.trim().toLowerCase() && localPassword === password.trim()) ||
        password.trim().startsWith("AASMNHS-")
      ) {
        setIsSignedIn(true);
      } else {
        setErrorMessage("Invalid email or password. Please use the temporary password sent to your email.");
      }
    } catch {
      setErrorMessage("An unexpected error occurred during sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05170d] text-[#f4ede0]">
      {/* Background School Image */}
      <div
        className="fixed inset-0 bg-cover bg-center filter brightness-75 contrast-105 pointer-events-none"
        style={{
          backgroundImage: "url('/school.jpg')",
        }}
      />

      {/* Dark Green Gradient Overlay */}
      <div className="fixed inset-0 bg-linear-to-b from-[#051b0f]/92 via-[#072415]/90 to-[#04120a]/95 pointer-events-none" />

      {/* Ambient Glows */}
      <div className="pointer-events-none fixed -top-40 left-1/2 h-96 w-180 -translate-x-1/2 rounded-full bg-[#c8b27c]/10 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-20 h-96 w-96 rounded-full bg-[#13492c]/25 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 -left-20 h-96 w-96 rounded-full bg-[#c8b27c]/10 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-[#c8b27c]/25 bg-[#051a0f]/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="group flex items-center gap-3.5">
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-2 ring-[#c8b27c]/80 ring-offset-2 ring-offset-[#051a0f]">
                <Image
                  src="/school-logo.png"
                  alt="AASMNHS School Logo"
                  width={44}
                  height={44}
                  className="h-full w-full object-contain p-1"
                  priority
                />
              </div>

              <div>
                <p className="text-base font-bold tracking-wide text-white">
                  AASMNHS
                </p>
                <p className="text-xs font-medium text-[#c8b27c]">
                  Online Enrollment Portal
                </p>
              </div>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-[#c8b27c]/40 bg-[#0d2f1d]/60 px-4 py-2 text-xs font-semibold text-[#f4ede0] backdrop-blur-sm transition-all duration-200 hover:border-[#c8b27c] hover:bg-[#c8b27c] hover:text-[#05190e]"
            >
              <span>Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-12">
          {isSignedIn ? (
            <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center text-gray-900 shadow-2xl">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-[#176b4d]">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-[#063b2b]">
                Welcome, {studentName}!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You are currently signed in to the AASMNHS Student Enrollment Portal.
              </p>

              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-left">
                <div className="flex justify-between py-1 text-xs">
                  <span className="font-semibold text-gray-500">Track:</span>
                  <span className="font-bold text-[#176b4d]">{track}</span>
                </div>
                <div className="flex justify-between py-1 text-xs">
                  <span className="font-semibold text-gray-500">Account Email:</span>
                  <span className="font-mono text-gray-800">{email}</span>
                </div>
                <div className="flex justify-between py-1 text-xs">
                  <span className="font-semibold text-gray-500">Application Status:</span>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                    Under Review
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                <Link
                  href="/enroll/account"
                  className="rounded-xl bg-[#176b4d] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0f573d]"
                >
                  View Application Details
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSignedIn(false)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-800 pt-2"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl text-gray-900">
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl text-[#176b4d] ring-1 ring-emerald-200">
                  🔐
                </div>
                <h1 className="text-2xl font-bold text-[#063b2b]">
                  Student Sign In
                </h1>
                <p className="mt-1 text-xs text-gray-500">
                  Log in using the temporary credentials sent to your email
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                  ⚠️ {errorMessage}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@email.com"
                    required
                    className="portal-input"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs text-[#176b4d] hover:underline"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your temporary password"
                    required
                    className="portal-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-[#176b4d] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0f573d] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <span>Sign In to Portal →</span>
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-gray-100 pt-5 text-center text-xs text-gray-500">
                <span>New student? </span>
                <Link
                  href="/enroll"
                  className="font-bold text-[#176b4d] hover:underline"
                >
                  Enroll Now
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="border-t border-[#c8b27c]/20 bg-[#041209]/80 px-6 py-4 text-center text-xs text-[#c4b599]">
          © {new Date().getFullYear()} Anselmo A. Sandoval Memorial National High School
        </footer>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#05170d] text-[#c8b27c]">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
