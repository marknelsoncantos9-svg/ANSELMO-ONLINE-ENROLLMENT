
"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  LockKeyhole,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function StaffLoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState(
    params.get("error") === "unauthorized"
      ? "This account is not authorized for the staff portal."
      : ""
  );

  const [notice, setNotice] = useState("");

  // STAFF SIGN IN
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setNotice("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (authError || !data.user) {
        setError(
          "Incorrect email or password. Please check your credentials."
        );
        return;
      }

      // Verify the user's actual role in Supabase.
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        setError(
          "Your staff profile could not be verified. Contact the ICT Admin."
        );
        return;
      }

      const role = String(profile.role ?? "").toLowerCase();

      if (!["staff", "registrar"].includes(role)) {
        await supabase.auth.signOut();
        setError(
          "This account is not authorized for the staff portal. Contact the ICT Admin."
        );
        return;
      }

      router.replace("/staff/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during sign-in."
      );
    } finally {
      setLoading(false);
    }
  }

  // SEND PASSWORD RESET EMAIL
  async function resetPassword() {
    const cleanEmail = email.trim().toLowerCase();

    setError("");
    setNotice("");

    if (!cleanEmail) {
      setError("Enter your staff email address first.");
      return;
    }

    setResetLoading(true);

    try {
      // This must match the allowed Redirect URL in Supabase.
      const redirectTo = `${window.location.origin}/staff/reset-password`;

      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo,
        });

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setNotice(
        "If the account exists, a password-reset link has been sent. Check your inbox and spam folder."
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to request a password reset. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05170d] px-4 py-10 text-[#f4ede0]">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-cover bg-center brightness-50"
        style={{ backgroundImage: "url('/school.jpg')" }}
      />

      <div className="fixed inset-0 bg-gradient-to-b from-[#051b0f]/90 via-[#072415]/90 to-[#04120a]/95" />

      <div className="relative z-10 w-full max-w-md">
        {/* School branding */}
        <div className="mb-6 flex justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-[#c8b27c] bg-white">
              <Image
                src="/school-logo.png"
                alt="AASMNHS school logo"
                fill
                className="object-contain p-1"
              />
            </div>

            <div>
              <p className="font-extrabold tracking-wide">AASMNHS</p>
              <p className="text-xs text-[#c8b27c]">Registrar Portal</p>
            </div>
          </Link>
        </div>

        {/* Login card */}
        <section className="rounded-2xl border border-[#c8b27c]/35 bg-[#071d13]/95 p-7 shadow-2xl backdrop-blur-md sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#c8b27c]/40 bg-[#c8b27c]/10">
              <LockKeyhole className="text-[#c8b27c]" />
            </div>

            <h1 className="text-2xl font-extrabold">Staff Sign In</h1>

            <p className="mt-2 text-sm text-[#bdc9bf]">
              Authorized School Registrar access only
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="mb-4 flex gap-2 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-xs text-red-100"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success / information message */}
          {notice && (
            <div
              role="status"
              className="mb-4 flex gap-2 rounded-lg border border-green-300/30 bg-green-300/10 p-3 text-xs text-green-100"
            >
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#d7dfd6]">
                Staff Email
              </span>

              <span className="relative block">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9eafa2]"
                />

                <input
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="registrar@school.edu.ph"
                  className="w-full rounded-lg border border-[#c8b27c]/30 bg-[#06150d] py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-[#718576] focus:border-[#c8b27c]"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#d7dfd6]">
                Password
              </span>

              <span className="relative block">
                <LockKeyhole
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9eafa2]"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter staff password"
                  className="w-full rounded-lg border border-[#c8b27c]/30 bg-[#06150d] py-3 pl-10 pr-11 text-sm text-white outline-none placeholder:text-[#718576] focus:border-[#c8b27c]"
                />

                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c8b27c]"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </span>
            </label>

            <button
              disabled={loading || resetLoading}
              type="submit"
              className="w-full rounded-lg bg-[#c8b27c] py-3.5 text-sm font-extrabold text-[#071d13] transition hover:bg-[#ddca91] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In to Registrar Portal →"}
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-4 text-center">
            <button
              type="button"
              disabled={loading || resetLoading}
              onClick={resetPassword}
              className="text-sm font-semibold text-[#c8b27c] underline-offset-4 hover:underline disabled:opacity-60"
            >
              {resetLoading
                ? "Sending reset link..."
                : "Forgot password? Reset it by email"}
            </button>
          </div>

          <p className="mt-5 text-center text-xs leading-5 text-[#9eafa2]">
            Staff accounts are authorized by the ICT Administrator. Use your
            assigned credentials to proceed.
          </p>
        </section>

        <p className="mt-5 text-center text-xs text-[#c8b27c]">
          <Link href="/" className="hover:underline">
            ← Back to Home
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#05170d] text-[#c8b27c]">
          Loading...
        </div>
      }
    >
      <StaffLoginForm />
    </Suspense>
  );
}