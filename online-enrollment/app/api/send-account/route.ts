import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      studentName = "Student",
      track = "Senior High Track",
      password: customPassword,
    } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Generate or use supplied temporary password
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const generatedPassword =
      typeof customPassword === "string" && customPassword.trim().length >= 6
        ? customPassword.trim()
        : `AASMNHS-${randomDigits}`;

    // 2. Synchronize account in Supabase Auth using Service Role Admin
    let authRegistered = false;
    let authUserId: string | null = null;
    let authNotice: string | null = null;

    try {
      const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        "https://tmrimwhwwvojbsztnbxf.supabase.co";
      const supabaseKey =
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "";

      const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });

      // Check if user already exists
      const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = userList?.users?.find(
        (u) => u.email?.toLowerCase() === cleanEmail
      );

      if (existingUser) {
        // Update the password for the existing user
        const { data: updated, error: updateErr } =
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
            password: generatedPassword,
            user_metadata: {
              full_name: studentName,
              track: track,
            },
          });

        if (updateErr) {
          authNotice = `Update existing user notice: ${updateErr.message}`;
        } else {
          authRegistered = true;
          authUserId = updated?.user?.id || existingUser.id;
        }
      } else {
        // Create a new user with confirmed email
        const { data: created, error: createErr } =
          await supabaseAdmin.auth.admin.createUser({
            email: cleanEmail,
            password: generatedPassword,
            email_confirm: true,
            user_metadata: {
              full_name: studentName,
              track: track,
            },
          });

        if (createErr) {
          authNotice = `Create user notice: ${createErr.message}`;
        } else {
          authRegistered = true;
          authUserId = created?.user?.id || null;
        }
      }
    } catch (authError) {
      console.warn("Supabase Auth admin operation notice:", authError);
      authNotice =
        authError instanceof Error ? authError.message : "Auth sync error";
    }

    // 3. SMTP email dispatch
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER?.trim() || "";
    const smtpPass = (process.env.SMTP_PASS || "").replace(/\s+/g, "").trim();

    // Determine if SMTP is configured with real credentials (not placeholders)
    const isConfigured =
      Boolean(smtpUser) &&
      Boolean(smtpPass) &&
      smtpUser !== "your-email@example.com" &&
      smtpPass !== "your-gmail-app-password";

    const fromAddress =
      process.env.EMAIL_FROM ||
      (smtpUser
        ? `"AASMNHS Online Enrollment" <${smtpUser}>`
        : '"AASMNHS Online Enrollment" <marknelsoncantos9@gmail.com>');

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_URL ||
      "http://localhost:3000";
    const loginUrl = `${appUrl.startsWith("http") ? appUrl : `https://${appUrl}`}/login`;

    let emailSent = false;
    let emailError: string | null = null;

    if (isConfigured) {
      try {
        const isGmail =
          smtpHost.toLowerCase().includes("gmail") ||
          smtpUser.toLowerCase().includes("gmail.com");

        const transporter = nodemailer.createTransport(
          isGmail
            ? {
                service: "gmail",
                auth: {
                  user: smtpUser,
                  pass: smtpPass,
                },
              }
            : {
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                  user: smtpUser,
                  pass: smtpPass,
                },
                connectionTimeout: 10000,
                greetingTimeout: 10000,
              }
        );

        const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Student Account Credentials</title>
</head>
<body style="margin: 0; padding: 0; background-color: #051a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #051a0f; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.3);" cellspacing="0" cellpadding="0">
          
          <!-- HEADER -->
          <tr>
            <td style="background: linear-gradient(135deg, #063b2b 0%, #176b4d 100%); padding: 36px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; line-height: 1.3;">
                Anselmo A. Sandoval Memorial<br>National High School
              </h1>
              <div style="margin-top: 10px; display: inline-block; padding: 4px 14px; background-color: rgba(200, 178, 124, 0.25); border: 1px solid rgba(200, 178, 124, 0.5); border-radius: 20px;">
                <span style="color: #f3ebd9; font-size: 13px; font-weight: 600; letter-spacing: 0.5px;">
                  ONLINE ENROLLMENT PORTAL
                </span>
              </div>
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td style="padding: 32px 30px; background-color: #ffffff;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #111827;">
                Dear <strong>${studentName}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                Your enrollment application for <strong>${track}</strong> has been received by Anselmo A. Sandoval Memorial National High School.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #4b5563;">
                An official student portal account has been created for you. You can use these credentials to sign in, monitor your application status, and view announcements:
              </p>

              <!-- CREDENTIALS BOX -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f9f6; border: 2px solid #c8e6c9; border-left: 6px solid #176b4d; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #176b4d; letter-spacing: 1px; margin-bottom: 12px;">
                      STUDENT PORTAL LOGIN DETAILS
                    </div>
                    
                    <div style="margin-bottom: 12px;">
                      <span style="display: block; font-size: 12px; color: #6b7280; font-weight: 600;">REGISTERED EMAIL:</span>
                      <span style="font-size: 15px; font-weight: bold; color: #063b2b; font-family: monospace;">${cleanEmail}</span>
                    </div>

                    <div>
                      <span style="display: block; font-size: 12px; color: #6b7280; font-weight: 600;">TEMPORARY PASSWORD:</span>
                      <span style="display: inline-block; margin-top: 4px; padding: 6px 14px; background-color: #e8f5e9; border: 1px dashed #176b4d; border-radius: 6px; font-size: 18px; font-weight: 800; color: #063b2b; letter-spacing: 1.5px; font-family: monospace;">
                        ${generatedPassword}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- ACTION BUTTON -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: inline-block; background-color: #176b4d; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 10px rgba(23, 107, 77, 0.3);">
                      Go to Student Login Portal →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- SECURITY NOTICE -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 8px; font-size: 12px; color: #92400e; line-height: 1.6;">
                <strong>⚠️ Security Notice:</strong> Please keep this password confidential. We strongly recommend changing your temporary password immediately upon your first login.
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: bold; color: #374151;">
                Anselmo A. Sandoval Memorial National High School
              </p>
              <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.5;">
                Mabini, Batangas • DepEd Region IV-A CALABARZON<br>
                This is an automated enrollment notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
        `;

        await transporter.sendMail({
          from: fromAddress,
          to: cleanEmail,
          subject: "Your Student Account Credentials - AASMNHS Online Enrollment",
          html: htmlTemplate,
          text: `Dear ${studentName},\n\nYour enrollment application for ${track} has been received by Anselmo A. Sandoval Memorial National High School.\n\nYour Student Portal Login Credentials:\nRegistered Email: ${cleanEmail}\nTemporary Password: ${generatedPassword}\n\nLogin Portal: ${loginUrl}\n\nPlease keep this password secure.\n\nAnselmo A. Sandoval Memorial National High School\nMabini, Batangas • DepEd Region IV-A`,
        });

        emailSent = true;
      } catch (err: unknown) {
        console.error("Nodemailer SMTP dispatch error:", err);
        emailError =
          err instanceof Error ? err.message : "SMTP sendMail error";
      }
    } else {
      console.log(
        `[SMTP Simulated] Email credentials generated for ${cleanEmail}: ${generatedPassword} (Configure SMTP_USER & SMTP_PASS in .env.local to send live emails)`
      );
    }

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      studentName,
      password: generatedPassword,
      emailSent,
      emailConfigured: isConfigured,
      emailError,
      authRegistered,
      authUserId,
      authNotice,
      message: emailSent
        ? `Account confirmation email with temporary password has been sent to ${cleanEmail}.`
        : isConfigured
        ? `Could not send email: ${emailError || "Unknown error"}. Your password is shown below.`
        : `Temporary password created for ${cleanEmail}. (To send live emails, add your Gmail App Password to SMTP_PASS in .env.local).`,
    });
  } catch (error: unknown) {
    console.error("Error in send-account route:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Server error sending confirmation",
      },
      { status: 500 }
    );
  }
}
