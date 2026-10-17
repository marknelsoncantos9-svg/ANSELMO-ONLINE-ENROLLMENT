"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Student = {
    id: string;
    name: string;
    email: string;
    strand: string;
    status: string;
    requirements: string;
    reportCard: boolean;
    birthCertificate: boolean;
    otherRequirement: boolean;
};

type ApplicationRow = {
    id: string;
    email?: string | null;
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    track?: string | null;
    status?: string | null;
    address?: string | null;
    contact_number?: string | null;
    report_card_url?: string | null;
    birth_certificate_url?: string | null;
    other_requirement_url?: string | null;
    submitted_at?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
};

export default function ManageUsersPage() {
    const router = useRouter();

    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [selectedStudent, setSelectedStudent] =
        useState<Student | null>(null);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            setIsLoading(true);
            setLoadError(null);

            const { data, error } = await supabase
                .from("student_applications")
                .select("*");

            if (!isMounted) return;

            if (error) {
                console.error("Failed to load student applications:", error);
                setLoadError(error.message);
                setIsLoading(false);
                return;
            }

            const rows = (data || []) as ApplicationRow[];

            rows.sort((a, b) => {
                const timeA = new Date(a.submitted_at || a.created_at || a.updated_at || 0).getTime();
                const timeB = new Date(b.submitted_at || b.created_at || b.updated_at || 0).getTime();
                return timeB - timeA;
            });

            setStudents(
                rows.map((row) => {
                    const reportCard = Boolean(row.report_card_url);
                    const birthCertificate = Boolean(row.birth_certificate_url);
                    const otherRequirement = Boolean(row.other_requirement_url);
                    const submitted = [reportCard, birthCertificate, otherRequirement].filter(Boolean).length;

                    return {
                        id: row.id,
                        name: `${row.first_name || ""} ${row.last_name || ""}`.trim() || "Unnamed Student",
                        email: row.email || "-",
                        strand: row.track || "-",
                        status: row.status || "Pending",
                        requirements: `${submitted} / 3`,
                        reportCard,
                        birthCertificate,
                        otherRequirement,
                    };
                })
            );
            setIsLoading(false);
        };

        load();

        return () => {
            isMounted = false;
        };
    }, []);

    const updateApplicationStatus = async (id: string, newStatus: string) => {
        setIsUpdatingStatus(true);
        try {
            const { error } = await supabase
                .from("student_applications")
                .update({ status: newStatus })
                .eq("id", id);

            if (error) throw error;

            setStudents((prev) =>
                prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
            );
            if (selectedStudent && selectedStudent.id === id) {
                setSelectedStudent((prev) => (prev ? { ...prev, status: newStatus } : null));
            }
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Could not update status. Check permissions or network.");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const [isSendingCredentials, setIsSendingCredentials] = useState(false);

    const handleSendCredentials = async (student: Student) => {
        if (!student.email || !student.email.includes("@")) {
            alert("This student does not have a valid email address on file.");
            return;
        }

        setIsSendingCredentials(true);
        try {
            const res = await fetch("/api/send-account", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: student.email,
                    studentName: student.name,
                    track: student.strand,
                }),
            });

            const data = await res.json();
            if (data.success) {
                alert(
                    `✓ Password generated & registered for ${student.name}!\n\nEmail: ${student.email}\nTemporary Password: ${data.password}\n\nStatus: ${data.message}`
                );
            } else {
                alert(`Could not send credentials: ${data.error || "Unknown error"}`);
            }
        } catch (err) {
            console.error("Error sending credentials:", err);
            alert("Network error sending credentials.");
        } finally {
            setIsSendingCredentials(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#f3f7f5]">

            <header className="border-b bg-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                    <div>
                        <h1 className="text-xl font-bold text-[#123d2d]">
                            AASM NHS
                        </h1>

                        <p className="text-xs text-gray-500">
                            ICT Administration Portal
                        </p>
                    </div>

                    <button
                        onClick={() => router.push("/admin")}
                        className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-50"
                    >
                        ← Dashboard
                    </button>

                </div>
            </header>

            <section className="mx-auto max-w-7xl p-6">

                <h2 className="text-3xl font-bold text-[#123d2d]">
                    Manage Users
                </h2>

                <p className="mt-1 text-gray-500">
                    View and manage student enrollment applications.
                </p>

                {/* SUMMARY */}
                <div className="mt-7 grid gap-5 md:grid-cols-3">

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Enrollees
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[#176b4d]">
                            {students.length}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Pending Requirements
                        </p>
                        <p className="mt-2 text-3xl font-bold text-orange-500">
                            {students.filter((s) => s.status !== "Approved").length}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Approved Enrollments
                        </p>
                        <p className="mt-2 text-3xl font-bold text-blue-600">
                            {students.filter((s) => s.status === "Approved").length}
                        </p>
                    </div>

                </div>

                {/* TABLE */}
                <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">

                    <div className="border-b p-5">
                        <h3 className="font-bold text-[#123d2d]">
                            Enrollment Records
                        </h3>
                    </div>

                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead className="bg-[#f5f8f6] text-xs uppercase text-gray-500">

                                <tr>
                                    <th className="px-5 py-4">Student</th>
                                    <th className="px-5 py-4">Email</th>
                                    <th className="px-5 py-4">Strand</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Requirements</th>
                                    <th className="px-5 py-4">Action</th>
                                </tr>

                            </thead>

                            <tbody className="divide-y">

                                {isLoading && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                                            Loading enrollment records...
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && loadError && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-red-600">
                                            Could not load records: {loadError}
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && !loadError && students.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                                            No enrollment records yet.
                                        </td>
                                    </tr>
                                )}

                                {!isLoading && !loadError && students.map((student) => (

                                    <tr key={student.id} className="hover:bg-gray-50">

                                        <td className="px-5 py-4 font-semibold">
                                            {student.name}
                                        </td>

                                        <td className="px-5 py-4 text-gray-500">
                                            {student.email}
                                        </td>

                                        <td className="px-5 py-4">
                                            {student.strand}
                                        </td>

                                        <td className="px-5 py-4">

                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${student.status === "Approved"
                                                        ? "bg-green-100 text-green-700"
                                                        : student.status === "Rejected"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-orange-100 text-orange-700"
                                                    }`}
                                            >
                                                {student.status}
                                            </span>

                                        </td>

                                        <td className="px-5 py-4">
                                            {student.requirements}
                                        </td>

                                        <td className="px-5 py-4">

                                            <button
                                                onClick={() => setSelectedStudent(student)}
                                                className="rounded-lg bg-[#176b4d] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0f573d]"
                                            >
                                                View Details
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </section>

            {/* STUDENT DETAILS MODAL */}
            {selectedStudent && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">

                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-7">

                        <div className="flex items-center justify-between">

                            <div>
                                <h2 className="text-2xl font-bold text-[#123d2d]">
                                    Student Details
                                </h2>

                                <p className="text-sm text-gray-500">
                                    Enrollment Application #{selectedStudent.id}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-2xl text-gray-400 hover:text-gray-700"
                            >
                                ×
                            </button>

                        </div>

                        <div className="mt-6 grid gap-5 sm:grid-cols-2">

                            <div>
                                <p className="text-xs uppercase text-gray-400">
                                    Student Name
                                </p>

                                <p className="mt-1 font-semibold">
                                    {selectedStudent.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase text-gray-400">
                                    Email
                                </p>

                                <p className="mt-1 font-semibold">
                                    {selectedStudent.email}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase text-gray-400">
                                    Strand
                                </p>

                                <p className="mt-1 font-semibold">
                                    {selectedStudent.strand}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs uppercase text-gray-400">
                                    Enrollment Status
                                </p>

                                <p className="mt-1 font-semibold">
                                    {selectedStudent.status}
                                </p>
                            </div>

                        </div>

                        <div className="mt-7 rounded-xl bg-gray-50 p-5">

                            <h3 className="font-bold text-[#123d2d]">
                                Requirements
                            </h3>

                            <div className="mt-4 space-y-3 text-sm">

                                <div className="flex justify-between">
                                    <span>Report Card</span>
                                    <span className={`font-semibold ${selectedStudent.reportCard ? "text-green-600" : "text-orange-500"}`}>
                                        {selectedStudent.reportCard ? "Submitted" : "Pending"}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Birth Certificate</span>
                                    <span className={`font-semibold ${selectedStudent.birthCertificate ? "text-green-600" : "text-orange-500"}`}>
                                        {selectedStudent.birthCertificate ? "Submitted" : "Pending"}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Other Requirements</span>
                                    <span className={`font-semibold ${selectedStudent.otherRequirement ? "text-green-600" : "text-orange-500"}`}>
                                        {selectedStudent.otherRequirement ? "Submitted" : "Pending"}
                                    </span>
                                </div>

                            </div>

                        </div>

                        <div className="mt-6 flex flex-wrap justify-end gap-3">

                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="rounded-lg border px-5 py-2 text-sm font-semibold hover:bg-gray-50"
                            >
                                Close
                            </button>

                            <button
                                disabled={isUpdatingStatus || selectedStudent.status === "Rejected"}
                                onClick={() => updateApplicationStatus(selectedStudent.id, "Rejected")}
                                className="rounded-lg border border-red-200 bg-red-50 px-5 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                                Reject
                            </button>

                            <button
                                disabled={isSendingCredentials || !selectedStudent.email}
                                onClick={() => handleSendCredentials(selectedStudent)}
                                className="rounded-lg border border-emerald-600 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                                title="Send temporary password and login credentials via email"
                            >
                                {isSendingCredentials ? "Sending Email..." : "✉️ Send Password Email"}
                            </button>

                            <button
                                disabled={isUpdatingStatus || selectedStudent.status === "Approved"}
                                onClick={() => updateApplicationStatus(selectedStudent.id, "Approved")}
                                className="rounded-lg bg-[#176b4d] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0f573d] disabled:opacity-50"
                            >
                                {isUpdatingStatus ? "Updating..." : "Approve Enrollment"}
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}