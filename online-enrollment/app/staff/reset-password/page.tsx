"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
    LockKeyhole,
    Eye,
    EyeOff,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

export default function StaffResetPasswordPage() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        async function verifyRecoveryLink() {
            try {
                const url = new URL(window.location.href);
                const code = url.searchParams.get("code");
                const tokenHash = url.searchParams.get("token_hash");
                const type = url.searchParams.get("type");
                const hashParams = new URLSearchParams(
                    url.hash.startsWith("#") ? url.hash.slice(1) : url.hash
                );

                // PKCE flow: exchange the one-time authorization code.
                if (code) {
                    const { error: exchangeError } =
                        await supabase.auth.exchangeCodeForSession(code);

                    if (exchangeError) throw exchangeError;
                } else if (tokenHash && type === "recovery") {
                    // Token-hash flow, if the email template uses it.
                    const { error: verifyError } = await supabase.auth.verifyOtp({
                        token_hash: tokenHash,
                        type: "recovery",
                    });

                    if (verifyError) throw verifyError;
                } else {
                    // Implicit flow: access token may be in the URL fragment.
                    const accessToken = hashParams.get("access_token");
                    const refreshToken = hashParams.get("refresh_token");
                    const hashType = hashParams.get("type");

                    if (
                        accessToken &&
                        refreshToken &&
                        (!hashType || hashType === "recovery")
                    ) {
                        const { error: sessionError } =
                            await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            });

                        if (sessionError) throw sessionError;
                    }
                }

                const {
                    data: { session },
                    error: sessionError,
                } = await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (!session) {
                    throw new Error(
                        "The reset link is invalid, expired, or already used. Request a new reset email and open the newest link in this same browser."
                    );
                }

                if (active) {
                    setReady(true);

                    // Remove sensitive tokens/codes from the visible address bar.
                    window.history.replaceState(
                        {},
                        document.title,
                        window.location.pathname
                    );
                }
            } catch (err: unknown) {
                if (active) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Could not verify the reset link. Please request a new one."
                    );
                }
            }
        }

        void verifyRecoveryLink();

        return () => {
            active = false;
        };
    }, []);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setMessage("");

        if (password.length < 8) {
            setError("Your password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("The passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password,
            });

            if (updateError) throw updateError;

            setMessage("Password updated successfully. Redirecting to staff login...");

            await supabase.auth.signOut();

            window.setTimeout(() => {
                router.replace("/staff/login");
            }, 1500);
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not update your password. Request a new reset link."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05170d] px-4 py-10 text-[#f4ede0]">
            <div
                className="fixed inset-0 bg-cover bg-center brightness-50"
                style={{ backgroundImage: "url('/school.jpg')" }}
            />
            <div className="fixed inset-0 bg-gradient-to-b from-[#051b0f]/90 via-[#072415]/90 to-[#04120a]/95" />

            <section className="relative z-10 w-full max-w-md rounded-2xl border border-[#c8b27c]/35 bg-[#071d13]/95 p-7 shadow-2xl backdrop-blur-md sm:p-8">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#c8b27c]/40 bg-[#c8b27c]/10">
                        <LockKeyhole size={27} className="text-[#c8b27c]" />
                    </div>

                    <h1 className="text-2xl font-extrabold">Reset Your Password</h1>
                    <p className="mt-2 text-sm text-[#bdc9bf]">
                        Create a new password for your staff account.
                    </p>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-4 flex gap-2 rounded-lg border border-red-300/30 bg-red-300/10 p-3 text-sm text-red-100"
                    >
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div
                        role="status"
                        className="mb-4 flex gap-2 rounded-lg border border-green-300/30 bg-green-300/10 p-3 text-sm text-green-100"
                    >
                        <CheckCircle2 size={18} className="shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {!ready && !error && (
                    <p className="text-center text-sm text-[#bdc9bf]">
                        Verifying your reset link. Please wait...
                    </p>
                )}

                {ready && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <label className="block">
                            <span className="mb-2 block text-xs font-bold uppercase tracking-wider">
                                New Password
                            </span>

                            <span className="relative block">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full rounded-lg border border-[#c8b27c]/30 bg-[#06150d] px-4 py-3 pr-12 text-sm text-white outline-none focus:border-[#c8b27c]"
                                />

                                <button
                                    type="button"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c8b27c]"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </span>
                        </label>

                        <label className="block">
                            <span className="mb-2 block text-xs font-bold uppercase tracking-wider">
                                Confirm New Password
                            </span>

                            <input
                                type="password"
                                autoComplete="new-password"
                                minLength={8}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter new password"
                                className="w-full rounded-lg border border-[#c8b27c]/30 bg-[#06150d] px-4 py-3 text-sm text-white outline-none focus:border-[#c8b27c]"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-[#c8b27c] py-3.5 text-sm font-extrabold text-[#071d13] transition hover:bg-[#ddca91] disabled:opacity-60"
                        >
                            {loading ? "Updating Password..." : "Save New Password"}
                        </button>
                    </form>
                )}

                <button
                    type="button"
                    onClick={() => router.replace("/staff/login")}
                    className="mt-5 w-full text-center text-sm text-[#c8b27c] hover:underline"
                >
                    Back to Staff Login
                </button>
            </section>
        </main>
    );
}