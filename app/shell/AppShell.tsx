"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Ana Sayfa", icon: "home" },
  { href: "/beslenme", label: "Beslenme", icon: "restaurant_menu" },
  { href: "/takip", label: "Takip", icon: "monitor_heart" },
  { href: "/ibadet", label: "İbadet", icon: "mosque" },
  { href: "/profil", label: "Profil", icon: "person" },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-background text-foreground relative">
      <main className="mx-auto w-full max-w-md pb-24 min-h-dvh">
        {children}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-xl border-t border-mint-soft z-50 rounded-t-3xl"
        style={{ boxShadow: "0 -4px 20px -4px rgba(76,140,100,0.15)" }}
        aria-label="Alt menü"
      >
        <div className="mx-auto flex max-w-md items-center justify-between px-6 pb-6 pt-3">
          {NAV_ITEMS.map((item, idx) => {
            const isActive = pathname === item.href;
            const isCenter = idx === 2;

            if (isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative -top-8 group flex flex-col items-center"
                  aria-current={isActive ? "page" : undefined}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-bg-light transition-all group-hover:scale-105 group-active:scale-95 ${
                      isActive
                        ? "bg-primary text-white shadow-primary/40"
                        : "bg-primary/80 text-white shadow-primary/30"
                    }`}
                  >
                    <span className="material-icons-round text-3xl">
                      {item.icon}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] mt-1 ${
                      isActive
                        ? "font-bold text-primary"
                        : "font-medium text-gray-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 w-12 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-gray-400 hover:text-primary"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="material-icons-round text-2xl">
                  {item.icon}
                </span>
                <span
                  className={`text-[10px] ${
                    isActive ? "font-bold" : "font-medium"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
