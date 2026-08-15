import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Branding Section */}
        <section className="relative hidden overflow-hidden lg:flex">
          {/* Animated background glow */}
          <motion.div
            className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-zinc-950">
                  T
                </div>

                <span className="text-xl font-semibold tracking-tight">
                  TenantRelay
                </span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-lg"
            >
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                Reliable webhook infrastructure
              </p>

              <h1 className="text-5xl font-semibold leading-tight tracking-tight xl:text-6xl">
                Deliver every event.
                <span className="block text-zinc-500">
                  Reliably.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
                Manage webhooks, monitor deliveries, handle retries, and keep
                your integrations running without worrying about unreliable
                infrastructure.
              </p>
            </motion.div>

            <p className="text-sm text-zinc-600">
              © {new Date().getFullYear()} TenantRelay
            </p>
          </div>
        </section>

        {/* Form Section */}
        <main className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-zinc-950">
                T
              </div>

              <span className="text-xl font-semibold tracking-tight">
                TenantRelay
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
              }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;