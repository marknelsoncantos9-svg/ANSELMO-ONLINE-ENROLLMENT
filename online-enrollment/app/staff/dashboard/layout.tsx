"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  LayoutDashboard, Files, Users, ClipboardCheck, FileSpreadsheet, LogOut, Menu, X, School
} from "lucide-react";

const navItems = [
  { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/staff/dashboard/applications", label: "Applications & Requirements", icon: Files },
  { href: "/staff/dashboard/sections", label: "Section & Adviser", icon: Users },
  { href: "/staff/dashboard/status", label: "Update Status", icon: ClipboardCheck },
  { href: "/staff/dashboard/reports", label: "Generate Reports", icon: FileSpreadsheet },
];

export default function StaffDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [staffName, setStaffName] = useState("Registrar");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    async function checkStaff() {
      const localLoggedIn = typeof window !== "undefined" ? localStorage.getItem("staffLoggedIn") : null;
      const localEmail = typeof window !== "undefined" ? localStorage.getItem("staffEmail") : null;

      const { data: { user } } = await supabase.auth.getUser();

      if (!user && localLoggedIn !== "true") {
        router.replace("/staff/login");
        return;
      }

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .maybeSingle();

        const role = String(
          profile?.role ||
          user.user_metadata?.role ||
          (user.email?.toLowerCase().includes("staff") ? "staff" : "") ||
          (user.email?.toLowerCase().includes("registrar") ? "registrar" : "") ||
          (user.email?.toLowerCase().includes("admin") ? "admin" : "")
        ).toLowerCase();

        if (profile && !["staff", "registrar", "admin"].includes(role)) {
          await supabase.auth.signOut();
          localStorage.removeItem("staffLoggedIn");
          localStorage.removeItem("staffEmail");
          router.replace("/staff/login?error=unauthorized");
          return;
        }

        if (alive) {
          setStaffName(profile?.full_name || user.user_metadata?.full_name || user.email || "Registrar");
          setChecking(false);
        }
      } else if (localLoggedIn === "true") {
        if (alive) {
          setStaffName(localEmail || "Registrar");
          setChecking(false);
        }
      }
    }

    checkStaff();
    return () => { alive = false; };
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("staffLoggedIn");
      localStorage.removeItem("staffEmail");
    }
    router.replace("/staff/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-[#061b11] text-[#f4ede0]">
      <div className="border-b border-[#c8b27c]/30 px-5 py-5">
        <Link href="/staff/dashboard" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#c8b27c] bg-white">
            <Image src="/school-logo.png" alt="AASMNHS logo" width={44} height={44} className="h-full w-full object-contain p-1" />
          </div>
          <div><p className="text-sm font-extrabold tracking-wide">AASMNHS</p><p className="mt-0.5 text-[10px] text-[#c8b27c]">Registrar Portal</p></div>
        </Link>
      </div>
      <div className="px-4 pb-2 pt-6"><p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9c5ba]">Workspace</p></div>
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-sm transition ${active ? "border-[#c8b27c]/60 bg-[#c8b27c]/15 font-semibold text-[#e7d29a]" : "border-transparent text-[#e4e8df] hover:border-[#c8b27c]/25 hover:bg-white/5"}`}>
            <Icon size={18} strokeWidth={1.8} /><span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c8b27c]" />}
          </Link>;
        })}
      </nav>
      <div className="border-t border-[#c8b27c]/25 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#c8b27c]/60 bg-[#123a27]"><School size={17} className="text-[#c8b27c]" /></div><div className="min-w-0"><p className="truncate text-xs font-semibold">{staffName}</p><p className="text-[10px] text-[#b9c5ba]">School Registrar</p></div></div>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-[#e8b4a8] transition hover:bg-red-400/10"><LogOut size={18} />Log out</button>
      </div>
    </div>
  );

  if (checking) return <div className="flex min-h-screen items-center justify-center bg-[#071d13] text-sm text-[#c8b27c]">Checking staff access…</div>;

  return <div className="min-h-screen bg-[#071d13] text-[#f4ede0]">
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[270px] border-r border-[#c8b27c]/25 lg:block">{sidebar}</aside>
    <div className="sticky top-0 z-30 flex items-center justify-between border-b border-[#c8b27c]/25 bg-[#061b11]/95 px-4 py-3 backdrop-blur lg:hidden">
      <Link href="/staff/dashboard" className="flex items-center gap-2"><Image src="/school-logo.png" alt="AASMNHS logo" width={32} height={32} /><span className="text-sm font-bold">AASMNHS <span className="font-normal text-[#c8b27c]">Registrar</span></span></Link>
      <button aria-label="Open navigation" onClick={() => setMobileOpen(!mobileOpen)} className="rounded-md border border-[#c8b27c]/40 p-2">{mobileOpen ? <X size={19}/> : <Menu size={19}/>}</button>
    </div>
    {mobileOpen && <div className="fixed inset-0 z-40 lg:hidden"><button aria-label="Close navigation" className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} /><aside className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">{sidebar}</aside></div>}
    <main className="min-h-screen lg:ml-[270px]">
      <header className="hidden border-b border-[#c8b27c]/20 bg-[#092719]/70 px-8 py-4 lg:flex lg:items-center lg:justify-between"><div><p className="text-xs text-[#c8b27c]">ANSELMO A. SANDOVAL MEMORIAL NATIONAL HIGH SCHOOL</p><p className="mt-1 text-sm text-[#c6d0c7]">Online Enrollment · Registrar Workspace</p></div><Link href="/" className="rounded-lg border border-[#c8b27c]/50 px-4 py-2 text-xs font-semibold text-[#f4ede0] hover:bg-[#c8b27c]/10">Back to Home</Link></header>
      <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      <footer className="border-t border-[#c8b27c]/15 px-6 py-4 text-center text-[10px] text-[#b9c5ba]">© {new Date().getFullYear()} Anselmo A. Sandoval Memorial National High School</footer>
    </main>
  </div>;
}
