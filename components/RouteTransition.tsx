"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

/** Easing close to iOS / material “emphasized decelerate” — single smooth motion, not two hits */
const easeOut = [0.16, 1, 0.3, 1] as const;

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const hasHydrated = useRef(false);

  useEffect(() => {
    hasHydrated.current = true;
  }, []);

  if (reduce) {
    return <div className="flex min-h-screen w-full flex-col">{children}</div>;
  }

  const skipEnter = !hasHydrated.current;

  return (
    <div className="relative min-h-screen w-full">
      <AnimatePresence initial={false} mode="sync">
        <motion.div
          key={pathname}
          className="absolute inset-x-0 top-0 flex min-h-screen w-full flex-col"
          initial={skipEnter ? false : { opacity: 0, y: 10 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              opacity: { duration: 0.36, ease: easeOut },
              y: { type: "spring", stiffness: 520, damping: 40, mass: 0.5 },
            },
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.22, ease: easeOut },
          }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
