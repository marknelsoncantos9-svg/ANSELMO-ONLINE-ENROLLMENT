"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Download,
  Printer,
  RefreshCw,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";

type Row = Record<string, unknown>;

function csvCell(value: unknown) {
  const text =
    value == null
      ? ""
      : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export default function ReportsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("all");
  const [track, setTrack] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchErr } = await supabase
        .from("student_applications")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(5000);

      if (fetchErr) {
        setError(fetchErr.message);
      } else {
        setRows((data ?? []) as Row[]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error generating reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const rowStatus = String(r.status || "pending").toLowerCase();
      const statusMatches = status === "all" || rowStatus === status;

      const trackString = `${r.track ?? ""} ${r.preferred_strand_id ?? ""} ${r.strand ?? ""} ${r.selected_track ?? ""}`.toLowerCase();

      let trackMatches = true;
      if (track === "academic") {
        trackMatches =
          /academic|stem|abm|humss|gas/i.test(trackString) ||
          (!/tvl|techpro|technical|vocational/i.test(trackString) &&
            trackString.length > 0);
      } else if (track === "techpro") {
        trackMatches = /tvl|techpro|technical|vocational|ict|home economics|industrial/i.test(
          trackString
        );
      }

      return statusMatches && trackMatches;
    });
  }, [rows, status, track]);

  const enrolled = filtered.filter(
    (r) => String(r.status || "").toLowerCase() === "enrolled"
  ).length;

  const pending = filtered.filter((r) =>
    ["pending", "under_review"].includes(
      String(r.status || "pending").toLowerCase()
    )
  ).length;

  const approved = filtered.filter(
    (r) => String(r.status || "").toLowerCase() === "approved"
  ).length;

  function exportCsv() {
    if (!filtered.length) return;

    // Prioritized columns for clean spreadsheet export
    const primaryCols = [
      "id",
      "first_name",
      "middle_name",
      "last_name",
      "email",
      "contact_number",
      "track",
      "status",
      "submitted_at",
      "birth_date",
      "sex",
      "address",
    ];

    const allKeys = Array.from(new Set(filtered.flatMap((r) => Object.keys(r))));
    const otherKeys = allKeys.filter((k) => !primaryCols.includes(k));
    const finalCols = [
      ...primaryCols.filter((k) => allKeys.includes(k)),
      ...otherKeys,
    ];

    const content = [
      finalCols.map(csvCell).join(","),
      ...filtered.map((r) => finalCols.map((k) => csvCell(r[k])).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + content], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AASMNHS-enrollment-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c8b27c]">
            Registrar Workspace
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Generate Reports</h1>
          <p className="mt-2 text-sm text-[#bdc9bf]">
            Filter, summarize, print, or export official enrollment records.
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

      {/* Official Header for Print */}
      <div className="hidden print:block text-center border-b pb-4 mb-6 text-black">
        <h2 className="text-xl font-bold tracking-wide">
          ANSELMO A. SANDOVAL MEMORIAL NATIONAL HIGH SCHOOL
        </h2>
        <p className="text-xs text-gray-600">
          Mabini, Batangas · DepEd Region IV-A CALABARZON
        </p>
        <p className="mt-2 text-sm font-semibold uppercase tracking-wider">
          Official Senior High School Enrollment Summary Report
        </p>
        <p className="text-[11px] text-gray-500">
          Generated: {new Date().toLocaleString()}
        </p>
      </div>

      {error && (
        <p className="flex gap-2 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200 print:hidden">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Summary KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3 print:grid-cols-3">
        {[
          { label: "Records in report", value: filtered.length },
          { label: "Pending review", value: pending },
          { label: "Approved / Enrolled", value: approved + enrolled },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b] p-5 shadow-lg shadow-black/10 print:border-gray-300 print:bg-white print:text-black"
          >
            <p className="text-sm text-[#bdc9bf] print:text-gray-600">{k.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#c8b27c] print:text-black">
              {loading ? "—" : k.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Filters & Export Options */}
      <section className="rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b] p-5 print:hidden">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#c8b27c]/10 p-3">
            <FileSpreadsheet className="text-[#c8b27c]" />
          </div>
          <div>
            <h2 className="font-bold">Report Filters</h2>
            <p className="mt-1 text-xs text-[#9eafa2]">
              Select status and track categories before exporting.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <label className="text-xs text-[#bdc9bf]">
            Enrollment status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-[#c8b27c]/25 bg-[#061b11] px-3 py-3 text-sm text-[#f4ede0] outline-none focus:border-[#c8b27c]"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under review</option>
              <option value="approved">Approved</option>
              <option value="enrolled">Enrolled</option>
              <option value="rejected">Rejected</option>
            </select>
          </label>

          <label className="text-xs text-[#bdc9bf]">
            Track category
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-[#c8b27c]/25 bg-[#061b11] px-3 py-3 text-sm text-[#f4ede0] outline-none focus:border-[#c8b27c]"
            >
              <option value="all">All tracks</option>
              <option value="academic">Academic (STEM, ABM, HUMSS, GAS)</option>
              <option value="techpro">TechPro (TVL ICT, HE, IA, AFA)</option>
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              onClick={load}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#c8b27c]/40 px-3 py-3 text-xs font-semibold hover:bg-white/5"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={exportCsv}
              disabled={loading || filtered.length === 0}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#c8b27c] px-3 py-3 text-xs font-bold text-[#071d13] hover:bg-[#ddca91] disabled:opacity-50"
            >
              <Download size={14} />
              Export CSV
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#c8b27c]/15 pt-4">
          <p className="text-xs text-[#9eafa2]">
            Exports full student details including submitted credentials.
          </p>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-[#c8b27c]/40 px-3 py-2 text-xs hover:bg-white/5"
          >
            <Printer size={14} />
            Print page
          </button>
        </div>
      </section>

      {/* Preview Table */}
      <section className="overflow-hidden rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b] print:border-gray-300 print:bg-white print:text-black">
        <div className="border-b border-[#c8b27c]/20 px-5 py-4 flex items-center justify-between print:border-gray-300">
          <div>
            <h2 className="font-semibold">Report Preview</h2>
            <p className="mt-1 text-xs text-[#9eafa2] print:text-gray-500">
              Showing filtered records for evaluation.
            </p>
          </div>
          <span className="text-xs text-[#c8b27c] font-mono print:text-black">
            {filtered.length} total records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm print:text-xs">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-[#aab9ad] print:bg-gray-100 print:text-gray-700">
              <tr>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Track / Strand</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c8b27c]/10 print:divide-gray-200">
              {filtered.slice(0, 100).map((r) => (
                <tr key={String(r.id)} className="hover:bg-white/5">
                  <td className="px-5 py-4 font-medium print:py-2">
                    {[r.first_name, r.middle_name, r.last_name]
                      .filter(Boolean)
                      .join(" ") || "Unnamed applicant"}
                  </td>
                  <td className="px-5 py-4 text-xs text-[#e7d29a] print:py-2 print:text-black">
                    {String(r.track || r.selected_track || r.strand || r.preferred_strand_id || "Senior High Track")}
                  </td>
                  <td className="px-5 py-4 text-xs capitalize print:py-2">
                    <span className="rounded-full border border-[#c8b27c]/25 bg-white/5 px-2.5 py-1 text-[10px] print:border-gray-400 print:text-black">
                      {String(r.status || "pending").replaceAll("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-[#bdc9bf] print:py-2 print:text-gray-700">
                    {String(r.email || r.contact_number || "—")}
                  </td>
                  <td className="px-5 py-4 text-xs text-[#bdc9bf] print:py-2 print:text-gray-700">
                    {r.submitted_at
                      ? new Date(String(r.submitted_at)).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-[#aab9ad] print:text-gray-500"
                  >
                    No records match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Print Signature Section */}
      <div className="hidden print:grid grid-cols-2 gap-10 mt-12 pt-8 text-black text-xs">
        <div>
          <p className="font-semibold">Prepared by:</p>
          <div className="mt-8 border-b border-black w-48" />
          <p className="mt-1">School Registrar / Staff</p>
        </div>
        <div>
          <p className="font-semibold">Noted by:</p>
          <div className="mt-8 border-b border-black w-48" />
          <p className="mt-1">School Principal / Administrator</p>
        </div>
      </div>
    </div>
  );
}
