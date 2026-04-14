"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  LayoutDashboard,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Session",
    icon: MessageSquare,
    description: "Chat & Analysis",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "History & Trends",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => setCollapsed((c) => !c), []);
  const toggleMobile = useCallback(() => setMobileOpen((o) => !o), []);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger button */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 md:hidden w-9 h-9 rounded-xl bg-surface border border-surface-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        id="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {/* Sidebar */}
      <aside
        className={[
          "flex flex-col h-full bg-surface border-r border-surface-border",
          "transition-all duration-300 ease-out flex-shrink-0",
          // Desktop width
          collapsed ? "md:w-[68px]" : "md:w-[220px]",
          // Mobile: fixed overlay, full width sidebar, slides in/out
          "max-md:fixed max-md:top-0 max-md:left-0 max-md:h-full max-md:z-50 max-md:w-[220px]",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-border">
          <div className="w-9 h-9 rounded-xl bg-accent-muted flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="text-sm font-bold gradient-text whitespace-nowrap">
                Oracle AI
              </h1>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                Interview Intelligence
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, description }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                  isActive
                    ? "bg-accent-muted text-accent"
                    : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                }`}
                title={collapsed ? label : undefined}
                id={`nav-${label.toLowerCase()}`}
              >
                <Icon
                  className={`w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 ${
                    isActive ? "" : "group-hover:scale-110"
                  }`}
                />
                {!collapsed && (
                  <div className="overflow-hidden animate-fade-in">
                    <p className="font-medium whitespace-nowrap">{label}</p>
                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {description}
                    </p>
                  </div>
                )}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle — desktop only */}
        <div className="p-3 border-t border-surface-border hidden md:block">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-all duration-200"
            id="sidebar-toggle"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
