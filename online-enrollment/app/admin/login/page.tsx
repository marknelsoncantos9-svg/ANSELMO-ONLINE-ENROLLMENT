"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter your admin email and password.");
      return;
    }

    localStorage.setItem("adminLoggedIn", "true");
    localStorage.setItem("adminEmail", email.trim());
    router.push("/admin");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f7f5] px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#123d2d]">AASMNHS</h1>
          <p className="text-xs text-gray-500">ICT Administration Portal</p>
        </div>

        <h2 className="mt-8 text-2xl font-bold text-[#123d2d]">Admin Sign In</h2>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to manage enrollment records.
        </p>

        {errorMessage && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
              Admin Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aasmnhs.edu.ph"
              className="portal-input"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="portal-input"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-[#176b4d] py-3.5 text-sm font-bold text-white transition hover:bg-[#0f573d]"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center text-xs text-gray-500">
          <Link href="/" className="font-bold text-[#176b4d] hover:underline">
            ← Back to Portal Home
          </Link>
        </div>
      </div>
    </main>
  );
}
