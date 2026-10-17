import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
      console.error("RECAPTCHA_SECRET_KEY is not configured.");
      return NextResponse.json(
        { success: false, message: "reCAPTCHA is not configured on the server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const token = typeof body.token === "string" ? body.token : "";
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Please complete the reCAPTCHA checkbox." },
        { status: 400 }
      );
    }

    const googleResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
      cache: "no-store",
    });

    if (!googleResponse.ok) {
      return NextResponse.json(
        { success: false, message: "Could not verify reCAPTCHA. Please try again." },
        { status: 502 }
      );
    }

    const result: { success?: boolean; hostname?: string; [key: string]: unknown } = await googleResponse.json();
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "reCAPTCHA verification failed. Please try again." },
        { status: 403 }
      );
    }

    // Google validates the token and its hostname; the site key must be configured for your domain.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while verifying reCAPTCHA." },
      { status: 500 }
    );
  }
}
