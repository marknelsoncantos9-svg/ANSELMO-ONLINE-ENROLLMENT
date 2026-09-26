import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05170d]">
      {/* Background School Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-90 contrast-105"
        style={{
          backgroundImage: "url('/school.jpg')",
        }}
      />

      {/* Dark Green Gradient Overlay with Khaki Ambient Tints */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#051b0f]/90 via-[#072415]/85 to-[#04120a]/95" />

      {/* Decorative Glow Elements */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[45rem] -translate-x-1/2 rounded-full bg-[#c8b27c]/10 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-[#13492c]/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 -left-20 h-96 w-96 rounded-full bg-[#c8b27c]/10 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-[#c8b27c]/25 bg-[#051a0f]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

            {/* School Logo / Name */}
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-2 ring-[#c8b27c]/80 ring-offset-2 ring-offset-[#051a0f]">
                <Image
                  src="/school-logo.png"
                  alt="AASMNHS School Logo"
                  width={48}
                  height={48}
                  className="h-full w-full object-contain p-1"
                  priority
                />
              </div>

              <div className="hidden sm:block">
                <p className="text-base font-bold tracking-wide text-white">
                  AASMNHS
                </p>
                <p className="text-xs font-medium text-[#c8b27c]">
                  Online Enrollment Portal
                </p>
              </div>
            </div>

            {/* Sign In Header Link */}
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg border border-[#c8b27c]/50 bg-[#0b291a]/60 px-5 py-2 text-sm font-semibold text-[#f4ede0] backdrop-blur-sm transition-all duration-200 hover:border-[#c8b27c] hover:bg-[#c8b27c] hover:text-[#05190e] hover:shadow-[0_0_15px_rgba(200,178,124,0.35)]"
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:py-16">
          <div className="mx-auto w-full max-w-5xl text-center">

            {/* Status Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#c8b27c]/40 bg-[#092b18]/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#eddcb9] backdrop-blur-md shadow-lg shadow-black/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8b27c] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c8b27c]"></span>
              </span>
              Senior High School Enrollment • S.Y. 2025–2026
            </div>

            {/* School Name */}
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
              Anselmo A. Sandoval Memorial
              <span className="mt-1 block bg-gradient-to-r from-white via-[#f3ebd9] to-[#c8b27c] bg-clip-text text-transparent">
                National High School
              </span>
            </h1>

            {/* Portal Subtitle */}
            <div className="mt-5 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#c8b27c]/70 sm:w-16" />
              <h2 className="text-xl font-semibold tracking-wide text-[#dbc89e] sm:text-2xl md:text-3xl">
                Online Enrollment System
              </h2>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#c8b27c]/70 sm:w-16" />
            </div>

            {/* Description */}
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#ded4c3]/90 sm:text-lg">
              Welcome to the official online enrollment portal for incoming Senior High
              School students. Submit your application, upload your credentials,
              and track your registration status conveniently from home.
            </p>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              {/* Primary CTA (Khaki with Dark Green Text) */}
              <Link
                href="/enroll"
                className="group flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#c8b27c] via-[#d6c393] to-[#be9f5f] px-8 py-3.5 text-center font-bold text-[#05180e] shadow-lg shadow-black/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(200,178,124,0.45)] sm:w-auto"
              >
                <span>Enroll Now</span>
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>

              {/* Secondary CTA (Dark Green Glass with Khaki Border) */}
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-lg border-2 border-[#c8b27c]/60 bg-[#082415]/80 px-8 py-3.5 text-center font-semibold text-[#f5ebd7] backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-[#c8b27c] hover:bg-[#c8b27c]/20 hover:text-white sm:w-auto"
              >
                Student / Parent Sign In
              </Link>
            </div>

            {/* Feature Highlights Grid */}
            <div className="mt-14 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
              {/* Feature 1 */}
              <div className="group rounded-xl border border-[#c8b27c]/25 bg-[#072113]/70 p-5 backdrop-blur-md shadow-lg shadow-black/20 transition-all duration-300 hover:border-[#c8b27c]/60 hover:bg-[#092918]/80">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8b27c]/15 text-[#c8b27c] ring-1 ring-[#c8b27c]/40">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[#f5ecd8]">
                  Fast Online Form
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#c3b59a]">
                  Fill out your learner profile and select your preferred Senior High School strand easily.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-xl border border-[#c8b27c]/25 bg-[#072113]/70 p-5 backdrop-blur-md shadow-lg shadow-black/20 transition-all duration-300 hover:border-[#c8b27c]/60 hover:bg-[#092918]/80">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8b27c]/15 text-[#c8b27c] ring-1 ring-[#c8b27c]/40">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[#f5ecd8]">
                  Digital Requirements
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#c3b59a]">
                  Upload digital copies of Form 138, PSA Birth Certificate, and certificate of completion.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-xl border border-[#c8b27c]/25 bg-[#072113]/70 p-5 backdrop-blur-md shadow-lg shadow-black/20 transition-all duration-300 hover:border-[#c8b27c]/60 hover:bg-[#092918]/80">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#c8b27c]/15 text-[#c8b27c] ring-1 ring-[#c8b27c]/40">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[#f5ecd8]">
                  Status Tracking
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[#c3b59a]">
                  Track your evaluation, strand qualification, and registrar confirmation in real time.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#c8b27c]/20 bg-[#041209]/80 px-6 py-5 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
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