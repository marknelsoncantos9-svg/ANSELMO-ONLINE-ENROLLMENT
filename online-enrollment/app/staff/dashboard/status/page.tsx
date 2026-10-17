"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Save, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

type Row = {
  id: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  status?: string | null;
  registrar_remarks?: string | null;
  submitted_at?: string | null;
  [key: string]: unknown;
};

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "enrolled", label: "Enrolled" },
  { value: "rejected", label: "Rejected" },
];

export default function UpdateStatusPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Use select("*") to be completely safe against missing columns
      const { data, error: fetchError } = await supabase
        .from("student_applications")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        const list = (data ?? []) as Row[];
        setRows(list);

        let localRemarks: Record<string, string> = {};
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("staff_registrar_remarks");
            if (raw) localRemarks = JSON.parse(raw);
          } catch {
            // ignore
          }
        }

        const initialDrafts: Record<string, string> = {};
        const initialRemarks: Record<string, string> = {};

        list.forEach((a) => {
          initialDrafts[a.id] = (a.status || "pending").toLowerCase();
          initialRemarks[a.id] =
            (a.registrar_remarks as string) || localRemarks[a.id] || "";
        });

        setDrafts(initialDrafts);
        setRemarks(initialRemarks);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(id: string) {
    setSaving(id);
    setError("");
    setMessage("");

    const targetStatus = drafts[id] || "pending";
    const targetRemark = remarks[id] || "";

    // Save remark locally in case Supabase column does not exist
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("staff_registrar_remarks");
        const existing = raw ? JSON.parse(raw) : {};
        existing[id] = targetRemark;
        localStorage.setItem("staff_registrar_remarks", JSON.stringify(existing));
      } catch {
        // ignore
      }
    }

    try {
      // 1. First try updating both status and registrar_remarks
      let updateResult = await supabase
        .from("student_applications")
        .update({
          status: targetStatus,
          registrar_remarks: targetRemark || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("id")
        .maybeSingle();

      // 2. If it fails because registrar_remarks column does not exist, fallback to status only
      if (
        updateResult.error &&
        (updateResult.error.message?.includes("registrar_remarks") ||
          updateResult.error.code === "PGRST204" ||
          updateResult.error.code === "42703")
      ) {
        updateResult = await supabase
          .from("student_applications")
          .update({
            status: targetStatus,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select("id")
          .maybeSingle();
      }

      if (updateResult.error) {
        if (updateResult.error.message?.includes("check constraint")) {
          setError(
            `Database restriction: Status "${targetStatus}" is not permitted by your Supabase constraint. You can update the check constraint in Supabase SQL editor.`
          );
        } else {
          setError(`Could not save status: ${updateResult.error.message}`);
        }
      } else {
        setMessage(
          `Enrollment status successfully updated to "${targetStatus.replaceAll("_", " ")}".`
        );
        // Update row status in local state
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: targetStatus, registrar_remarks: targetRemark } : r))
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving status update");
    } finally {
      setSaving(null);
    }
  }

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const q = `${r.first_name ?? ""} ${r.middle_name ?? ""} ${r.last_name ?? ""} ${r.id ?? ""}`.toLowerCase();
        return q.includes(search.toLowerCase());
      }),
    [rows, search]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c8b27c]">
            Registrar Workspace
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Update Enrollment Status</h1>
          <p className="mt-2 text-sm text-[#bdc9bf]">
            Evaluate student submissions, set application status, and add remarks.
          </p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#c8b27c]/40 px-4 py-2.5 text-xs font-semibold hover:bg-white/5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {message && (
        <p className="flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-sm text-emerald-100">
          <CheckCircle2 size={17} className="shrink-0" />
          {message}
        </p>
      )}

      {error && (
        <p className="flex gap-2 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student name or application ID…"
          className="flex-1 rounded-lg border border-[#c8b27c]/25 bg-[#0b2a1b] px-4 py-3 text-sm text-[#f4ede0] outline-none placeholder:text-[#829487] focus:border-[#c8b27c]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-[#aab9ad]">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Current Status</th>
                <th className="px-5 py-3">Set Status</th>
                <th className="px-5 py-3">Registrar Remarks</th>
                <th className="px-5 py-3">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c8b27c]/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#aab9ad]">
                    Loading applications…
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={r.id} className="align-top hover:bg-white/5">
                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {[r.first_name, r.middle_name, r.last_name]
                          .filter(Boolean)
                          .join(" ") || "Unnamed applicant"}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-[#c8b27c]">
                        {String(r.id).slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs capitalize">
                      <span className="rounded-full border border-[#c8b27c]/25 bg-white/5 px-2.5 py-1 text-[10px]">
                        {String(r.status || "pending").replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={drafts[r.id] || "pending"}
                        onChange={(e) =>
                          setDrafts((p) => ({
                            ...p,
                            [r.id]: e.target.value,
                          }))
                        }
                        className="rounded-lg border border-[#c8b27c]/25 bg-[#061b11] px-3 py-2.5 text-xs text-[#f4ede0] outline-none focus:border-[#c8b27c]"
                      >
                        {statuses.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <textarea
                        value={remarks[r.id] || ""}
                        onChange={(e) =>
                          setRemarks((p) => ({
                            ...p,
                            [r.id]: e.target.value,
                          }))
                        }
                        rows={2}
                        placeholder="Optional remarks (e.g. Incomplete Form 138, Verified)"
                        className="w-64 resize-y rounded-lg border border-[#c8b27c]/25 bg-[#061b11] px-3 py-2 text-xs text-[#f4ede0] outline-none placeholder:text-[#6a7c70] focus:border-[#c8b27c]"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => save(r.id)}
                        disabled={saving === r.id}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#c8b27c] px-3 py-2 text-xs font-bold text-[#071d13] hover:bg-[#ddca91] disabled:opacity-60"
                      >
                        <Save size={14} />
                        {saving === r.id ? "Saving…" : "Save"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#aab9ad]">
                    No applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
