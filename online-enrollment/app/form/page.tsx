"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

interface AddressState {
  houseNo: string;
  street: string;
  barangay: string;
  municipality: string;
  province: string;
  country: string;
  zipCode: string;
}

const initialAddress: AddressState = {
  houseNo: "",
  street: "",
  barangay: "",
  municipality: "",
  province: "",
  country: "Philippines",
  zipCode: "",
};

function FormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTrack = searchParams.get("track") || "Academic Track";

  // Student basic information states
  const [lastName, setLastName] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("studentLastName") || "" : ""));
  const [firstName, setFirstName] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("studentFirstName") || "" : ""));
  const [middleName, setMiddleName] = useState("");
  const [extension, setExtension] = useState("");
  const [email, setEmail] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("studentEmail") || "" : ""));
  const [dob, setDob] = useState("");
  const [pob, setPob] = useState("");
  const [gender, setGender] = useState("");
  const [religion, setReligion] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  // Address state management
  const [currentAddress, setCurrentAddress] = useState<AddressState>(initialAddress);
  const [permanentAddress, setPermanentAddress] = useState<AddressState>(initialAddress);
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);

  // Handle current address changes
  const handleCurrentAddressChange = (field: keyof AddressState, value: string) => {
    setCurrentAddress((prev) => {
      const updated = { ...prev, [field]: value };
      if (sameAsCurrentAddress) {
        setPermanentAddress(updated);
      }
      return updated;
    });
  };

  // Handle toggle of "Same as Current Address" checkbox
  const handleSameAddressToggle = (checked: boolean) => {
    setSameAsCurrentAddress(checked);
    if (checked) {
      setPermanentAddress({ ...currentAddress });
    }
  };

  // Handle permanent address changes when not locked
  const handlePermanentAddressChange = (field: keyof AddressState, value: string) => {
    setPermanentAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Keep the student's information available for the following enrollment steps.
    const applicationDraft = {
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      lastName: lastName.trim(),
      extension: extension.trim(),
      email: email.trim(),
      birthDate: dob,
      placeOfBirth: pob.trim(),
      gender,
      religion: religion.trim(),
      contactNumber: contactNumber.trim(),
      selectedTrack,
      currentAddress: { ...currentAddress },
      permanentAddress: sameAsCurrentAddress
        ? { ...currentAddress }
        : { ...permanentAddress },
      sameAsCurrentAddress,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "studentApplicationDraft",
      JSON.stringify(applicationDraft)
    );

    // Preserve keys that may be used by the existing requirements/account pages.
    localStorage.setItem("studentEmail", email.trim());
    localStorage.setItem("studentFirstName", firstName.trim());
    localStorage.setItem("studentLastName", lastName.trim());
    localStorage.setItem("studentName", `${firstName} ${lastName}`.trim());
    localStorage.setItem("studentTrack", selectedTrack);

    router.push(
      `/enroll/requirements?track=${encodeURIComponent(selectedTrack)}`
    );
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

      {/* Dark Green Gradient Overlay with Khaki Ambient Tints */}
      <div className="fixed inset-0 bg-linear-to-b from-[#051b0f]/92 via-[#072415]/90 to-[#04120a]/95 pointer-events-none" />

      {/* Ambient Glows */}
      <div className="pointer-events-none fixed -top-40 left-1/2 h-96 w-180 -translate-x-1/2 rounded-full bg-[#c8b27c]/10 blur-3xl" />
      <div className="pointer-events-none fixed top-1/3 -right-20 h-96 w-96 rounded-full bg-[#13492c]/25 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 -left-20 h-96 w-96 rounded-full bg-[#c8b27c]/10 blur-3xl" />

      {/* Page Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 w-full border-b border-[#c8b27c]/25 bg-[#051a0f]/85 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            {/* School Logo & Title */}
            <Link href="/" className="group flex items-center gap-3.5">
              <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-2 ring-[#c8b27c]/80 ring-offset-2 ring-offset-[#051a0f] transition-transform group-hover:scale-105">
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
              href="/enroll"
              className="inline-flex items-center gap-2 rounded-lg border border-[#c8b27c]/40 bg-[#0d2f1d]/60 px-4 py-2 text-xs font-semibold text-[#f4ede0] backdrop-blur-sm transition-all duration-200 hover:border-[#c8b27c] hover:bg-[#c8b27c] hover:text-[#05190e] hover:shadow-[0_0_15px_rgba(200,178,124,0.3)] sm:text-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Track</span>
            </Link>
          </div>
        </header>

        {/* Multi-step Progress Bar */}
        <div className="border-b border-[#c8b27c]/20 bg-[#061e12]/75 backdrop-blur-md">
          <div className="mx-auto max-w-4xl px-6 py-4">
            <div className="flex items-center">
              {/* Step 1: Completed */}
              <Link href="/enroll" className="group flex items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-[#c8b27c] to-[#b3985a] text-sm font-black text-[#05180e] shadow-[0_0_15px_rgba(200,178,124,0.4)] transition-transform group-hover:scale-105">
                  ✓
                </div>
                <span className="ml-3 text-sm font-bold text-[#f5ebd7] transition-colors group-hover:text-[#c8b27c]">
                  Track Selection
                </span>
              </Link>

              <div className="mx-4 h-px flex-1 bg-[#c8b27c]/60" />

              {/* Step 2: Active */}
              <div className="flex items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-[#c8b27c] to-[#b3985a] text-sm font-bold text-[#05180e] shadow-[0_0_15px_rgba(200,178,124,0.4)]">
                  2
                </div>
                <span className="ml-3 text-sm font-bold text-[#f5ebd7]">
                  Student Information
                </span>
              </div>

              <div className="mx-4 h-px flex-1 bg-[#c8b27c]/25" />

              {/* Step 3: Upcoming */}
              <div className="flex items-center text-[#9f9175]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8b27c]/30 bg-[#04140a]/60 text-sm font-semibold">
                  3
                </div>
                <span className="ml-3 hidden text-sm font-medium sm:block">
                  Requirements
                </span>
              </div>

              <div className="mx-4 h-px flex-1 bg-[#c8b27c]/25" />

              {/* Step 4: Account */}
              <div className="flex items-center text-[#9f9175]">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8b27c]/30 bg-[#04140a]/60 text-sm font-semibold">
                  4
                </div>
                <span className="ml-3 hidden text-sm font-medium sm:block">
                  Account
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 sm:py-12">
          {/* Universal School Headings Banner */}
          <div className="text-center">
            {/* Status Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[#c8b27c]/40 bg-[#092b18]/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#eddcb9] backdrop-blur-md shadow-lg shadow-black/20">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c8b27c] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#c8b27c]"></span>
              </span>
              Senior High School Enrollment • S.Y. 2025–2026
            </div>

            {/* School Name */}
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl lg:text-6xl">
              Anselmo A. Sandoval Memorial
              <span className="mt-1 block bg-linear-to-r from-white via-[#f3ebd9] to-[#c8b27c] bg-clip-text text-transparent">
                National High School
              </span>
            </h1>

            {/* Portal Subtitle */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className="h-px w-10 bg-linear-to-r from-transparent to-[#c8b27c]/70 sm:w-16" />
              <h2 className="text-lg font-semibold tracking-wide text-[#dbc89e] sm:text-xl md:text-2xl">
                Online Enrollment System
              </h2>
              <span className="h-px w-10 bg-linear-to-l from-transparent to-[#c8b27c]/70 sm:w-16" />
            </div>

            {/* Step 2 Heading Box */}
            <div className="mt-8 rounded-xl border border-[#c8b27c]/25 bg-[#072113]/70 p-5 backdrop-blur-md shadow-lg">
              <h3 className="text-xl font-bold text-[#f5ebd7] sm:text-2xl">
                Step 2: Personal Information &amp; Strand
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-[#ded4c3]/90 sm:text-base">
                Please provide the student&apos;s complete and accurate information to continue the enrollment process.
              </p>
            </div>
          </div>

          {/* Form Container - Pure White Background for High Contrast & Readability */}
          <form
            onSubmit={handleContinue}
            className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-10 text-gray-900 ring-1 ring-black/5"
          >
            {/* SELECTED TRACK */}
            <section className="mb-10">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h4 className="flex items-center gap-2 text-lg font-bold text-[#063b2b] sm:text-xl">
                  <span>🎓</span> Selected Track
                </h4>
                <Link
                  href="/enroll"
                  className="text-xs font-semibold text-[#176b4d] underline underline-offset-4 transition hover:text-[#063b2b]"
                >
                  Change Track
                </Link>
              </div>

              <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-xl border border-emerald-100 bg-[#f4f9f6] p-5 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#176b4d]">
                    Enrolled Senior High Track
                  </p>
                  <p className="mt-1 text-xl font-bold capitalize text-[#063b2b] sm:text-2xl">
                    {selectedTrack}
                  </p>
                </div>
                <span className="rounded-lg bg-emerald-100 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#063b2b] ring-1 ring-emerald-300">
                  Confirmed Selection
                </span>
              </div>
            </section>

            {/* STUDENT NAME (LRN REMOVED) */}
            <section className="mb-10">
              <h4 className="mb-5 flex items-center gap-2 border-b border-gray-200 pb-3 text-lg font-bold text-[#063b2b] sm:text-xl">
                <span>👤</span> Student Name
              </h4>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <FormInput
                  label="LAST NAME"
                  placeholder="Dela Cruz"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                <FormInput
                  label="FIRST NAME"
                  placeholder="Juan Miguel"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <FormInput
                  label="MIDDLE NAME"
                  placeholder="Santos"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
                <FormInput
                  label="EXTENSION (JR., III, ETC.)"
                  placeholder="e.g. Jr."
                  value={extension}
                  onChange={(e) => setExtension(e.target.value)}
                />
              </div>
            </section>

            {/* BASIC INFORMATION */}
            <section className="mb-10">
              <h4 className="mb-5 flex items-center gap-2 border-b border-gray-200 pb-3 text-lg font-bold text-[#063b2b] sm:text-xl">
                <span>📋</span> Basic Information
              </h4>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <FormInput
                    label="EMAIL ADDRESS"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@email.com"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Your account password and confirmation will be automatically sent to this email address.
                  </p>
                </div>

                <FormInput
                  label="DATE OF BIRTH"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />

                <FormInput
                  label="PLACE OF BIRTH (MUNICIPALITY/CITY)"
                  placeholder="e.g., Mabini, Batangas"
                  value={pob}
                  onChange={(e) => setPob(e.target.value)}
                  required
                />

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
                    GENDER <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="portal-input"
                    required
                  >
                    <option value="" disabled className="text-gray-400">
                      Select Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <FormInput
                  label="RELIGION"
                  placeholder="e.g., Roman Catholic"
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                />

                <FormInput
                  label="CONTACT NUMBER"
                  type="tel"
                  placeholder="e.g., 09123456789"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  required
                />
              </div>
            </section>

            {/* SOCIAL INFORMATION */}
            <section className="mb-10">
              <h4 className="mb-5 flex items-center gap-2 border-b border-gray-200 pb-3 text-lg font-bold text-[#063b2b] sm:text-xl">
                <span>🤝</span> Social Information
              </h4>

              <div className="space-y-3.5">
                <FormCheckbox label="Belonging to any Indigenous People (IP) community" />
                <FormCheckbox label="Is your family an active beneficiary of 4Ps (Pantawid Pamilyang Pilipino Program)?" />
              </div>
            </section>

            {/* CURRENT ADDRESS */}
            <section className="mb-10">
              <h4 className="mb-5 flex items-center gap-2 border-b border-gray-200 pb-3 text-lg font-bold text-[#063b2b] sm:text-xl">
                <span>📍</span> Current Address
              </h4>

              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5 sm:p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormInput
                    label="HOUSE NO."
                    placeholder="e.g., 123"
                    value={currentAddress.houseNo}
                    onChange={(e) => handleCurrentAddressChange("houseNo", e.target.value)}
                  />

                  <FormInput
                    label="SITIO / STREET NAME"
                    placeholder="e.g., Rizal St."
                    value={currentAddress.street}
                    onChange={(e) => handleCurrentAddressChange("street", e.target.value)}
                  />

                  <FormInput
                    label="BARANGAY"
                    placeholder="e.g., Poblacion"
                    required
                    value={currentAddress.barangay}
                    onChange={(e) => handleCurrentAddressChange("barangay", e.target.value)}
                  />

                  <FormInput
                    label="MUNICIPALITY / CITY"
                    placeholder="e.g., Mabini"
                    required
                    value={currentAddress.municipality}
                    onChange={(e) => handleCurrentAddressChange("municipality", e.target.value)}
                  />

                  <FormInput
                    label="PROVINCE"
                    placeholder="e.g., Batangas"
                    required
                    value={currentAddress.province}
                    onChange={(e) => handleCurrentAddressChange("province", e.target.value)}
                  />

                  <FormInput
                    label="COUNTRY"
                    value={currentAddress.country}
                    onChange={(e) => handleCurrentAddressChange("country", e.target.value)}
                  />

                  <FormInput
                    label="ZIP CODE"
                    placeholder="e.g., 4202"
                    value={currentAddress.zipCode}
                    onChange={(e) => handleCurrentAddressChange("zipCode", e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* PERMANENT ADDRESS */}
            <section className="mb-10">
              <div className="mb-5 flex flex-col gap-3 border-b border-gray-200 pb-3 sm:flex-row sm:items-center sm:justify-between">
                <h4 className="flex items-center gap-2 text-lg font-bold text-[#063b2b] sm:text-xl">
                  <span>🏠</span> Permanent Address
                </h4>

                {/* Same as Current Address Checkbox */}
                <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-[#176b4d] hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={sameAsCurrentAddress}
                    onChange={(e) => handleSameAddressToggle(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 accent-[#176b4d] focus:ring-1 focus:ring-[#176b4d]"
                  />
                  <span>Same as Current Address</span>
                </label>
              </div>

              {/* Sync notification banner */}
              {sameAsCurrentAddress && (
                <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800 shadow-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#176b4d] text-xs font-black text-white">
                    ✓
                  </span>
                  <span>
                    Permanent Address is locked and synchronized with Current Address. Uncheck the box above to edit separately.
                  </span>
                </div>
              )}

              <div className="rounded-xl border border-gray-200 bg-gray-50/70 p-5 sm:p-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <FormInput
                    label="HOUSE NO."
                    placeholder="e.g., 123"
                    value={sameAsCurrentAddress ? currentAddress.houseNo : permanentAddress.houseNo}
                    onChange={(e) => handlePermanentAddressChange("houseNo", e.target.value)}
                    readOnly={sameAsCurrentAddress}
                  />

                  <FormInput
                    label="SITIO / STREET NAME"
                    placeholder="e.g., Rizal St."
                    value={sameAsCurrentAddress ? currentAddress.street : permanentAddress.street}
                    onChange={(e) => handlePermanentAddressChange("street", e.target.value)}
                    readOnly={sameAsCurrentAddress}
                  />

                  <FormInput
                    label="BARANGAY"
                    placeholder="e.g., Poblacion"
                    required
                    value={sameAsCurrentAddress ? currentAddress.barangay : permanentAddress.barangay}
                    onChange={(e) => handlePermanentAddressChange("barangay", e.target.value)}
                    readOnly={sameAsCurrentAddress}
                  />

                  <FormInput
                    label="MUNICIPALITY / CITY"
                    placeholder="e.g., Mabini"
                    required
                    value={sameAsCurrentAddress ? currentAddress.municipality : permanentAddress.municipality}
                    onChange={(e) => handlePermanentAddressChange("municipality", e.target.value)}
                    readOnly={sameAsCurrentAddress}
                  />

                  <FormInput
                    label="PROVINCE"
                    placeholder="e.g., Batangas"
                    required
                    value={sameAsCurrentAddress ? currentAddress.province : permanentAddress.province}
                    onChange={(e) => handlePermanentAddressChange("province", e.target.value)}
                    readOnly={sameAsCurrentAddress}
                  />

                  <FormInput
                    label="COUNTRY"
                    value={sameAsCurrentAddress ? currentAddress.country : permanentAddress.country}
                    onChange={(e) => handlePermanentAddressChange("country", e.target.value)}
                    readOnly={sameAsCurrentAddress}
                  />

                  <FormInput
                    label="ZIP CODE"
                    placeholder="e.g., 4202"
                    value={sameAsCurrentAddress ? currentAddress.zipCode : permanentAddress.zipCode}
                    onChange={(e) => handlePermanentAddressChange("zipCode", e.target.value)}
                    readOnly={sameAsCurrentAddress}
                  />
                </div>
              </div>
            </section>

            {/* PARENT / GUARDIAN INFORMATION */}
            <section className="mb-10">
              <h4 className="mb-5 flex items-center gap-2 border-b border-gray-200 pb-3 text-lg font-bold text-[#063b2b] sm:text-xl">
                <span>👨‍👩‍👧</span> Parent&apos;s / Guardian Information
              </h4>

              <GuardianCard title="Father's Information" />
              <GuardianCard title="Mother's Information" />
              <GuardianCard title="Legal Guardian's Information (if applicable)" />
            </section>

            {/* FORM ACTION CONTROLS */}
            <div className="flex flex-col-reverse gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href="/enroll"
                className="rounded-lg border border-gray-300 bg-white px-6 py-3.5 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
              >
                ← Back to Track Selection
              </Link>

              <button
                type="submit"
                className="cursor-pointer rounded-lg bg-linear-to-r from-[#176b4d] via-[#1b7e5a] to-[#12583e] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#176b4d]/25 transition-all duration-300 hover:scale-[1.02] hover:bg-[#12583e] hover:shadow-[0_0_20px_rgba(23,107,77,0.4)]"
              >
                Continue to Requirements →
              </button>
            </div>
          </form>
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

export default function EnrollmentFormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#05170d] text-[#c8b27c]">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#c8b27c] border-t-transparent"></div>
            <p className="mt-3 text-sm font-semibold">Loading enrollment form...</p>
          </div>
        </div>
      }
    >
      <FormContent />
    </Suspense>
  );
}

/* ============================================================= */
/* REUSABLE FORM INPUT                                           */
/* ============================================================= */

function FormInput({
  label,
  placeholder,
  type = "text",
  value,
  defaultValue,
  onChange,
  required = false,
  readOnly = false,
  disabled = false,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-700">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        disabled={disabled}
        className="portal-input"
      />
    </div>
  );
}

/* ============================================================= */
/* REUSABLE FORM CHECKBOX                                        */
/* ============================================================= */

function FormCheckbox({ label }: { label: string }) {
  return (
    <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 transition hover:border-[#176b4d]/40 hover:bg-emerald-50/30">
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#176b4d] focus:ring-1 focus:ring-[#176b4d]"
      />
      <span className="text-sm font-medium text-gray-700 transition group-hover:text-gray-900">
        {label}
      </span>
    </label>
  );
}

/* ============================================================= */
/* GUARDIAN CARD COMPONENT                                       */
/* ============================================================= */

function GuardianCard({ title }: { title: string }) {
  return (
    <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50/70 p-5 sm:p-6">
      <h5 className="mb-4 text-xs font-bold uppercase tracking-wider text-[#176b4d]">
        {title}
      </h5>

      <div className="grid gap-5 md:grid-cols-3">
        <FormInput label="LAST NAME" placeholder="Dela Cruz" />
        <FormInput label="FIRST NAME" placeholder="Juan" />
        <FormInput label="MIDDLE NAME" placeholder="Santos" />

        <div className="md:col-span-3">
          <FormInput
            label="CONTACT NUMBER"
            type="tel"
            placeholder="e.g., 09123456789"
          />
        </div>
      </div>
    </div>
  );
}