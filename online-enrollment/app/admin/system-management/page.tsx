"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SystemManagementPage() {
    const router = useRouter();

    const [startDate, setStartDate] = useState("2026-10-10");
    const [endDate, setEndDate] = useState("2026-11-30");
    const [status, setStatus] = useState("OPEN");
    const [adminEmail, setAdminEmail] = useState(
        "registrar@aasmnhs.edu.ph"
    );

    const handleSave = () => {
        localStorage.setItem(
            "enrollmentSettings",
            JSON.stringify({
                startDate,
                endDate,
                status,
                adminEmail,
            })
        );

        alert("System settings saved successfully.");
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

            <section className="mx-auto max-w-4xl p-6">

                <h2 className="text-3xl font-bold text-[#123d2d]">
                    System Management
                </h2>

                <p className="mt-1 text-gray-500">
                    Configure enrollment and notification settings.
                </p>

                <div className="mt-8 space-y-6">

                    {/* ENROLLMENT PERIOD */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm">

                        <h3 className="text-lg font-bold text-[#123d2d]">
                            Enrollment Period
                        </h3>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Enrollment Start Date
                                </label>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Enrollment End Date
                                </label>

                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                                />
                            </div>

                        </div>

                    </div>

                    {/* STATUS */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm">

                        <h3 className="text-lg font-bold text-[#123d2d]">
                            Enrollment Status
                        </h3>

                        <div className="mt-5">

                            <label className="mb-2 block text-sm font-semibold">
                                System Status
                            </label>

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3"
                            >
                                <option value="OPEN">OPEN</option>
                                <option value="CLOSED">CLOSED</option>
                            </select>

                            <div
                                className={`mt-4 rounded-xl p-4 text-sm ${status === "OPEN"
                                        ? "bg-green-50 text-green-700"
                                        : "bg-red-50 text-red-700"
                                    }`}
                            >
                                Enrollment is currently{" "}
                                <strong>{status}</strong>.
                            </div>

                        </div>

                    </div>

                    {/* EMAIL */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm">

                        <h3 className="text-lg font-bold text-[#123d2d]">
                            Notification Settings
                        </h3>

                        <div className="mt-5">

                            <label className="mb-2 block text-sm font-semibold">
                                Admin Email for Notifications
                            </label>

                            <input
                                type="email"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3"
                            />

                            <p className="mt-2 text-xs text-gray-500">
                                Notifications will be sent to this email address.
                            </p>

                        </div>

                    </div>

                    <div className="flex justify-end">

                        <button
                            onClick={handleSave}
                            className="rounded-xl bg-[#176b4d] px-7 py-3 font-semibold text-white hover:bg-[#0f573d]"
                        >
                            Save Changes
                        </button>

                    </div>

                </div>

            </section>

        </main>
    );
}