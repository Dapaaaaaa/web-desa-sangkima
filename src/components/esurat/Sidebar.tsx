"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

type Role = "user" | "staff" | "admin";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const ICONS = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" /><path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5 5h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    </svg>
  ),
  tag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.6 13.4 12 22l-8.6-8.6a2 2 0 0 1-.6-1.4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 1.4.6L22 10.4a2 2 0 0 1 0 2.8z" transform="rotate(90 12 12)" /><circle cx="9" cy="9" r="1.5" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  ),
};

const ROLE_LABEL: Record<Role, string> = {
  user: "Warga",
  staff: "Operator Desa",
  admin: "Kepala Desa",
};

function navForRole(role: Role): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Beranda", icon: ICONS.home },
  ];
  if (role === "user") {
    items.push(
      { href: "/dashboard/ajukan", label: "Ajukan Surat", icon: ICONS.plus },
      { href: "/dashboard/surat", label: "Surat Saya", icon: ICONS.doc },
    );
  } else {
    items.push({
      href: "/dashboard/permohonan",
      label: "Permohonan",
      icon: ICONS.inbox,
    });
  }
  if (role === "admin") {
    items.push({
      href: "/dashboard/jenis-surat",
      label: "Jenis Surat",
      icon: ICONS.tag,
    });
  }
  return items;
}

export default function Sidebar({
  role,
  name,
}: {
  role: Role;
  name: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const items = navForRole(role);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <aside className="bg-white border-b border-gray-200 md:border-b-0 md:border-r md:w-64 md:min-h-screen flex md:flex-col shrink-0">
      {/* Brand */}
      <div className="hidden md:flex items-center gap-3 px-6 py-6">
        <div className="w-9 h-9 rounded-xl bg-[#70C7FF] flex items-center justify-center font-extrabold text-white text-sm">
          ES
        </div>
        <div>
          <p className="font-extrabold text-black leading-tight">E-Surat</p>
          <p className="text-xs text-[#797979] leading-tight">Desa Sangkima</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex md:flex-col flex-1 items-center md:items-stretch gap-1 px-3 md:px-4 py-2 md:py-2 overflow-x-auto">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap transition-colors ${
              isActive(item.href)
                ? "bg-[#70C7FF]/15 text-[#0089DC]"
                : "text-[#666] hover:bg-gray-100 hover:text-black"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User + logout */}
      <div className="flex md:flex-col items-center md:items-stretch gap-2 px-3 md:px-4 py-3 md:py-5 md:border-t border-gray-100">
        <div className="hidden md:block px-2 pb-2">
          <p className="text-sm font-extrabold text-black truncate">{name}</p>
          <p className="text-xs text-[#797979]">{ROLE_LABEL[role]}</p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {ICONS.logout}
          {loggingOut ? "Keluar..." : "Keluar"}
        </button>
      </div>
    </aside>
  );
}
