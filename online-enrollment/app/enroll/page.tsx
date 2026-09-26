"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function EnrollPage() {
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05170d] text-[#f4ede0]">
      {/* Background School Image */}
      <div
        className="fixed inset-0 bg-cover bg-center filter brightness-75 contrast-105 pointer-events-none"
        style={{
          backgroundImage: "url('/school.jpg')",
        }}
      />

      {/* Dark Green Gradient Overlay with Khaki Ambient Tints */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#051b0f]/92 via-[#072415]/90 to-[#04120a]/95 pointer-events-none" />

      {/* Ambient Glows */}
      <div className="pointer-events-none fixed -top-40 left-1/2 h-96 w-[45rem] -translate-x-1/2 rounded-full bg-[#c8b27c]/10 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 -right-20 h-96 w-96 rounded-full bg-[#13492c]/25 blur-3xl" />

      {/* Page Content */}
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-[#c8b27c]/25 bg-[#051a0f]/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            {/* School Logo & Title */}
            <div className="flex items-center gap-3.5">
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
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-[#c8b27c]/40 bg-[#0d2f1d]/60 px-4 py-2 text-xs font-semibold text-[#f4ede0] backdrop-blur-sm transition-all duration-200 hover:border-[#c8b27c] hover:bg-[#c8b27c] hover:text-[#05190e] hover:shadow-[0_0_15px_rgba(200,178,124,0.3)] sm:text-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Multi-step Progress Bar */}
        <div className="border-b border-[#c8b27c]/20 bg-[#061e12]/75 backdrop-blur-md">
          <div className="mx-auto max-w-4xl px-6 py-4">
            <div className="flex items-center">
              {/* Step 1: Active */}
              <div className="flex items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#c8b27c] to-[#b3985a] text-sm font-bold text-[#05180e] shadow-[0_0_15px_rgba(200,178,124,0.4)]">
                  1
                </div>

                <span className="ml-3 text-sm font-bold text-[#f5ebd7]">
                  Track Selection
                </span>
              </div>

              <div className="mx-4 h-px flex-1 bg-[#c8b27c]/25" />

              {/* Step 2 */}
              <div className="flex items-center text-[#9f9175]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8b27c]/30 bg-[#04140a]/60 text-sm font-semibold">
                  2
                </div>

                <span className="ml-3 hidden text-sm font-medium sm:block">
                  Student Information
                </span>
              </div>

              <div className="mx-4 h-px flex-1 bg-[#c8b27c]/25" />

              {/* Step 3 */}
              <div className="flex items-center text-[#9f9175]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8b27c]/30 bg-[#04140a]/60 text-sm font-semibold">
                  3
                </div>

                <span className="ml-3 hidden text-sm font-medium sm:block">
                  Requirements
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <section className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
          <div className="text-center">
            {/* Status Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c8b27c]/40 bg-[#092b18]/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#eddcb9] backdrop-blur-md shadow-lg shadow-black/20">
              <span className="h-2 w-2 rounded-full bg-[#c8b27c]"></span>
              Enrollment Application • S.Y. 2025–2026
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-4xl md:text-5xl">
              Choose Your Senior High Track
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#ded4c3]/90 sm:text-lg">
              Select the cluster of electives that best matches your interests,
              skills, and future career path at Anselmo A. Sandoval Memorial National High School.
            </p>
          </div>

          {/* Track Selection Cards */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            
            {/* Academic Track */}
            <button
              type="button"
              onClick={() => setSelectedTrack("academic")}
              className={`group relative rounded-2xl border p-7 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/25 ${
                selectedTrack === "academic"
                  ? "border-[#c8b27c] ring-2 ring-[#c8b27c]/60 bg-[#0b311c]/95 shadow-[0_0_30px_rgba(200,178,124,0.3)]"
                  : "border-[#c8b27c]/25 bg-[#072113]/70 hover:border-[#c8b27c]/60 hover:bg-[#092918]/85"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#c8b27c]/15 text-2xl border border-[#c8b27c]/35 shadow-inner">
                  🎓
                </div>

                {selectedTrack === "academic" ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#c8b27c] to-[#b3985a] text-sm font-black text-[#05180e] shadow-md">
                    ✓
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c8b27c]/30 text-xs text-transparent group-hover:border-[#c8b27c]/70">
                    ○
                  </div>
                )}
              </div>

              <h2 className="mt-6 text-2xl font-bold text-[#f5ebd7]">
                Academic Track
              </h2>

              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#c3b59a]">
                Choose academic-focused elective clusters aligned with your
                interests and future college degree or career goals.
              </p>

              {/* Academic Sub-clusters */}
              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-[#c8b27c]/20 bg-[#04140a]/60 px-4 py-3.5 transition-colors group-hover:border-[#c8b27c]/35">
                  <p className="font-semibold text-[#f4ede0]">
                    Arts &amp; Design
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-[#b5a78d]">
                    Electives focused on creative, visual, media, and artistic expressions.
                  </p>
                </div>

                <div className="rounded-xl border border-[#c8b27c]/20 bg-[#04140a]/60 px-4 py-3.5 transition-colors group-hover:border-[#c8b27c]/35">
                  <p className="font-semibold text-[#f4ede0]">
                    Sports
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-[#b5a78d]">
                    Electives focused on athletic development, fitness, and physical education.
                  </p>
                </div>
              </div>
            </button>

            {/* TechPro Track */}
            <button
              type="button"
              onClick={() => setSelectedTrack("techpro")}
              className={`group relative rounded-2xl border p-7 text-left backdrop-blur-md transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-black/25 ${
                selectedTrack === "techpro"
                  ? "border-[#c8b27c] ring-2 ring-[#c8b27c]/60 bg-[#0b311c]/95 shadow-[0_0_30px_rgba(200,178,124,0.3)]"
                  : "border-[#c8b27c]/25 bg-[#072113]/70 hover:border-[#c8b27c]/60 hover:bg-[#092918]/85"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#c8b27c]/15 text-2xl border border-[#c8b27c]/35 shadow-inner">
                  💻
                </div>

                {selectedTrack === "techpro" ? (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#c8b27c] to-[#b3985a] text-sm font-black text-[#05180e] shadow-md">
                    ✓
                  </div>
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c8b27c]/30 text-xs text-transparent group-hover:border-[#c8b27c]/70">
                    ○
                  </div>
                )}
              </div>

              <h2 className="mt-6 text-2xl font-bold text-[#f5ebd7]">
                TechPro Track
              </h2>

              <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#c3b59a]">
                Choose technology and skills-oriented elective clusters that
                support practical competencies and immediate career preparation.
              </p>

              {/* TechPro Sub-clusters */}
              <div className="mt-6 rounded-xl border border-[#c8b27c]/20 bg-[#04140a]/60 px-4 py-4 transition-colors group-hover:border-[#c8b27c]/35">
                <p className="font-semibold text-[#f4ede0]">
                  TechPro Elective Clusters
                </p>
                <p className="mt-1 text-xs sm:text-sm leading-relaxed text-[#b5a78d]">
                  Technical-vocational clusters (ICT, Industrial Arts, Agri-Fishery, and Home Economics) available for enrollment selection.
                </p>
              </div>
            </button>
          </div>

          {/* Selection Notice Message Box */}
          <div className="mt-8 rounded-xl border border-[#c8b27c]/35 bg-[#092c19]/80 px-5 py-4 backdrop-blur-sm shadow-md">
            <div className="flex items-start gap-3">
              <span className="text-lg">💡</span>
              <p className="text-sm leading-6 text-[#eddcb9]">
                <span className="font-bold text-[#f5ebd7]">Important:</span>{" "}
                Choose the elective cluster that best matches your interests and
                career goals. Your selection will be confirmed during document verification.
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center justify-between border-t border-[#c8b27c]/20 pt-6">
            <Link
              href="/"
              className="rounded-lg border border-[#c8b27c]/40 bg-[#072012]/80 px-6 py-3 text-sm font-semibold text-[#f5ebd7] backdrop-blur-sm transition hover:border-[#c8b27c] hover:bg-[#c8b27c]/20"
            >
              ← Back to Home
            </Link>

            <button
              type="button"
              disabled={!selectedTrack}
              className={`rounded-lg px-8 py-3 text-sm font-bold transition-all duration-300 ${
                selectedTrack
                  ? "bg-gradient-to-r from-[#c8b27c] via-[#d6c393] to-[#be9f5f] text-[#05180e] shadow-lg shadow-black/30 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(200,178,124,0.45)] cursor-pointer"
                  : "cursor-not-allowed border border-[#c8b27c]/15 bg-[#071d11]/60 text-[#67776b]"
              }`}
            >
              Continue to Student Info →
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#c8b27c]/20 bg-[#041209]/80 px-6 py-5 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
            <p className="text-xs text-[#c4b599] sm:text-sm">
              © {new Date().getFullYear()} Anselmo A. Sandoval Memorial National High School
            </p>
            <p className="text-xs text-[#9e8f73]">
              Mabini, Batangas • DepEd Region IV-A CALABARZON
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}