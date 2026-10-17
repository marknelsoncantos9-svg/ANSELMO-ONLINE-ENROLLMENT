
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  Users,
  Clock3,
  BadgeCheck,
  GraduationCap,
  ArrowUpRight,
  RefreshCw,
  AlertCircle,
  Layers3,
} from "lucide-react";

type Application = {
  id?: string | number;
  status?: string | null;
  [key: string]: unknown;
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-300/15 text-amber-200 border-amber-300/30",
  under_review: "bg-sky-300/15 text-sky-200 border-sky-300/30",
  approved: "bg-emerald-300/15 text-emerald-200 border-emerald-300/30",
  enrolled: "bg-green-300/15 text-green-200 border-green-300/30",
  rejected: "bg-red-300/15 text-red-200 border-red-300/30",
};

function getText(
  record: Application,
  keys: string[]
): string {
  for (const key of keys) {
    const value = record[key];

    if (
      typeof value === "string" ||
      typeof value === "number"
    ) {
      const text = String(value).trim();
      if (text) return text;
    }
  }

  return "";
}

function getStatus(app: Application): string {
  return (
    getText(app, ["status", "application_status", "enrollment_status"])
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, "_") || "pending"
  );
}

function getStudentName(app: Application): string {
  const fullName = getText(app, [
    "full_name",
    "student_name",
    "applicant_name",
    "name",
  ]);

  if (fullName) return fullName;

  const first = getText(app, [
    "first_name",
    "firstname",
    "given_name",
  ]);
  const middle = getText(app, ["middle_name", "middlename"]);
  const last = getText(app, [
    "last_name",
    "lastname",
    "surname",
    "family_name",
  ]);

  const combined = [first, middle, last].filter(Boolean).join(" ");
  return combined || "Applicant name unavailable";
}

function getSubmittedDate(app: Application): string {
  const raw = getText(app, [
    "submitted_at",
    "created_at",
    "application_date",
    "created_on",
    "date_submitted",
  ]);

  if (!raw) return "—";

  const date = new Date(raw);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString();
}

function getTrack(app: Application): string {
  return getText(app, [
    "cluster",
    "cluster_name",
    "selected_cluster",
    "preferred_cluster",
    "track",
    "selected_track",
    "program",
  ]);
}

export default function StaffDashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [loadedAt, setLoadedAt] = useState("");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    setError("");

    try {
      // Confirm that a staff user has an active Supabase session.
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          `Could not check your login session: ${sessionError.message}`
        );
      }

      if (!session) {
        setApplications([]);
        setError(
          "Your staff session is missing or expired. Please sign in again."
        );
        return;
      }

      // Do not order by an assumed column. Fetch the table first.
      const { data, error: queryError } = await supabase
        .from("student_applications")
        .select("*")
        .limit(1000);

      if (queryError) {
        console.error(
          "Failed to fetch student applications:",
          queryError.message,
          queryError.code
        );

        throw new Error(
          `Could not load student applications: ${queryError.message}` +
          (queryError.code ? ` (Code: ${queryError.code})` : "")
        );
      }

      const records = (data ?? []) as Application[];

      // Sort in the browser using whichever date field exists.
      const dateKeys = [
        "submitted_at",
        "created_at",
        "application_date",
        "created_on",
        "date_submitted",
      ];

      records.sort((a, b) => {
        const getTime = (record: Application) => {
          for (const key of dateKeys) {
            const value = record[key];

            if (typeof value === "string") {
              const time = new Date(value).getTime();
              if (!Number.isNaN(time)) return time;
            }
          }

          return 0;
        };

        return getTime(b) - getTime(a);
      });

      setApplications(records);
      setLoadedAt(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading the dashboard.";

      setError(message);
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const startLoading = async () => {
      if (cancelled) return;
      await loadData();
    };

    void startLoading();

    const interval = window.setInterval(() => {
      if (!cancelled) {
        void startLoading();
      }
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [loadData]);

  const count = (status: string) =>
    applications.filter((app) => getStatus(app) === status).length;

  const total = applications.length;
  const pending =
    count("pending") +
    count("under_review") +
    count("underreview") +
    count("submitted");
  const approved = count("approved");
  const enrolled = count("enrolled");
  const rejected = count("rejected");

  // Clusters replace the former strands. Count distinct cluster values
  // without querying a deleted table.
  const clusterCounts = applications.reduce<Record<string, number>>(
    (result, app) => {
      const cluster = getTrack(app);

      if (cluster) {
        result[cluster] = (result[cluster] ?? 0) + 1;
      }

      return result;
    },
    {}
  );

  const clusters = Object.entries(clusterCounts).sort(
    (a, b) => b[1] - a[1]
  );

  const maxCluster = Math.max(
    1,
    ...clusters.map(([, value]) => value)
  );

  const pieTotal = Math.max(total, 1);
  const p1 = (pending / pieTotal) * 100;
  const p2 = (approved / pieTotal) * 100;
  const p3 = (enrolled / pieTotal) * 100;

  const pie = `conic-gradient(
    #c8b27c 0% ${p1}%,
    #78b88d ${p1}% ${p1 + p2}%,
    #6ba8c7 ${p1 + p2}% ${p1 + p2 + p3}%,
    #b86e68 ${p1 + p2 + p3}% 100%
  )`;

  const metricCards = [
    {
      label: "Total Applications",
      value: total,
      icon: Users,
      tone: "text-[#c8b27c]",
      note: "Submitted learner records",
    },
    {
      label: "Pending Review",
      value: pending,
      icon: Clock3,
      tone: "text-amber-200",
      note: "Pending or under review",
    },
    {
      label: "Approved",
      value: approved,
      icon: BadgeCheck,
      tone: "text-emerald-200",
      note: "Awaiting enrollment completion",
    },
    {
      label: "Enrolled Students",
      value: enrolled,
      icon: GraduationCap,
      tone: "text-sky-200",
      note: "Officially registered",
    },
  ];

  return (
    <div className="space-y-7 text-[#f4ede0]">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c8b27c]">
            Registrar Overview
          </p>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-[#bdc9bf]">
            Monitor student applications, enrollment progress, and cluster distribution.
          </p>

          {loadedAt && (
            <p className="mt-2 text-xs text-[#9eafa2]">
              Last updated: {loadedAt}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-[#c8b27c]/40 bg-[#0d2c1d] px-4 py-2.5 text-xs font-semibold hover:bg-[#16432c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
      </div>

      {/* Errors are visible rather than silently showing zero. */}
      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Dashboard data could not be loaded</p>
            <p className="mt-1 break-words">{error}</p>
            <p className="mt-2 text-xs text-red-200/80">
              Check your staff login session, Supabase query permissions, and
              the student_applications table.
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b]/90 p-5 shadow-lg shadow-black/10"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-[#c6d0c7]">{card.label}</p>
                <Icon size={20} className={card.tone} />
              </div>

              <p className="mt-4 text-3xl font-bold tabular-nums">
                {loading ? "—" : card.value.toLocaleString()}
              </p>

              <p className="mt-2 text-xs text-[#9eafa2]">{card.note}</p>
            </div>
          );
        })}
      </div>

      {/* Analytics */}
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b]/90 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Application Status</h2>
              <p className="mt-1 text-xs text-[#9eafa2]">
                Distribution of student applications
              </p>
            </div>

            <span className="rounded-full border border-[#c8b27c]/30 px-3 py-1 text-[10px] text-[#c8b27c]">
              Live data
            </span>
          </div>

          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
            <div
              className="relative h-44 w-44 shrink-0 rounded-full"
              style={{ background: loading ? "#234431" : pie }}
            >
              <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full border border-[#c8b27c]/15 bg-[#0b2a1b]">
                <span className="text-3xl font-extrabold">
                  {loading ? "—" : total}
                </span>
                <span className="mt-1 text-[10px] text-[#aebcaf]">
                  Applications
                </span>
              </div>
            </div>

            <div className="w-full space-y-4">
              {[
                {
                  label: "Pending / Under review",
                  value: pending,
                  color: "bg-[#c8b27c]",
                },
                {
                  label: "Approved",
                  value: approved,
                  color: "bg-[#78b88d]",
                },
                {
                  label: "Enrolled",
                  value: enrolled,
                  color: "bg-[#6ba8c7]",
                },
                {
                  label: "Rejected",
                  value: rejected,
                  color: "bg-[#b86e68]",
                },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${item.color}`}
                  />
                  <span className="flex-1 text-xs text-[#c6d0c7]">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold tabular-nums">
                    {loading ? "—" : item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b]/90 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Layers3 size={21} className="text-[#c8b27c]" />
            <div>
              <h2 className="text-lg font-bold">Applications by Cluster</h2>
              <p className="mt-1 text-xs text-[#9eafa2]">
                Based on cluster values stored in each application
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-7 text-sm text-[#9eafa2]">
              Loading cluster data...
            </p>
          ) : clusters.length > 0 ? (
            <div className="mt-7 space-y-6">
              {clusters.map(([name, value]) => (
                <div key={name}>
                  <div className="mb-2 flex justify-between gap-3 text-sm">
                    <span className="break-words text-[#e6e8df]">{name}</span>
                    <span className="font-bold tabular-nums">{value}</span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-[#1a3b29]">
                    <div
                      className="h-full rounded-full bg-[#c8b27c] transition-all"
                      style={{
                        width: `${(value / maxCluster) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-7 rounded-lg border border-white/10 p-4 text-sm text-[#9eafa2]">
              No cluster values were found in the loaded applications. Check
              which column stores the selected cluster.
            </p>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-[#c8b27c]/15 pt-4 text-xs">
            <span className="text-[#9eafa2]">
              Distinct clusters: {clusters.length}
            </span>

            <Link
              href="/staff/dashboard/sections"
              className="font-semibold text-[#c8b27c] hover:underline"
            >
              Assign sections →
            </Link>
          </div>
        </section>
      </div>

      {/* Recent applications */}
      <section className="overflow-hidden rounded-2xl border border-[#c8b27c]/25 bg-[#0b2a1b]/90">
        <div className="flex items-center justify-between gap-3 border-b border-[#c8b27c]/20 px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-lg font-bold">Recent Applications</h2>
            <p className="mt-1 text-xs text-[#9eafa2]">
              Latest student submissions
            </p>
          </div>

          <Link
            href="/staff/dashboard/applications"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#c8b27c] hover:text-[#e7d29a]"
          >
            View all <ArrowUpRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-white/5 text-[10px] uppercase tracking-wider text-[#aab9ad]">
              <tr>
                <th className="px-6 py-3 font-semibold">Student</th>
                <th className="px-6 py-3 font-semibold">Application ID</th>
                <th className="px-6 py-3 font-semibold">Submitted</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#c8b27c]/10">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-[#aab9ad]"
                  >
                    Loading applications...
                  </td>
                </tr>
              ) : applications.length > 0 ? (
                applications.slice(0, 6).map((app, index) => {
                  const status = getStatus(app);
                  const applicationId = String(app.id ?? "No ID");

                  return (
                    <tr
                      key={applicationId === "No ID" ? index : applicationId}
                      className="hover:bg-white/5"
                    >
                      <td className="px-6 py-4 font-medium">
                        {getStudentName(app)}
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-[#c8b27c]">
                        {applicationId.slice(0, 8)}
                      </td>

                      <td className="px-6 py-4 text-xs text-[#b9c5ba]">
                        {getSubmittedDate(app)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold capitalize ${statusColors[status] ??
                            statusColors.pending
                            }`}
                        >
                          {status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-[#aab9ad]"
                  >
                    {error
                      ? "Applications could not be loaded. See the error above."
                      : "No applications were returned by Supabase."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#c8b27c]/10 px-6 py-3 text-xs text-[#9eafa2]">
          Showing {Math.min(applications.length, 6)} of {applications.length}{" "}
          loaded applications
        </div>
      </section>
    </div>
  );
}