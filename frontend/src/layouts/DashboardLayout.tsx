import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { getCurrentUser } from "../api/auth.api";
import type { CurrentUserData } from "../types/auth";

import {
  LayoutDashboard,
  Webhook,
  Zap,
  Users,
  Settings,
  Bell,
  ChevronDown,
  MoreVertical,
  Radio,
} from "lucide-react";

/**
 * Fonts: add these to your index.html <head> (or import in your global CSS)
 * <link rel="preconnect" href="https://fonts.googleapis.com">
 * <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
 *
 * Tailwind config (extend, optional — arbitrary values below work without it too):
 * fontFamily: {
 *   display: ['"Space Grotesk"', 'sans-serif'],
 *   body: ['Inter', 'sans-serif'],
 *   mono: ['"JetBrains Mono"', 'monospace'],
 * }
 */

const navigation = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Webhooks", path: "/webhooks", icon: Webhook },
  { name: "Events", path: "/events", icon: Zap },
  { name: "Team", path: "/team", icon: Users },
  { name: "Settings", path: "/settings", icon: Settings },
];

// Faint animated relay trace used behind the topbar — draws itself in once,
// a quiet nod to "events flowing through" without being literal about it.
const SignalTrace = () => {
  const reduce = useReducedMotion();
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full opacity-[0.25]"
      viewBox="0 0 800 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M0,45 L90,45 L110,15 L130,50 L150,10 L170,45 L260,45 L280,25 L300,45 L400,45 L420,20 L440,45 L520,45 L540,12 L560,45 L650,45 L670,30 L690,45 L800,45"
        fill="none"
        stroke="#5EA1FF"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { duration: 1.8, ease: "easeInOut", delay: 0.2 }}
      />
    </svg>
  );
};

const DashboardLayout = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await getCurrentUser();
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Failed to load current user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  const activeItem = navigation.find((item) => item.path === location.pathname);

  return (
    <div className="min-h-screen bg-[#0A0D14] font-[Inter,sans-serif] text-[#E6E9F0] antialiased">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-[#1E2433] bg-[#0A0D14] md:flex">
          {/* Logo */}
          <div className="flex items-center gap-2.5 border-b border-[#1E2433] px-6 py-6">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#5EA1FF]/10 text-[#5EA1FF]">
              <Radio size={16} strokeWidth={2} />
            </div>
            <h1 className="font-['Space_Grotesk',sans-serif] text-[17px] font-semibold tracking-tight text-white">
              TenantRelay
            </h1>
          </div>

          {/* Workspace */}
          <div className="border-b border-[#1E2433] p-4">
            {loading ? (
              <div className="animate-pulse rounded-xl border border-[#1E2433] bg-[#12161F] p-3">
                <div className="h-4 w-32 rounded bg-[#1E2433]" />
                <div className="mt-2 h-3 w-16 rounded bg-[#1E2433]" />
              </div>
            ) : currentUser ? (
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="group w-full rounded-xl border border-[#1E2433] bg-[#12161F] p-3 text-left transition-colors hover:border-[#2A3142]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5EA1FF] font-['Space_Grotesk',sans-serif] text-sm font-bold text-[#0A0D14]">
                    {currentUser.tenant.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {currentUser.tenant.name}
                    </p>
                    <p className="mt-0.5 truncate font-['JetBrains_Mono',monospace] text-[11px] uppercase tracking-wide text-[#6C7486]">
                      {currentUser.role}
                    </p>
                  </div>

                  <ChevronDown
                    size={16}
                    className="shrink-0 text-[#4A5164] transition-colors group-hover:text-[#8B93A6]"
                  />
                </div>
              </motion.button>
            ) : null}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6">
            <p className="mb-3 px-3 text-[11px] font-medium uppercase tracking-wider text-[#4A5164]">
              Workspace
            </p>

            <div className="space-y-1">
              {navigation.map((item, i) => {
                const Icon = item.icon;
                const isActive = item.path === location.pathname;

                return (
                  <motion.div
                    key={item.path}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: reduce ? 0 : 0.04 * i, ease: "easeOut" }}
                  >
                    <NavLink
                      to={item.path}
                      className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-nav-pill"
                          className="absolute inset-0 rounded-lg bg-[#5EA1FF]/10 ring-1 ring-inset ring-[#5EA1FF]/25"
                          transition={{ type: "spring", stiffness: 500, damping: 40 }}
                        />
                      )}

                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        className={`relative z-10 transition-colors ${
                          isActive ? "text-[#5EA1FF]" : "text-[#6C7486] group-hover:text-white"
                        }`}
                      />
                      <span
                        className={`relative z-10 transition-colors ${
                          isActive ? "font-medium text-white" : "text-[#8B93A6] hover:text-white"
                        }`}
                      >
                        {item.name}
                      </span>
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          </nav>

          {/* User */}
          <div className="border-t border-[#1E2433] p-4">
            {loading ? (
              <div className="flex animate-pulse items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[#1E2433]" />
                <div className="flex-1">
                  <div className="h-3 w-24 rounded bg-[#1E2433]" />
                  <div className="mt-2 h-3 w-32 rounded bg-[#1E2433]" />
                </div>
              </div>
            ) : currentUser ? (
              <div className="group flex items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-[#12161F]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E2433] text-sm font-medium text-white">
                  {currentUser.user.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {currentUser.user.name}
                  </p>
                  <p className="truncate text-xs text-[#6C7486]">{currentUser.user.email}</p>
                </div>

                <button
                  type="button"
                  className="rounded-md p-1.5 text-[#4A5164] transition-colors hover:bg-[#1E2433] hover:text-white"
                  aria-label="User menu"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            ) : null}
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1">
          <div className="relative overflow-hidden border-b border-[#1E2433]/80 bg-[#0A0D14]/90 px-6 py-5 backdrop-blur-xl">
            <SignalTrace />

            <div className="relative flex items-center justify-between">
              {/* Page information */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={reduce ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-semibold tracking-tight text-white">
                    {activeItem?.name ?? "Dashboard"}
                  </h2>
                  <p className="mt-0.5 text-sm text-[#6C7486]">
                    Overview of your workspace activity.
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* Live status */}
                <div className="hidden items-center gap-2 rounded-full border border-[#1E2433] bg-[#12161F] px-3 py-1.5 sm:flex">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34D399] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34D399]" />
                  </span>
                  <span className="font-['JetBrains_Mono',monospace] text-[11px] tracking-wide text-[#8B93A6]">
                    all systems relayed
                  </span>
                </div>

                {/* Notification */}
                <button
                  type="button"
                  className="relative rounded-xl border border-[#1E2433] bg-[#12161F] p-2.5 text-[#6C7486] transition-colors hover:border-[#2A3142] hover:text-white"
                  aria-label="Notifications"
                >
                  <Bell size={17} strokeWidth={1.8} />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#F5B754]" />
                </button>

                {/* User avatar */}
                {currentUser && (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2A3142] bg-[#1E2433] text-sm font-medium text-white">
                    {currentUser.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;