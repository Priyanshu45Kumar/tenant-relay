
import { NavLink, Outlet } from "react-router-dom";

const settingsNavigation = [
  {
    name: "General",
    path: "/settings",
    end: true,
  },
  {
    name: "API Keys",
    path: "/settings/api-keys",
  },
  {
    name: "Security",
    path: "/settings/security",
  },
  {
    name: "Danger Zone",
    path: "/settings/danger-zone",
  },
];

const Settings = () => {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          Settings
        </h1>

        <p className="mt-1 text-sm text-zinc-400">
          Manage your workspace and account settings.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        {/* Settings navigation */}
        <aside>
          <nav className="space-y-1">
            {settingsNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `block rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Settings content */}
        <section className="min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
};

export default Settings;

