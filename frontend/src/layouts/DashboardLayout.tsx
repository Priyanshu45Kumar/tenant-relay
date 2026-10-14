import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  Activity,
  Bell,
  LayoutDashboard,
  LogOut,
  Radio,
  Settings,
  Users,
  Webhook,
  X,
  Zap,
} from "lucide-react";

import { getCurrentUser } from "../api/auth.api";
import type { CurrentUserData } from "../types/auth";
import { logout } from "../lib/auth";

const navigation = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Webhooks",
    path: "/webhooks",
    icon: Webhook,
  },
  {
    name: "Events",
    path: "/events",
    icon: Zap,
  },
  {
    name: "Team",
    path: "/team",
    icon: Users,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

const DashboardLayout = () => {
  const [currentUser, setCurrentUser] =
    useState<CurrentUserData | null>(null);

  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] =
    useState(false);

  const location = useLocation();
  const reduceMotion = useReducedMotion();

  const activeItem = navigation.find(
    (item) =>
      location.pathname === item.path ||
      (item.path !== "/dashboard" &&
        location.pathname.startsWith(`${item.path}/`))
  );

  const pageTitle =
    activeItem?.name ??
    (location.pathname.startsWith("/deliveries")
      ? "Deliveries"
      : "Workspace");

  useEffect(() => {
    let cancelled = false;

    const loadCurrentUser = async () => {
      try {
        const response = await getCurrentUser();

        if (!cancelled) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load current user:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const renderNavigationLink = (
    item: (typeof navigation)[number],
    mobile = false
  ) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.path === "/dashboard"}
        className={({ isActive }) =>
          [
            "group relative flex shrink-0 items-center gap-3 rounded-xl",
            "text-sm transition-colors duration-200",
            mobile ? "px-3 py-2.5" : "px-3.5 py-3",
            isActive
              ? "bg-[#5EA1FF]/10 text-white ring-1 ring-inset ring-[#5EA1FF]/20"
              : "text-[#929BAD] hover:bg-white/[0.04] hover:text-white",
          ].join(" ")
        }
      >
        {({ isActive }) => (
          <>
            {isActive && !mobile && (
              <motion.span
                layoutId="tenantrelay-active-nav"
                className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#5EA1FF]"
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        stiffness: 450,
                        damping: 35,
                      }
                }
              />
            )}

            <Icon
              size={18}
              strokeWidth={1.8}
              className={
                isActive
                  ? "text-[#5EA1FF]"
                  : "text-[#788398] group-hover:text-white"
              }
            />

            <span className="whitespace-nowrap">{item.name}</span>

            {isActive && mobile && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#5EA1FF]" />
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen bg-[#080B12] font-[Inter,sans-serif] text-[#E6E9F0] antialiased">
      {/* Fixed desktop sidebar: never collapses or moves */}
      <aside
        className="
          fixed inset-y-0 left-0 z-40 hidden
          w-72 flex-col overflow-y-auto
          border-r border-white/[0.07]
          bg-[#080B12] md:flex
        "
      >
        {/* Brand */}
        <div className="flex h-[76px] shrink-0 items-center gap-3 border-b border-white/[0.07] px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5EA1FF]/20 bg-[#5EA1FF]/10 text-[#5EA1FF]">
            <Radio size={21} strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="font-['Space_Grotesk',sans-serif] text-lg font-bold tracking-tight text-white">
              TenantRelay
            </h1>

            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#68758B]">
              Webhook infrastructure
            </p>
          </div>
        </div>

        {/* Workspace */}
        <div className="border-b border-white/[0.07] p-4">
          <p className="mb-3 px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#68758B]">
            Current workspace
          </p>

          {loading ? (
            <div className="animate-pulse rounded-xl border border-white/[0.07] bg-[#0D121C] p-3">
              <div className="h-4 w-32 rounded bg-white/[0.08]" />
              <div className="mt-2 h-3 w-20 rounded bg-white/[0.05]" />
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-[#0D121C] p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5EA1FF] font-['Space_Grotesk',sans-serif] text-base font-bold text-[#080B12]">
                {currentUser.tenant.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {currentUser.tenant.name}
                </p>

                <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-wider text-[#8290A6]">
                  {currentUser.role}
                </p>
              </div>

              <Activity
                size={16}
                className="shrink-0 text-[#5EA1FF]"
              />
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.07] bg-[#0D121C] p-3 text-sm text-[#8290A6]">
              Workspace unavailable
            </div>
          )}
        </div>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="flex-1 px-4 py-6"
        >
          <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#68758B]">
            Workspace menu
          </p>

          <div className="space-y-1.5">
            {navigation.map((item, index) => (
              <motion.div
                key={item.path}
                initial={
                  reduceMotion ? false : { opacity: 0, x: -8 }
                }
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.25,
                  delay: reduceMotion ? 0 : index * 0.04,
                }}
              >
                {renderNavigationLink(item)}
              </motion.div>
            ))}
          </div>
        </nav>

        {/* Account section */}
        <div className="shrink-0 border-t border-white/[0.07] p-4">
          <p className="mb-3 px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#68758B]">
            Account
          </p>

          {loading ? (
            <div className="flex animate-pulse items-center gap-3 p-2">
              <div className="h-10 w-10 rounded-full bg-white/[0.08]" />

              <div className="flex-1">
                <div className="h-3 w-24 rounded bg-white/[0.08]" />
                <div className="mt-2 h-3 w-32 rounded bg-white/[0.05]" />
              </div>
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.03]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-[#151D2B] font-semibold text-white">
                {currentUser.user.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {currentUser.user.name}
                </p>

                <p className="truncate text-xs text-[#8290A6]">
                  {currentUser.user.email}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                aria-label="Log out"
                title="Log out"
                className="rounded-lg p-2 text-[#8290A6] transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex w-full items-center gap-3 rounded-xl p-2 text-sm text-[#929BAD] hover:bg-white/[0.04] hover:text-white"
            >
              <LogOut size={17} />
              Log out
            </button>
          )}
        </div>
      </aside>

      {/* Main section: offset prevents overlap with fixed sidebar */}
      <div className="min-h-screen min-w-0 md:pl-72">
        {/* Topbar */}
        <header className="relative z-10 border-b border-white/[0.07] bg-[#080B12]/95 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-h-10 items-center justify-between gap-4">
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={pageTitle}
                  initial={
                    reduceMotion ? false : { opacity: 0, y: 4 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.18,
                  }}
                >
                  <h2 className="font-['Space_Grotesk',sans-serif] text-lg font-semibold tracking-tight text-white sm:text-xl">
                    {pageTitle}
                  </h2>

                  <p className="mt-0.5 hidden text-xs text-[#8290A6] sm:block">
                    Manage your webhook infrastructure.
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full border border-white/[0.07] bg-[#0D121C] px-3 py-2 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5EA1FF]" />

                <span className="font-mono text-[10px] uppercase tracking-wider text-[#929BAD]">
                  TenantRelay
                </span>
              </div>

              <button
                type="button"
                aria-label="Notifications (coming soon)"
                title="Notifications coming soon"
                disabled
                className="cursor-not-allowed rounded-xl border border-white/[0.07] bg-[#0D121C] p-2.5 text-[#68758B] opacity-70"
              >
                <Bell size={17} strokeWidth={1.8} />
              </button>

              {currentUser && (
                <div
                  title={currentUser.user.name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#5EA1FF]/20 bg-[#5EA1FF]/10 text-sm font-semibold text-[#8CBFFF]"
                >
                  {currentUser.user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile navigation */}
        <nav
          aria-label="Mobile navigation"
          className="border-b border-white/[0.07] bg-[#080B12] px-3 py-3 md:hidden"
        >
          <div className="flex gap-2 overflow-x-auto pb-1">
            {navigation.map((item) =>
              renderNavigationLink(item, true)
            )}
          </div>
        </nav>

        {/* Page content */}
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={
                reduceMotion ? false : { opacity: 0, y: 6 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.2,
              }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Logout confirmation modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="logout-title"
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, scale: 0.96, y: 8 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{
                duration: reduceMotion ? 0 : 0.18,
              }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/[0.09] bg-[#0D121C] p-6 shadow-2xl shadow-black/40"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400">
                <LogOut size={21} />
              </div>

              <h2
                id="logout-title"
                className="mt-5 text-lg font-semibold text-white"
              >
                Are you sure you want to log out?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#929BAD]">
                You will need to sign in again to access your
                workspace.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] px-4 py-2.5 text-sm font-medium text-[#C5CAD5] transition-colors hover:bg-white/[0.05]"
                >
                  <X size={15} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-400"
                >
                  Log out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;