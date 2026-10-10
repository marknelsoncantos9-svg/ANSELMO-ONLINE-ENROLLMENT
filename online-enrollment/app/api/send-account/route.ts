import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, studentName = "Student", track = "Senior High Track" } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // Generate an automatic temporary password
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generatedPassword = `AASMNHS-${randomDigits}`;

    // Optionally register user in Supabase Auth
    try {
      if (supabase && supabase.auth) {
        await supabase.auth.signUp({
          email,
          password: generatedPassword,
          options: {
            data: {
              full_name: studentName,
              track: track,
            },
          },
        });
      }
    } catch (supabaseError) {
      console.warn("Supabase auth sign up notice:", supabaseError);
    }

    // SMTP configuration check
    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT || 587);
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD;
    const fromAddress = process.env.EMAIL_FROM || smtpUser || '"AASMNHS Enrollment" <no-reply@aasmns.edu.ph>';

    let emailSent = false;
    let emailError: string | null = null;

    if (smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost || "smtp.gmail.com",
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f7faf8; border-radius: 12px; border: 1px solid #d1e7dd;">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #176b4d;">
              <h2 style="color: #063b2b; margin: 0; font-size: 22px;">Anselmo A. Sandoval Memorial National High School</h2>
              <p style="color: #176b4d; margin: 6px 0 0 0; font-weight: bold; font-size: 14px;">Online Enrollment System • S.Y. 2025–2026</p>
            </div>

            <div style="padding: 24px 0;">
              <p style="font-size: 16px; color: #2d3748; margin: 0 0 12px 0;">Hello <strong>${studentName}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.6; color: #4a5568;">
                Your enrollment application for <strong>${track}</strong> has been received by Anselmo A. Sandoval Memorial National High School.
              </p>
              <p style="font-size: 14px; line-height: 1.6; color: #4a5568;">
                Below are your auto-generated student portal credentials to access your account:
              </p>

              <div style="background-color: #ffffff; border: 1px solid #c3e6cb; border-left: 5px solid #176b4d; padding: 18px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: #718096; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px;">Login Credentials</p>
                <p style="margin: 0 0 6px 0; font-size: 15px; color: #2d3748;">
                  <strong>Registered Email:</strong> <span style="color: #176b4d; font-family: monospace; font-size: 15px;">${email}</span>
                </p>
                <p style="margin: 0; font-size: 15px; color: #2d3748;">
                  <strong>Temporary Password:</strong> <span style="color: #063b2b; font-family: monospace; font-size: 16px; font-weight: bold; background: #e8f5e9; padding: 3px 8px; border-radius: 4px;">${generatedPassword}</span>
                </p>
              </div>

              <div style="background-color: #fff9db; border: 1px solid #ffe066; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #856404; line-height: 1.5;">
                ⚠️ <strong>Important Reminder:</strong> Please keep this password private and change your temporary password immediately upon your first sign in.
              </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 18px; text-align: center; font-size: 12px; color: #a0aec0;">
              <p style="margin: 0 0 4px 0;">Anselmo A. Sandoval Memorial National High School</p>
              <p style="margin: 0;">Mabini, Batangas • DepEd Region IV-A CALABARZON</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: fromAddress,
          to: email,
          subject: "Your Account Credentials - AASMNHS Online Enrollment",
          html: htmlContent,
          text: `Hello ${studentName},\n\nYour enrollment application for ${track} has been received.\n\nYour Login Credentials:\nEmail: ${email}\nTemporary Password: ${generatedPassword}\n\nPlease keep this password secure and change it after logging in.\n\nAnselmo A. Sandoval Memorial National High School`,
        });

        emailSent = true;
      } catch (err: unknown) {
        console.error("Nodemailer error:", err);
        emailError = err instanceof Error ? err.message : "Failed to send email via SMTP";
      }
    } else {
      console.log(`[SMTP Not Configured] Simulating email delivery for ${email}. Generated password: ${generatedPassword}`);
    }

    return NextResponse.json({
      success: true,
      email,
      studentName,
      password: generatedPassword,
      emailSent,
      emailError,
      message: emailSent
        ? `Account confirmation email with temporary password has been sent to ${email}.`
        : `Temporary password generated for ${email}. (Set SMTP_USER & SMTP_PASS in .env.local to send live emails).`,
    });
  } catch (error: unknown) {
    console.error("Error in send-account route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error sending confirmation" },
      { status: 500 }
    );
  }
}
