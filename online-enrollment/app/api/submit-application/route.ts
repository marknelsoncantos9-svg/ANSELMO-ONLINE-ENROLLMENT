import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://tmrimwhwwvojbsztnbxf.supabase.co";

    // Use service role key if available to bypass RLS, otherwise use anon key
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcmltd2h3d3ZvamJzenRuYnhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MjY0MTQsImV4cCI6MjEwNzEwMjQxNH0.OWsP76mlxRpirgO15rcuHBCttR3t7Ql-iW0k_6_0fNw";

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const {
      firstName = "",
      middleName = "",
      lastName = "",
      extension = "",
      email = "",
      birthDate = null,
      placeOfBirth = "",
      gender = "",
      religion = "",
      contactNumber = "",
      selectedTrack = "Senior High Track",
      isIpCommunity = false,
      is4psBeneficiary = false,
      currentAddress = {},
      permanentAddress = {},
      sameAsCurrentAddress = false,
      guardians = [],
    } = body;

    const formattedAddress = [
      currentAddress.houseNo,
      currentAddress.street,
      currentAddress.barangay ? `Brgy. ${currentAddress.barangay}` : "",
      currentAddress.municipality,
      currentAddress.province,
      currentAddress.zipCode,
    ]
      .filter(Boolean)
      .join(", ");

    const basePayload: Record<string, unknown> = {
      first_name: firstName.trim(),
      middle_name: middleName.trim() || null,
      last_name: lastName.trim(),
      birth_date: birthDate || null,
      sex: gender || null,
      contact_number: contactNumber.trim() || null,
      address: formattedAddress || null,
      status: "pending",
      submitted_at: new Date().toISOString(),
    };

    const g0 = guardians[0] || {};
    const g1 = guardians[1] || {};
    const g2 = guardians[2] || {};

    const fullPayload: Record<string, unknown> = {
      ...basePayload,
      email: email.trim() || null,
      track: selectedTrack || null,
      extension: extension.trim() || null,
      place_of_birth: placeOfBirth.trim() || null,
      gender: gender || null,
      religion: religion.trim() || null,
      is_ip_community: Boolean(isIpCommunity),
      is_4ps_beneficiary: Boolean(is4psBeneficiary),
      current_house_no: currentAddress.houseNo || null,
      current_street: currentAddress.street || null,
      current_barangay: currentAddress.barangay || null,
      current_municipality: currentAddress.municipality || null,
      current_province: currentAddress.province || null,
      current_country: currentAddress.country || null,
      current_zip_code: currentAddress.zipCode || null,
      same_as_current_address: Boolean(sameAsCurrentAddress),
      permanent_house_no: permanentAddress.houseNo || null,
      permanent_street: permanentAddress.street || null,
      permanent_barangay: permanentAddress.barangay || null,
      permanent_municipality: permanentAddress.municipality || null,
      permanent_province: permanentAddress.province || null,
      permanent_country: permanentAddress.country || null,
      permanent_zip_code: permanentAddress.zipCode || null,
      father_last_name: g0.lastName?.trim() || null,
      father_first_name: g0.firstName?.trim() || null,
      father_middle_name: g0.middleName?.trim() || null,
      father_contact_number: g0.contactNumber?.trim() || null,
      mother_last_name: g1.lastName?.trim() || null,
      mother_first_name: g1.firstName?.trim() || null,
      mother_middle_name: g1.middleName?.trim() || null,
      mother_contact_number: g1.contactNumber?.trim() || null,
      guardian_last_name: g2.lastName?.trim() || null,
      guardian_first_name: g2.firstName?.trim() || null,
      guardian_middle_name: g2.middleName?.trim() || null,
      guardian_contact_number: g2.contactNumber?.trim() || null,
    };

    // Helper function to perform insert with fallback
    const executeInsert = async (pFull: Record<string, unknown>, pBase: Record<string, unknown>) => {
      let res = await supabaseAdmin
        .from("student_applications")
        .insert(pFull)
        .select("id")
        .single();

      if (res.error && res.error.code === "PGRST204") {
        res = await supabaseAdmin
          .from("student_applications")
          .insert(pBase)
          .select("id")
          .single();
      }

      return res;
    };

    // 1. Try initial insert
    let result = await executeInsert(fullPayload, basePayload);

    // 2. If table requires a non-null user_id (code 23502), auto-provision an auth user
    if (
      result.error &&
      (result.error.code === "23502" ||
        result.error.message?.includes("user_id"))
    ) {
      try {
        let authUserId: string | null = null;
        const targetEmail =
          email && email.includes("@")
            ? email.trim().toLowerCase()
            : `student_${Date.now()}@aasmns.edu.ph`;

        const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
          email: targetEmail,
          password: `AASMNHS-${Math.floor(1000 + Math.random() * 9000)}`,
          email_confirm: true,
          user_metadata: { full_name: `${firstName} ${lastName}`.trim() },
        });

        if (newUser?.user?.id) {
          authUserId = newUser.user.id;
        } else {
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          const existing = list?.users?.find(
            (u) => u.email?.toLowerCase() === targetEmail
          );
          if (existing?.id) {
            authUserId = existing.id;
          }
        }

        if (authUserId) {
          fullPayload.user_id = authUserId;
          basePayload.user_id = authUserId;
          result = await executeInsert(fullPayload, basePayload);
        }
      } catch (authErr) {
        console.warn("Auto-provision auth user failed:", authErr);
      }
    }

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
          code: result.error.code,
          details: result.error.details,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.data.id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
