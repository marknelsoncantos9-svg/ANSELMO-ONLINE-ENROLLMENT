"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<"idle" | "checking" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isInserting, setIsInserting] = useState(false);
  const [insertMessage, setInsertMessage] = useState("");
  const [insertStatus, setInsertStatus] = useState<"idle" | "ok" | "error">("idle");

  const runCheck = async () => {
    setStatus("checking");
    setMessage("");

    const { count, error } = await supabase
      .from("student_applications")
      .select("id", { count: "exact", head: true });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    setStatus("ok");
    setMessage(`Connected successfully! ${count ?? 0} application record(s) found in student_applications table.`);
  };

  const testInsert = async () => {
    setIsInserting(true);
    setInsertMessage("");
    setInsertStatus("idle");

    try {
      // 1. Try server API route first
      const res = await fetch("/api/submit-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: "Test",
          lastName: "Student",
          email: "test.student@example.com",
          selectedTrack: "Academic Track - STEM",
          currentAddress: {
            houseNo: "123",
            street: "Sample St",
            barangay: "Sample Brgy",
            municipality: "Sample City",
            province: "Batangas",
            zipCode: "4200",
          },
        }),
      });

      const data = await res.json();

      if (data.success && data.id) {
        setInsertStatus("ok");
        setInsertMessage(`✓ Success! Test application saved to student_applications table (ID: ${data.id}).`);
        runCheck();
        return;
      }

      // If server route reported an error
      const errorMsg = data.error || "Unknown error";
      setInsertStatus("error");

      if (errorMsg.includes("row-level security") || data.code === "42501") {
        setInsertMessage(
          `⚠️ Supabase RLS is blocking inserts.\n\nQuick Fix: In Supabase Dashboard -> SQL Editor, run:\nALTER TABLE public.student_applications DISABLE ROW LEVEL SECURITY;\n\nOR add SUPABASE_SERVICE_ROLE_KEY to .env.local`
        );
      } else {
        setInsertMessage(`⚠️ Error saving: ${errorMsg}`);
      }
    } catch (err: unknown) {
      setInsertStatus("error");
      setInsertMessage(
        err instanceof Error ? err.message : "Network error testing insert."
      );
    } finally {
      setIsInserting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#05170d] px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-gray-900 shadow-2xl">
        <h1 className="text-xl font-bold text-[#063b2b]">Supabase Connection & Insert Test</h1>
        <p className="mt-1 text-sm text-gray-500">
          Target table: <code>student_applications</code>
        </p>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={runCheck}
            disabled={status === "checking"}
            className="w-full rounded-xl bg-[#176b4d] py-3 text-sm font-bold text-white transition hover:bg-[#0f573d] disabled:opacity-70"
          >
            {status === "checking" ? "Checking connection..." : "1. Check Table Connection"}
          </button>

          <button
            type="button"
            onClick={testInsert}
            disabled={isInserting}
            className="w-full rounded-xl border-2 border-[#176b4d] bg-emerald-50 py-3 text-sm font-bold text-[#176b4d] transition hover:bg-emerald-100 disabled:opacity-70"
          >
            {isInserting ? "Inserting test record..." : "2. Test Insert into student_applications"}
          </button>
        </div>

        {message && (
          <div
            className={`mt-4 rounded-xl border p-4 text-sm ${
              status === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {status === "ok" ? "✓ " : "⚠️ "}
            {message}
          </div>
        )}

        {insertMessage && (
          <div
            className={`mt-4 whitespace-pre-line rounded-xl border p-4 text-sm ${
              insertStatus === "ok"
                ? "border-emerald-200 bg-emerald-50 font-medium text-emerald-800"
                : "border-amber-300 bg-amber-50 text-amber-900"
            }`}
          >
            {insertMessage}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
          <p className="font-bold text-gray-800">Note about Row Level Security (RLS):</p>
          <p className="mt-1">
            If Supabase returns <code>42501 (new row violates row-level security policy)</code>, paste this one command into your Supabase SQL Editor and click <strong>Run</strong>:
          </p>
          <code className="mt-2 block rounded bg-gray-200 p-2 font-mono text-gray-800 select-all whitespace-pre-wrap">
            ALTER TABLE public.student_applications ALTER COLUMN user_id DROP NOT NULL;
            ALTER TABLE public.student_applications DISABLE ROW LEVEL SECURITY;
          </code>
        </div>
      </div>
    </main>
  );
}
