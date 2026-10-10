"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
    const router = useRouter();

    useEffect(() => {
        const loggedIn = localStorage.getItem("adminLoggedIn");

        if (loggedIn !== "true") {
            router.push("/admin/login");
        }
    }, [router]);

    const logout = () => {
        localStorage.removeItem("adminLoggedIn");
        localStorage.removeItem("adminEmail");

        router.push("/admin/login");
    };

    return (
        <main className="min-h-screen bg-[#f3f7f5]">

            {/* HEADER */}
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
                        onClick={logout}
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                        Log Out
                    </button>

                </div>
            </header>

            <div className="mx-auto flex max-w-7xl">

                {/* SIDEBAR */}
                <aside className="hidden min-h-[calc(100vh-73px)] w-64 border-r bg-white p-5 md:block">

                    <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                        Administration
                    </p>

                    <nav className="space-y-2">

                        <button
                            onClick={() => router.push("/admin")}
                            className="w-full rounded-lg bg-[#176b4d] px-4 py-3 text-left text-sm font-semibold text-white"
                        >
                            Dashboard
                        </button>

                        <button
                            onClick={() => router.push("/admin/users")}
                            className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-[#eef5f1]"
                        >
                            Manage Users
                        </button>

                        <button
                            onClick={() => router.push("/admin/system-management")}
                            className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-[#eef5f1]"
                        >
                            System Management
                        </button>

                        <button
                            onClick={() => router.push("/admin/activity-logs")}
                            className="w-full rounded-lg px-4 py-3 text-left text-sm font-semibold text-gray-700 hover:bg-[#eef5f1]"
                        >
                            Activity Logs
                        </button>

                    </nav>

                </aside>

                {/* MAIN CONTENT */}
                <section className="flex-1 p-6">

                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-[#123d2d]">
                            Dashboard
                        </h2>

                        <p className="mt-1 text-gray-500">
                            Overview of the online enrollment system.
                        </p>
                    </div>

                    {/* STAT CARDS */}
                    <div className="grid gap-5 md:grid-cols-3">

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Total Enrollees
                            </p>

                            <p className="mt-3 text-4xl font-bold text-[#176b4d]">
                                125
                            </p>

                            <p className="mt-2 text-xs text-gray-400">
                                All submitted applications
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Pending Requirements
                            </p>

                            <p className="mt-3 text-4xl font-bold text-orange-500">
                                32
                            </p>

                            <p className="mt-2 text-xs text-gray-400">
                                Applications requiring review
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-6 shadow-sm">
                            <p className="text-sm font-medium text-gray-500">
                                Approved Enrollments
                            </p>

                            <p className="mt-3 text-4xl font-bold text-blue-600">
                                93
                            </p>

                            <p className="mt-2 text-xs text-gray-400">
                                Successfully approved
                            </p>
                        </div>

                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">

                        <h3 className="text-lg font-bold text-[#123d2d]">
                            Quick Actions
                        </h3>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">

                            <button
                                onClick={() => router.push("/admin/users")}
                                className="rounded-xl border border-gray-200 p-5 text-left hover:border-[#176b4d] hover:bg-[#f5faf7]"
                            >
                                <p className="font-bold text-gray-800">
                                    Manage Users
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    View and manage student enrollment records.
                                </p>
                            </button>

                            <button
                                onClick={() => router.push("/admin/system-management")}
                                className="rounded-xl border border-gray-200 p-5 text-left hover:border-[#176b4d] hover:bg-[#f5faf7]"
                            >
                                <p className="font-bold text-gray-800">
                                    System Management
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Manage enrollment settings and notifications.
                                </p>
                            </button>

                            <button
                                onClick={() => router.push("/admin/activity-logs")}
                                className="rounded-xl border border-gray-200 p-5 text-left hover:border-[#176b4d] hover:bg-[#f5faf7]"
                            >
                                <p className="font-bold text-gray-800">
                                    Activity Logs
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Monitor system activities and user actions.
                                </p>
                            </button>

                        </div>

                    </div>

                </section>

            </div>

        </main>
    );
}