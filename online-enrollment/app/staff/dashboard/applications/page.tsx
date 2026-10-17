"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Search,
  RefreshCw,
  Eye,
  X,
  FileText,
  ExternalLink,
  AlertCircle,
  User,
  MapPin,
  Users,
} from "lucide-react";

type AppRecord = Record<string, unknown>;

const pretty = (value: unknown) => {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const ignored = new Set([
  "id",
  "user_id",
  "preferred_strand_id",
  "assigned_section_id",
  "submitted_at",
  "updated_at",
]);

export default function ApplicationsPage() {
  const [records, setRecords] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<AppRecord | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error: fetchErr } = await supabase
        .from("student_applications")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(1000);

      if (fetchErr) {
        setError(fetchErr.message);
      } else {
        setRecords((data ?? []) as AppRecord[]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error loading applications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      records.filter((r) => {
        const full = `${r.first_name ?? ""} ${r.middle_name ?? ""} ${r.last_name ?? ""} ${r.email ?? ""} ${r.contact_number ?? ""} ${r.id ?? ""}`.toLowerCase();
        return (
          full.includes(search.toLowerCase()) &&
          (filter === "all" ||
            String(r.status ?? "pending").toLowerCase() === filter)
        );
      }),
    [records, search, filter]
  );

  // Extract file/document URLs
  const fileCandidates = useMemo(() => {
    if (!selected) return [];
    const results: { label: string; url: string }[] = [];

    Object.entries(selected).forEach(([k, v]) => {
      if (
        /file|document|report_card|birth_certificate|requirement|upload|url|path/i.test(
          k
        ) &&
        v &&
        typeof v === "string"
      ) {
        if (/^https?:\/\//i.test(v)) {
          results.push({ label: k.replaceAll("_", " "), url: v });
        } else if (v.trim().length > 0) {
          // Resolve storage URL from public 'requirements' bucket
          const { data } = supabase.storage
            .from("requirements")
            .getPublicUrl(v.trim());
          if (data?.publicUrl) {
            results.push({ label: k.replaceAll("_", " "), url: data.publicUrl });
          }
        }
      }
    });

    return results;
  }, [selected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c8b27c]">
            Registrar Workspace
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Applications & Requirements</h1>
          <p className="mt-2 text-sm text-[#bdc9bf]">
            Review submitted enrollment forms, credentials, and student qualifications.
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

      {error && (
        <div className="flex gap-2 rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b] p-4 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#91a596]"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student name, email, or application ID…"
            className="w-full rounded-lg border border-[#c8b27c]/25 bg-[#061b11] py-3 pl-10 pr-3 text-sm text-[#f4ede0] outline-none placeholder:text-[#829487] focus:border-[#c8b27c]"
          />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-[#c8b27c]/25 bg-[#061b11] px-3 py-3 text-sm text-[#f4ede0] outline-none focus:border-[#c8b27c]"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under review</option>
          <option value="approved">Approved</option>
          <option value="enrolled">Enrolled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b]">
        <div className="flex items-center justify-between border-b border-[#c8b27c]/20 px-5 py-4">
          <h2 className="font-semibold">Submitted Applications</h2>
          <span className="text-xs text-[#c8b27c] font-mono">
            {filtered.length} record{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-[#aab9ad]">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Submitted</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c8b27c]/10">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-[#aab9ad]"
                  >
                    Loading student records…
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((r) => (
                  <tr key={String(r.id)} className="hover:bg-white/5">
                    <td className="px-5 py-4">
                      <p className="font-semibold">
                        {[r.first_name, r.middle_name, r.last_name]
                          .filter(Boolean)
                          .map(String)
                          .join(" ") || "Unnamed applicant"}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-[#c8b27c]">
                        {String(r.id).slice(0, 8)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#bdc9bf]">
                      <p>{String(r.email || "—")}</p>
                      <p className="text-[11px] text-[#8fa194]">
                        {String(r.contact_number || "")}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-[#bdc9bf]">
                      {r.submitted_at
                        ? new Date(String(r.submitted_at)).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-[#c8b27c]/25 bg-white/5 px-2.5 py-1 text-[10px] capitalize">
                        {String(r.status || "pending").replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#c8b27c]/40 px-3 py-2 text-xs font-semibold text-[#e7d29a] hover:bg-[#c8b27c]/10"
                      >
                        <Eye size={14} />
                        View record
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-[#aab9ad]"
                  >
                    No matching applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Inspection Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6"
          onClick={() => setSelected(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#c8b27c]/40 bg-[#071d13] text-[#f4ede0] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#c8b27c]/25 bg-[#071d13] px-5 py-4">
              <div>
                <h2 className="text-lg font-bold">
                  {[selected.first_name, selected.middle_name, selected.last_name]
                    .filter(Boolean)
                    .map(String)
                    .join(" ") || "Student Application"}
                </h2>
                <p className="text-xs text-[#c8b27c] font-mono">
                  ID: {String(selected.id)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-[#bdc9bf] hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Status Pill in Modal */}
            <div className="bg-[#0b2a1b] px-5 py-3 border-b border-[#c8b27c]/15 flex items-center justify-between text-xs">
              <span className="text-[#9eafa2]">Status:</span>
              <span className="font-bold text-[#e7d29a] uppercase tracking-wide">
                {String(selected.status || "pending").replaceAll("_", " ")}
              </span>
            </div>

            {/* Details Grid */}
            <div className="p-5 space-y-6">
              {/* Personal Info */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c8b27c]">
                  <User size={15} /> Student Information
                </h3>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-lg border border-[#c8b27c]/15 bg-[#0b2a1b] p-3">
                    <p className="text-[10px] uppercase text-[#9eafa2]">Full Name</p>
                    <p className="mt-1 text-sm font-semibold">
                      {[selected.first_name, selected.middle_name, selected.last_name, selected.extension]
                        .filter(Boolean)
                        .map(String)
                        .join(" ") || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#c8b27c]/15 bg-[#0b2a1b] p-3">
                    <p className="text-[10px] uppercase text-[#9eafa2]">Track / Strand</p>
                    <p className="mt-1 text-sm font-semibold text-[#e7d29a]">
                      {pretty(selected.track || selected.selected_track || selected.strand || selected.preferred_strand_id)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#c8b27c]/15 bg-[#0b2a1b] p-3">
                    <p className="text-[10px] uppercase text-[#9eafa2]">Birth Date / Sex</p>
                    <p className="mt-1 text-sm">
                      {pretty(selected.birth_date)} · {pretty(selected.sex || selected.gender)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#c8b27c]/15 bg-[#0b2a1b] p-3">
                    <p className="text-[10px] uppercase text-[#9eafa2]">Contact</p>
                    <p className="mt-1 text-sm">
                      {pretty(selected.contact_number)} · {pretty(selected.email)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c8b27c]">
                  <MapPin size={15} /> Address
                </h3>
                <div className="rounded-lg border border-[#c8b27c]/15 bg-[#0b2a1b] p-3 text-sm">
                  {pretty(
                    selected.address ||
                    [
                      selected.current_house_no,
                      selected.current_street,
                      selected.current_barangay,
                      selected.current_municipality,
                      selected.current_province,
                    ]
                      .filter(Boolean)
                      .map(String)
                      .join(", ")
                  )}
                </div>
              </div>

              {/* Parents / Guardians */}
              {Boolean(selected.father_first_name || selected.mother_first_name || selected.guardian_first_name) && (
                <div>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#c8b27c]">
                    <Users size={15} /> Parents &amp; Guardians
                  </h3>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {Boolean(selected.father_first_name) && (
                      <div className="rounded-lg border border-[#c8b27c]/15 bg-[#0b2a1b] p-3">
                        <p className="text-[10px] uppercase text-[#9eafa2]">Father</p>
                        <p className="mt-1 text-sm">
                          {[selected.father_first_name, selected.father_middle_name, selected.father_last_name]
                            .filter(Boolean)
                            .map(String)
                            .join(" ")}
                        </p>
                        {Boolean(selected.father_contact_number) && (
                          <p className="text-xs text-[#9eafa2]">
                            {String(selected.father_contact_number)}
                          </p>
                        )}
                      </div>
                    )}
                    {Boolean(selected.mother_first_name) && (
                      <div className="rounded-lg border border-[#c8b27c]/15 bg-[#0b2a1b] p-3">
                        <p className="text-[10px] uppercase text-[#9eafa2]">Mother</p>
                        <p className="mt-1 text-sm">
                          {[selected.mother_first_name, selected.mother_middle_name, selected.mother_last_name]
                            .filter(Boolean)
                            .map(String)
                            .join(" ")}
                        </p>
                        {Boolean(selected.mother_contact_number) && (
                          <p className="text-xs text-[#9eafa2]">
                            {String(selected.mother_contact_number)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* All Other Fields */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#c8b27c]">
                  Additional Submitted Fields
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(selected)
                    .filter(
                      ([key]) =>
                        !ignored.has(key) &&
                        !key.startsWith("father_") &&
                        !key.startsWith("mother_") &&
                        !key.startsWith("guardian_") &&
                        !key.startsWith("current_") &&
                        !/file|document|url/i.test(key)
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-[#c8b27c]/10 bg-[#0b2a1b]/60 p-2.5"
                      >
                        <p className="text-[10px] uppercase text-[#9eafa2]">
                          {key.replaceAll("_", " ")}
                        </p>
                        <p className="mt-0.5 break-words text-xs">{pretty(value)}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Documents */}
              <div className="rounded-xl border border-[#c8b27c]/25 bg-[#0b2a1b] p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <FileText size={17} className="text-[#c8b27c]" />
                  Uploaded Requirement Documents
                </h3>
                {fileCandidates.length > 0 ? (
                  <div className="space-y-2">
                    {fileCandidates.map(({ label, url }) => (
                      <a
                        key={label}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-lg border border-[#c8b27c]/20 bg-[#061b11] p-3 text-sm text-[#e7d29a] transition hover:bg-[#c8b27c]/10"
                      >
                        <ExternalLink size={15} className="shrink-0" />
                        <span className="capitalize">{label}</span>
                        <span className="ml-auto text-xs text-[#9eafa2]">
                          Open in new tab ↗
                        </span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs leading-5 text-[#9eafa2]">
                    No attached document files were uploaded for this record, or files are stored as private attachments.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
