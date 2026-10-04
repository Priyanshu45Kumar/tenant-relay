import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Gauge,
  LockKeyhole,
  RefreshCw,
  Webhook,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Webhook,
    title: "Reliable Webhooks",
    description:
      "Deliver events to customer endpoints reliably with background processing and retry-ready infrastructure.",
  },
  {
    icon: LockKeyhole,
    title: "Secure by Design",
    description:
      "Use API keys, tenant isolation and HMAC signatures to keep webhook communication secure.",
  },
  {
    icon: RefreshCw,
    title: "Automatic Retries",
    description:
      "Handle temporary failures without blocking your main application using asynchronous delivery.",
  },
  {
    icon: Gauge,
    title: "Delivery Monitoring",
    description:
      "Track webhook activity and understand what is happening with your event deliveries.",
  },
  {
    icon: Code2,
    title: "Developer First",
    description:
      "Simple APIs designed to integrate with your existing backend without unnecessary complexity.",
  },
  {
    icon: Zap,
    title: "Fast Event Processing",
    description:
      "Events are queued and processed in the background so your application stays responsive.",
  },
];

const HomePage = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#070b14] text-white">
      {/* Navbar */}
      <nav className="border-b border-zinc-800/70 bg-[#070b14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5EA1FF]/10 ring-1 ring-[#5EA1FF]/20">
              <Webhook className="h-5 w-5 text-[#5EA1FF]" />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              TenantRelay
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
            <a
              href="#features"
              className="transition-colors hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition-colors hover:text-white"
            >
              How it works
            </a>

            <a
              href="#security"
              className="transition-colors hover:text-white"
            >
              Security
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden px-4 py-2 text-sm text-zinc-300 transition-colors hover:text-white sm:block"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-[#5EA1FF] px-4 py-2 text-sm font-medium text-[#06101f] transition-all hover:bg-[#75afff] hover:shadow-lg hover:shadow-[#5EA1FF]/20"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        {/* Background glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-[#5EA1FF]/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 md:pb-32 md:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#5EA1FF]/20 bg-[#5EA1FF]/5 px-4 py-2 text-sm text-[#9ec7ff]"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Webhook infrastructure for modern SaaS
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
            >
              Reliable Webhooks.
              <br />
              <span className="text-[#5EA1FF]">
                Built for Multi-Tenant SaaS.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg"
            >
              TenantRelay provides secure, reliable webhook delivery for
              multi-tenant applications with background processing, retries,
              HMAC signatures and delivery monitoring.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
            >
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#5EA1FF] px-6 py-3.5 font-medium text-[#06101f] transition-all hover:bg-[#75afff] hover:shadow-xl hover:shadow-[#5EA1FF]/20"
              >
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50 px-6 py-3.5 font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
              >
                See How It Works
              </a>
            </motion.div>
          </div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mx-auto mt-20 max-w-5xl"
          >
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-2 shadow-2xl shadow-black/40">
              <div className="rounded-xl border border-zinc-800/80 bg-[#0b101b] p-6 md:p-10">
                <div className="mb-8 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400/70" />
                  <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                  <span className="h-3 w-3 rounded-full bg-green-400/70" />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <p className="font-mono text-xs text-zinc-500">
                      EVENT
                    </p>
                    <p className="mt-3 text-sm font-medium">
                      order.created
                    </p>
                    <p className="mt-2 font-mono text-xs text-zinc-500">
                      tenant_8f21
                    </p>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="hidden h-px w-full bg-zinc-800 md:block" />
                    <div className="absolute rounded-full border border-[#5EA1FF]/30 bg-[#5EA1FF]/10 p-3">
                      <Webhook className="h-5 w-5 text-[#5EA1FF]" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
                    <p className="font-mono text-xs text-zinc-500">
                      DELIVERY
                    </p>
                    <p className="mt-3 flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Delivered
                    </p>
                    <p className="mt-2 font-mono text-xs text-zinc-500">
                      200 OK · 142ms
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-t border-zinc-800/70 bg-[#090e18]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#5EA1FF]">
              Infrastructure
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Everything you need for reliable webhooks.
            </h2>

            <p className="mt-4 text-zinc-400">
              Build webhook functionality into your SaaS without managing
              delivery infrastructure from scratch.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 transition-colors hover:border-[#5EA1FF]/30"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5EA1FF]/10 text-[#5EA1FF]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#5EA1FF]">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">
              From event to delivery.
            </h2>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-4">
            {[
              ["01", "Publish", "Your application publishes an event."],
              ["02", "Queue", "TenantRelay queues the event for processing."],
              ["03", "Deliver", "The worker sends it to your webhook."],
              ["04", "Monitor", "Track delivery and handle failures."],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6"
              >
                <span className="font-mono text-xs text-[#5EA1FF]">
                  {number}
                </span>

                <h3 className="mt-4 font-semibold">{title}</h3>

                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section
        id="security"
        className="border-y border-zinc-800/70 bg-[#090e18]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#5EA1FF]/10 text-[#5EA1FF]">
              <LockKeyhole className="h-6 w-6" />
            </div>

            <h2 className="mt-6 text-3xl font-semibold md:text-4xl">
              Security is part of the architecture.
            </h2>

            <p className="mt-5 leading-7 text-zinc-400">
              Tenant isolation, authenticated APIs, API-key based event
              ingestion and HMAC-signed webhook payloads help keep your
              integrations secure.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="relative overflow-hidden rounded-3xl border border-[#5EA1FF]/20 bg-[#5EA1FF]/5 px-6 py-16 text-center md:px-12">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5EA1FF]/10 blur-[100px]" />

            <div className="relative">
              <h2 className="text-3xl font-semibold md:text-4xl">
                Ready to build reliable integrations?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-zinc-400">
                Start building with TenantRelay and focus on your product
                instead of webhook delivery infrastructure.
              </p>

              <Link
                to="/register"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#5EA1FF] px-6 py-3.5 font-medium text-[#06101f] transition-all hover:bg-[#75afff]"
              >
                Create your workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 TenantRelay. Built for reliable event delivery.</p>

          <div className="flex items-center gap-5">
            <Link
              to="/login"
              className="transition-colors hover:text-zinc-300"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="transition-colors hover:text-zinc-300"
            >
              Get Started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;