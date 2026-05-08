"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import enLanding from "@/locales/en/landing.json";
import type { Locale } from "@/lib/types";

type Landing = typeof enLanding;

const spring = { type: "spring" as const, stiffness: 140, damping: 20 };
const springSoft = { type: "spring" as const, stiffness: 80, damping: 18 };

export function HomeLanding({
  locale,
  landing,
  nav,
  appName,
  authed,
  role,
}: {
  locale: Locale;
  landing: Landing;
  nav: { signup: string; login: string; dashboard: string };
  appName: string;
  authed: boolean;
  role?: "user" | "agent";
}) {
  const reduce = useReducedMotion();

  const blobSlow = reduce
    ? {}
    : {
        animate: { y: [0, -18, 0], x: [0, 8, 0], scale: [1, 1.06, 1] },
        transition: { duration: 11, repeat: Infinity, ease: "easeInOut" as const },
      };
  const blobDrift = reduce
    ? {}
    : {
        animate: { x: [0, -22, 0], y: [0, 14, 0], scale: [1, 1.08, 1] },
        transition: { duration: 13, repeat: Infinity, ease: "easeInOut" as const },
      };
  const blobPulse = reduce
    ? {}
    : {
        animate: { scale: [1, 1.2, 1], opacity: [0.15, 0.32, 0.15] },
        transition: { duration: 8, repeat: Infinity, ease: "easeInOut" as const },
      };

  const ctaHref = authed ? (role === "agent" ? "/agent" : "/dashboard") : "/signup";
  const ctaLabel = authed ? nav.dashboard : nav.signup;

  const floaters = reduce
    ? null
    : (
        <>
          {[...Array(10)].map((_, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="pointer-events-none absolute rounded-full bg-primary/25 shadow-[0_0_12px_rgba(13,148,136,0.35)] dark:bg-primary/15"
              style={{
                width: 6 + (i % 4) * 4,
                height: 6 + (i % 4) * 4,
                left: `${8 + (i * 9) % 84}%`,
                top: `${12 + (i * 17) % 70}%`,
              }}
              animate={{
                y: [0, -14 - (i % 3) * 6, 0],
                opacity: [0.2, 0.75, 0.2],
                scale: [0.85, 1.15, 0.85],
              }}
              transition={{
                duration: 5 + (i % 4) * 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.35,
              }}
            />
          ))}
        </>
      );

  return (
    <>
      <main>
        <section className="landing-hero relative overflow-hidden px-4 pb-20 pt-14 md:pb-36 md:pt-28">
          <div className="landing-hero-mesh pointer-events-none absolute inset-0" aria-hidden />
          <div className="landing-hero-gradient pointer-events-none absolute inset-0" aria-hidden />

          {!reduce && (
            <motion.div
              aria-hidden
              className="landing-hero-ring pointer-events-none absolute left-1/2 top-1/2 h-[min(88vw,540px)] w-[min(88vw,540px)] rounded-full border-2 border-primary/25 dark:border-primary/15 md:top-[46%]"
            />
          )}

          <motion.div
            className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-primary/25 blur-3xl dark:bg-primary/15"
            aria-hidden
            {...(reduce ? {} : blobSlow)}
          />
          <motion.div
            className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-3xl dark:bg-accent/12"
            aria-hidden
            {...(reduce ? {} : blobDrift)}
          />
          <motion.div
            className="pointer-events-none absolute left-[18%] top-[55%] h-56 w-56 rounded-full bg-teal-400/30 blur-2xl dark:bg-teal-500/15"
            aria-hidden
            {...(reduce ? {} : blobPulse)}
          />
          <motion.div
            className="pointer-events-none absolute right-[12%] top-[22%] h-40 w-40 rounded-full bg-orange-300/25 blur-2xl dark:bg-orange-500/10"
            aria-hidden
            animate={
              reduce
                ? undefined
                : { rotate: [0, 12, 0], y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }
            }
            transition={
              reduce ? undefined : { duration: 16, repeat: Infinity, ease: "easeInOut" }
            }
          />

          {floaters}

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.04 }}
              className="mb-4 inline-block rounded-full border border-primary/35 bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.22em] text-primary shadow-sm backdrop-blur-sm dark:border-primary/25 dark:bg-primary/10 md:text-base"
            >
              {landing.eyebrow}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.1 }}
              className="landing-headline text-[2.1rem] font-bold leading-[1.12] tracking-tight md:text-5xl lg:text-[3.35rem]"
            >
              {landing.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.18 }}
              className="mx-auto mt-6 max-w-2xl text-lg text-muted md:text-xl md:leading-relaxed"
            >
              {landing.subhead}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.26 }}
              className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5"
            >
              <motion.div
                whileHover={reduce ? undefined : { scale: 1.03, y: -2 }}
                whileTap={reduce ? undefined : { scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="w-full sm:w-auto"
              >
                <Link
                  href={ctaHref}
                  className="landing-cta-primary inline-flex w-full items-center justify-center rounded-full px-9 py-4 text-base font-semibold text-primary-foreground shadow-[0_12px_40px_-12px_rgba(13,148,136,0.55)] sm:w-auto"
                >
                  {ctaLabel}
                </Link>
              </motion.div>
              {!authed && (
                <motion.div
                  whileHover={reduce ? undefined : { scale: 1.03, y: -2 }}
                  whileTap={reduce ? undefined : { scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="w-full sm:w-auto"
                >
                  <Link
                    href="/login"
                    className="landing-cta-secondary inline-flex w-full items-center justify-center rounded-full border-2 border-primary/40 bg-card/95 px-9 py-4 text-base font-semibold text-foreground shadow-md backdrop-blur-sm dark:border-border sm:w-auto"
                  >
                    {nav.login}
                  </Link>
                </motion.div>
              )}
            </motion.div>

            <a
              href="#steps"
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline md:mt-10"
            >
              <span aria-hidden className="text-lg leading-none">
                ↓
              </span>
              {landing.scrollHint}
            </a>

            {!reduce && (
              <motion.div
                aria-hidden
                className="mx-auto mt-8 flex max-w-lg justify-center gap-2 md:mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.55 }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 flex-1 max-w-[3.5rem] rounded-full bg-gradient-to-r from-primary/50 to-accent/50"
                    animate={{
                      opacity: [0.35, 1, 0.35],
                      scaleY: [0.65, 1.15, 0.65],
                      scaleX: [0.9, 1, 0.9],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.18,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </section>

        <section
          id="steps"
          className="relative z-20 scroll-mt-28 bg-transparent px-4 py-16 md:scroll-mt-32 md:py-28"
        >
          {!reduce && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-primary/40 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          )}
          {/* Per-card motion (no parent variant stagger): avoids cards stuck at opacity 0 after refresh / strict mode / testing. */}
          <div key={locale} className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {landing.steps.map((s, i) => (
              <motion.div
                key={`${locale}-${i}`}
                initial={reduce ? false : { y: 28 }}
                animate={{ y: 0 }}
                transition={
                  reduce
                    ? { duration: 0 }
                    : { ...springSoft, delay: 0.06 + i * 0.12 }
                }
                whileHover={reduce ? undefined : { y: -8, transition: springSoft }}
                className="landing-card group relative overflow-hidden rounded-2xl border-2 border-border bg-card p-7 shadow-lg md:p-8 dark:border-border"
              >
                {!reduce && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100 dark:bg-primary/15"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.75, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
                  />
                )}
                <motion.span
                  className="relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-base font-bold text-primary shadow-inner ring-2 ring-primary/20 dark:from-primary/25 dark:to-primary/5"
                  whileHover={reduce ? undefined : { rotate: [0, -6, 6, 0], transition: { duration: 0.5 } }}
                >
                  {i + 1}
                </motion.span>
                <h3 className="relative text-xl font-semibold tracking-tight text-foreground">{s.title}</h3>
                <p className="relative mt-3 text-base leading-relaxed text-muted">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <motion.footer
        className="border-t-2 border-border/80 bg-card/90 px-4 py-12 text-base text-muted shadow-[0_-8px_32px_-16px_rgba(4,47,46,0.08)] backdrop-blur-md dark:border-border dark:shadow-none"
        initial={{ opacity: 1, y: reduce ? 0 : 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSoft}
      >
        <div className="mx-auto max-w-6xl text-center">
          <p>
            &copy; {new Date().getFullYear()} {appName}. {landing.footer}
          </p>
        </div>
      </motion.footer>
    </>
  );
}
