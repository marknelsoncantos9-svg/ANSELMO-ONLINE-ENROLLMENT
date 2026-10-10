"use client";

import { useRouter } from "next/navigation";

const logs = [
    {
        timestamp: "2026-10-06 09:21:14",
        userType: "Student",
        email: "juan@email.com",
        action: "Submitted Enrollment Application",
        ip: "192.168.1.101",
    },
    {
        timestamp: "2026-10-06 09:35:42",
        userType: "ICT Admin",
        email: "admin@aasmnhs.edu.ph",
        action: "Approved Enrollment",
        ip: "192.168.1.10",
    },
    {
        timestamp: "2026-10-06 09:42:08",
        userType: "ICT Admin",
        email: "admin@aasmnhs.edu.ph",
        action: "Changed Enrollment Status",
        ip: "192.168.1.10",
    },
    {
        timestamp: "2026-10-06 10:03:51",
        userType: "Student",
        email: "maria@email.com",
        action: "Uploaded Birth Certificate",
        ip: "192.168.1.115",
    },
];

export default function ActivityLogsPage() {
    const router = useRouter();

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
                    Activity Logs
                </h2>

                <p className="mt-1 text-gray-500">
                    Monitor activities performed within the enrollment system.
                </p>

                <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm">

                    <div className="overflow-x-auto">

                        <table className="w-full text-left text-sm">

                            <thead className="bg-[#176b4d] text-xs uppercase text-white">

                                <tr>
                                    <th className="px-5 py-4">
                                        Timestamp
                                    </th>

                                    <th className="px-5 py-4">
                                        User Type
                                    </th>

                                    <th className="px-5 py-4">
                                        User Email
                                    </th>

                                    <th className="px-5 py-4">
                                        Action
                                    </th>

                                    <th className="px-5 py-4">
                                        IP Address
                                    </th>
                                </tr>

                            </thead>

                            <tbody className="divide-y">

                                {logs.map((log, index) => (

                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                    >

                                        <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                                            {log.timestamp}
                                        </td>

                                        <td className="px-5 py-4">

                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                                                {log.userType}
                                            </span>

                                        </td>

                                        <td className="px-5 py-4 font-medium">
                                            {log.email}
                                        </td>

                                        <td className="px-5 py-4">
                                            {log.action}
                                        </td>

                                        <td className="px-5 py-4 font-mono text-xs text-gray-500">
                                            {log.ip}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                </div>

            </section>

        </main>
    );
}