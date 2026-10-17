"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RefreshCw, Save, AlertCircle, Users, CheckCircle2, Info } from "lucide-react";

type App = {
  id: string;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  status?: string | null;
  track?: string | null;
  preferred_strand_id?: string | null;
  strand?: string | null;
  assigned_section_id?: string | null;
  [key: string]: unknown;
};

type Section = {
  id: string | number;
  name: string;
  strand_id?: string | null;
  adviser_name?: string | null;
  school_year?: string | null;
  capacity?: number | null;
};

const defaultSections: Section[] = [
  { id: "sec-stem-11a", name: "11 - STEM Einstein", strand_id: "STEM", adviser_name: "Mrs. Maria Santos", capacity: 45, school_year: "2025-2026" },
  { id: "sec-stem-11b", name: "11 - STEM Newton", strand_id: "STEM", adviser_name: "Mr. John Dela Cruz", capacity: 45, school_year: "2025-2026" },
  { id: "sec-abm-11a", name: "11 - ABM Pacioli", strand_id: "ABM", adviser_name: "Ms. Elena Reyes", capacity: 45, school_year: "2025-2026" },
  { id: "sec-humss-11a", name: "11 - HUMSS Rizal", strand_id: "HUMSS", adviser_name: "Mr. Carlos Aquino", capacity: 45, school_year: "2025-2026" },
  { id: "sec-humss-11b", name: "11 - HUMSS Mabini", strand_id: "HUMSS", adviser_name: "Mrs. Gloria Ramos", capacity: 45, school_year: "2025-2026" },
  { id: "sec-gas-11a", name: "11 - GAS Bonifacio", strand_id: "GAS", adviser_name: "Mr. Antonio Luna", capacity: 45, school_year: "2025-2026" },
  { id: "sec-tvl-11a", name: "11 - TVL ICT Turing", strand_id: "TVL-ICT", adviser_name: "Engr. Mark Castillo", capacity: 40, school_year: "2025-2026" },
  { id: "sec-tvl-11b", name: "11 - TVL HE Escoffier", strand_id: "TVL-HE", adviser_name: "Ms. Teresa Garcia", capacity: 40, school_year: "2025-2026" },
  { id: "sec-tvl-11c", name: "11 - TVL IA Tesla", strand_id: "TVL-IA", adviser_name: "Mr. Roberto Mendoza", capacity: 40, school_year: "2025-2026" },
];

export default function SectionsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [sections, setSections] = useState<Section[]>(defaultSections);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [usingDefaultSections, setUsingDefaultSections] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // 1. Fetch applications with select("*") to be 100% resilient
      const appsRes = await supabase
        .from("student_applications")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (appsRes.error) {
        setError(`Applications: ${appsRes.error.message}`);
      } else {
        const applicationList = (appsRes.data ?? []) as App[];
        setApps(applicationList);

        // Load local assignments cache if available
        let savedLocal: Record<string, string> = {};
        if (typeof window !== "undefined") {
          try {
            const raw = localStorage.getItem("staff_section_assignments");
            if (raw) savedLocal = JSON.parse(raw);
          } catch {
            // ignore JSON parse error
          }
        }

        const initialAssignments: Record<string, string> = {};
        applicationList.forEach((r) => {
          initialAssignments[r.id] =
            r.assigned_section_id != null
              ? String(r.assigned_section_id)
              : savedLocal[r.id] || "";
        });
        setAssignments(initialAssignments);
      }

      // 2. Fetch sections table if it exists
      try {
        const sectionsRes = await supabase
          .from("sections")
          .select("*")
          .order("name");

        if (!sectionsRes.error && sectionsRes.data && sectionsRes.data.length > 0) {
          setSections(sectionsRes.data as Section[]);
          setUsingDefaultSections(false);
        } else {
          setSections(defaultSections);
          setUsingDefaultSections(true);
        }
      } catch {
        setSections(defaultSections);
        setUsingDefaultSections(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load sections data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(id: string) {
    setSaving(id);
    setMessage("");
    setError("");

    const value = assignments[id];
    const section = value ? sections.find((s) => String(s.id) === value) : null;

    // Cache locally first
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("staff_section_assignments");
        const existing = raw ? JSON.parse(raw) : {};
        existing[id] = value || "";
        localStorage.setItem("staff_section_assignments", JSON.stringify(existing));
      } catch {
        // ignore
      }
    }

    try {
      // Attempt to persist to Supabase if column exists
      const { error: updateError } = await supabase
        .from("student_applications")
        .update({
          assigned_section_id: value ? section?.id || value : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        // If column does not exist in student_applications, saved locally
        setMessage(
          `Section assigned locally to ${section?.name || "Unassigned"}. (Note: Add assigned_section_id column in Supabase to sync across devices).`
        );
      } else {
        setMessage(
          `Section assignment saved successfully: ${section?.name || "Unassigned"}.`
        );
      }
    } catch {
      setMessage(`Section assigned locally to ${section?.name || "Unassigned"}.`);
    } finally {
      setSaving(null);
    }
  }

  const filtered = useMemo(
    () =>
      apps.filter((a) => {
        const name = `${a.first_name ?? ""} ${a.middle_name ?? ""} ${a.last_name ?? ""} ${a.id ?? ""}`.toLowerCase();
        return name.includes(search.toLowerCase());
      }),
    [apps, search]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c8b27c]">
            Registrar Workspace
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">Section & Adviser</h1>
          <p className="mt-2 text-sm text-[#bdc9bf]">
            Assign qualified applicants to Senior High School sections and view designated advisers.
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

      {usingDefaultSections && (
        <div className="flex items-start gap-3 rounded-xl border border-[#c8b27c]/30 bg-[#c8b27c]/10 p-3.5 text-xs text-[#eddcb9]">
          <Info size={17} className="shrink-0 text-[#c8b27c] mt-0.5" />
          <div>
            <span className="font-bold">Standard School Sections Active:</span> Displaying AASMNHS Senior High School sections (STEM, ABM, HUMSS, GAS, TVL). Assignments are preserved in your registrar workspace.
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b] p-4 sm:flex-row">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student by name or application ID…"
          className="flex-1 rounded-lg border border-[#c8b27c]/25 bg-[#061b11] px-4 py-3 text-sm text-[#f4ede0] outline-none placeholder:text-[#829487] focus:border-[#c8b27c]"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b]">
        <div className="border-b border-[#c8b27c]/20 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Student Section Assignments</h2>
            <p className="mt-1 text-xs text-[#9eafa2]">
              Select a section for each student to link their adviser.
            </p>
          </div>
          <span className="text-xs text-[#c8b27c] font-mono">
            {filtered.length} applicant{filtered.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-[#aab9ad]">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Section</th>
                <th className="px-5 py-3">Adviser</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c8b27c]/10">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-[#aab9ad]">
                    Loading applicants…
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((a) => {
                  const selected = sections.find(
                    (s) => String(s.id) === assignments[a.id]
                  );
                  return (
                    <tr key={a.id} className="hover:bg-white/5">
                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {[a.first_name, a.middle_name, a.last_name]
                            .filter(Boolean)
                            .join(" ") || "Unnamed applicant"}
                        </p>
                        <p className="font-mono text-[10px] text-[#c8b27c]">
                          {String(a.id).slice(0, 8)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-xs capitalize">
                        <span className="rounded-full border border-[#c8b27c]/25 bg-white/5 px-2.5 py-1 text-[10px]">
                          {String(a.status || "pending").replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={assignments[a.id] ?? ""}
                          onChange={(e) =>
                            setAssignments((p) => ({
                              ...p,
                              [a.id]: e.target.value,
                            }))
                          }
                          className="w-60 rounded-lg border border-[#c8b27c]/25 bg-[#061b11] px-3 py-2.5 text-xs text-[#f4ede0] outline-none focus:border-[#c8b27c]"
                        >
                          <option value="">— Unassigned —</option>
                          {sections.map((s) => (
                            <option key={s.id} value={String(s.id)}>
                              {s.name}
                              {s.school_year ? ` · ${s.school_year}` : ""}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-xs text-[#bdc9bf]">
                        {selected?.adviser_name ? (
                          <span className="font-medium text-[#e7d29a]">
                            {selected.adviser_name}
                          </span>
                        ) : (
                          <span className="text-[#718576]">Not assigned</span>
                        )}
                        {selected?.capacity != null && (
                          <span className="block mt-0.5 text-[10px] text-[#8fa194]">
                            Class capacity: {selected.capacity}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => save(a.id)}
                          disabled={saving === a.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#c8b27c] px-3 py-2 text-xs font-bold text-[#071d13] hover:bg-[#ddca91] disabled:opacity-60"
                        >
                          <Save size={14} />
                          {saving === a.id ? "Saving…" : "Save"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-[#aab9ad]"
                  >
                    <Users className="mx-auto mb-2 opacity-50" size={24} />
                    No applicants found.
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
