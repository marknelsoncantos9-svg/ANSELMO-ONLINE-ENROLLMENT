"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";


async function uploadRequirement(file: File, folder: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;

  const { data, error } = await supabase.storage
    .from("enrollment-documents")
    .upload(path, file, {
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (error) {
    console.error("Upload failed:", error.message);
    alert("Upload failed: " + error.message);
    return;
  }

  console.log("Uploaded successfully:", data.path);
}

export default function RequirementsPage() {
  const router = useRouter();
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

    const email =
      typeof window !== "undefined" ? localStorage.getItem("studentEmail") || "" : "";
    const studentName =
      typeof window !== "undefined" ? localStorage.getItem("studentName") || "Student" : "Student";
    const track =
      typeof window !== "undefined"
        ? localStorage.getItem("studentTrack") || "Senior High Track"
        : "Senior High Track";
    const applicationId =
      typeof window !== "undefined"
        ? localStorage.getItem("applicationId") || localStorage.getItem("enrollmentId")
        : null;

    // 1. Upload the requirement documents to Supabase Storage.
    let reportCardUrl: string | null = null;
    let birthCertificateUrl: string | null = null;
    let otherRequirementUrl: string | null = null;

    try {
      if (reportCard) reportCardUrl = await uploadRequirement(reportCard, "report-card");
      if (birthCertificate)
        birthCertificateUrl = await uploadRequirement(birthCertificate, "birth-certificate");
      if (otherRequirements)
        otherRequirementUrl = await uploadRequirement(otherRequirements, "other");
    } catch (uploadError) {
      console.warn("Could not upload requirement documents:", uploadError);
    }

    // 2. Attach the requirement results to the student_applications record.
    try {
      const fullRequirementsPayload: Record<string, unknown> = {
        report_card_url: reportCardUrl,
        birth_certificate_url: birthCertificateUrl,
        other_requirement_url: otherRequirementUrl,
        requirements_submitted: true,
        status: "Under Review",
      };

      if (applicationId) {
        let updateResult = await supabase
          .from("student_applications")
          .update(fullRequirementsPayload)
          .eq("id", applicationId);

        if (updateResult.error && updateResult.error.code === "PGRST204") {
          // Extra columns might not exist yet; try updating status with fallback
          updateResult = await supabase
            .from("student_applications")
            .update({ status: "pending" })
            .eq("id", applicationId);
        } else if (updateResult.error && updateResult.error.code === "23514") {
          // Status constraint in DB might only allow lowercase 'pending'
          const restWithoutStatus = { ...fullRequirementsPayload };
          delete restWithoutStatus.status;
          updateResult = await supabase
            .from("student_applications")
            .update({ ...restWithoutStatus, status: "pending" })
            .eq("id", applicationId);
        }

        if (updateResult.error) {
          console.warn("Requirements update notice:", updateResult.error.message);
        }
      } else if (email) {
        // Fallback: no earlier record was saved (e.g. form step failed).
        const draftRaw =
          typeof window !== "undefined"
            ? localStorage.getItem("studentApplicationDraft")
            : null;
        const draft = draftRaw ? JSON.parse(draftRaw) : {};
        const current = draft.currentAddress || {};
        const permanent = draft.permanentAddress || {};
        const guardians = draft.guardians || [{}, {}, {}];

        const formattedAddress = [
          current.houseNo,
          current.street,
          current.barangay ? `Brgy. ${current.barangay}` : "",
          current.municipality,
          current.province,
          current.zipCode,
        ]
          .filter(Boolean)
          .join(", ");

        const baseFallback: Record<string, unknown> = {
          first_name: draft.firstName || "",
          middle_name: draft.middleName || null,
          last_name: draft.lastName || "",
          birth_date: draft.birthDate || null,
          sex: draft.gender || null,
          contact_number: draft.contactNumber || null,
          address: formattedAddress || null,
          status: "Under Review",
          submitted_at: new Date().toISOString(),
        };

        let insertResult = await supabase.from("student_applications").insert({
          ...baseFallback,
          email,
          track,
          extension: draft.extension || null,
          place_of_birth: draft.placeOfBirth || null,
          gender: draft.gender || null,
          religion: draft.religion || null,
          is_ip_community: draft.isIpCommunity || false,
          is_4ps_beneficiary: draft.is4psBeneficiary || false,
          current_house_no: current.houseNo || null,
          current_street: current.street || null,
          current_barangay: current.barangay || null,
          current_municipality: current.municipality || null,
          current_province: current.province || null,
          current_country: current.country || null,
          current_zip_code: current.zipCode || null,
          same_as_current_address: draft.sameAsCurrentAddress || false,
          permanent_house_no: permanent.houseNo || null,
          permanent_street: permanent.street || null,
          permanent_barangay: permanent.barangay || null,
          permanent_municipality: permanent.municipality || null,
          permanent_province: permanent.province || null,
          permanent_country: permanent.country || null,
          permanent_zip_code: permanent.zipCode || null,
          father_last_name: guardians[0]?.lastName || null,
          father_first_name: guardians[0]?.firstName || null,
          father_middle_name: guardians[0]?.middleName || null,
          father_contact_number: guardians[0]?.contactNumber || null,
          mother_last_name: guardians[1]?.lastName || null,
          mother_first_name: guardians[1]?.firstName || null,
          mother_middle_name: guardians[1]?.middleName || null,
          mother_contact_number: guardians[1]?.contactNumber || null,
          guardian_last_name: guardians[2]?.lastName || null,
          guardian_first_name: guardians[2]?.firstName || null,
          guardian_middle_name: guardians[2]?.middleName || null,
          guardian_contact_number: guardians[2]?.contactNumber || null,
          ...fullRequirementsPayload,
        });

        if (insertResult.error && insertResult.error.code === "PGRST204") {
          insertResult = await supabase
            .from("student_applications")
            .insert(baseFallback);
        }

        if (insertResult.error) throw insertResult.error;
      }
    } catch (dbError) {
      console.warn("Could not save requirements to Supabase:", dbError);
    }

    // 3. Generate the account and email the credentials.
    try {
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
    }

    router.push("/enroll/account");
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
                  The PSA Birth Certificate (Copy) and Original Copy of Grade 10
                  Report Card are required. Form 137 is optional for transferees
                  because it is normally handled through a school-to-school
                  transaction. Make sure uploaded files are clear and readable.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================== */}
          {/* DOCUMENTS                                            */}
          {/* =================================================== */}

          <div className="space-y-6">



            {/* 1. PSA BIRTH CERTIFICATE */}

            <RequirementUpload
              number="1"
              title="PSA Birth Certificate (Copy)"
              description="Upload a clear and readable copy of your PSA-issued birth certificate."
              required
              file={birthCertificate}
              onChange={setBirthCertificate}
            />

            {/* 2. GRADE 10 REPORT CARD */}

            <RequirementUpload
              number="2"
              title="Original Copy of Grade 10 Report Card"
              description="Submit the original copy of your Grade 10 report card as a required enrollment document."
              required
              file={reportCard}
              onChange={setReportCard}
            />

            {/* 3. FORM 137 — OPTIONAL FOR TRANSFEREES */}

            <RequirementUpload
              number="3"
              title="Form 137 (Transferees Only)"
              description="Optional upload. Form 137 is normally requested through a school-to-school transaction. You may coordinate with your previous school and the registrar about submitting it."
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
              <li>• Required: PSA Birth Certificate (Copy).</li>
              <li>• Required: Original Copy of Grade 10 Report Card.</li>
              <li>• Optional: Form 137 for transferees.</li>
              <li>• Upload clear, complete, and readable files.</li>
              <li>• Confirm your selected documents before submitting.</li>
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
