"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Student = {
    id: number;
    name: string;
    email: string;
    strand: string;
    status: string;
    requirements: string;
};

const students: Student[] = [
    {
        id: 1,
        name: "Juan Dela Cruz",
        email: "juan@email.com",
        strand: "STEM",
        status: "Pending",
        requirements: "2 / 3",
    },
    {
        id: 2,
        name: "Maria Santos",
        email: "maria@email.com",
        strand: "ABM",
        status: "Approved",
        requirements: "3 / 3",
    },
    {
        id: 3,
        name: "Pedro Reyes",
        email: "pedro@email.com",
        strand: "ICT",
        status: "Pending",
        requirements: "1 / 3",
    },
];

export default function ManageUsersPage() {
    const router = useRouter();

    const [selectedStudent, setSelectedStudent] =
        useState<Student | null>(null);

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
                            125
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Pending Requirements
                        </p>
                        <p className="mt-2 text-3xl font-bold text-orange-500">
                            32
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Approved Enrollments
                        </p>
                        <p className="mt-2 text-3xl font-bold text-blue-600">
                            93
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

                                {students.map((student) => (

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
                                    <span className="font-semibold text-green-600">
                                        Submitted
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Birth Certificate</span>
                                    <span className="font-semibold text-green-600">
                                        Submitted
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Other Requirements</span>
                                    <span className="font-semibold text-orange-500">
                                        Pending
                                    </span>
                                </div>

                            </div>

                        </div>

                        <div className="mt-6 flex justify-end gap-3">

                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="rounded-lg border px-5 py-2 text-sm font-semibold"
                            >
                                Close
                            </button>

                            <button className="rounded-lg bg-[#176b4d] px-5 py-2 text-sm font-semibold text-white">
                                Approve Enrollment
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}