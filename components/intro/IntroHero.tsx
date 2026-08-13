"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Gauge, LineChart, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TubeFieldBackground } from "@/components/intro/TubeFieldBackground";

interface Props {
  onEnter: () => void;
}

const FEATURES = [
  { icon: Gauge, text: "Iterative U convergence, not a single-pass check" },
  { icon: LineChart, text: "Digitized chart correlations, calibrated and flagged" },
  { icon: Printer, text: "Printable, office-ready result summary" },
];

const title = "Shell & Tube Heat Exchanger Calculator";

export function IntroHero({ onEnter }: Props) {
  const reduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") onEnter();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onEnter]);

  // Drives the tube-field background's cursor spotlight/glow (see
  // TubeFieldBackground.tsx + the .tube-field rules in globals.css) by
  // setting CSS custom properties directly on this container, rather than
  // React state - keeps pointermove smooth since nothing re-renders.
  // Listener lives on the whole hero (not just the background layer,
  // which is pointer-events: none) so it still tracks while hovering the
  // heading/button/text, via normal event bubbling.
  useEffect(() => {
    const el = heroRef.current;
    if (!el || reduceMotion) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        el.style.setProperty("--glow-opacity", "1");
      });
    };
    const onLeave = () => el.style.setProperty("--glow-opacity", "0");

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [reduceMotion]);

  const wordVariants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={heroRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.98 }}
      transition={{ duration: reduceMotion ? 0.1 : 0.35 }}
      className="relative flex min-h-svh w-full flex-col items-center justify-center gap-8 overflow-hidden px-6 py-16 text-center"
    >
      <TubeFieldBackground />

      <motion.h1
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: reduceMotion ? 0 : 0.05 }}
        className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        {title.split(" ").map((word, i) => (
          <motion.span
            key={`${word}-${i}`}
            variants={wordVariants}
            transition={{ duration: 0.4 }}
            className="mr-[0.3em] inline-block last:mr-0"
          >
            {word}
          </motion.span>
        ))}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.4, duration: 0.4 }}
        className="max-w-lg text-sm text-muted-foreground sm:text-base"
      >
        Kern&apos;s-method design calculator that replicates and improves on a
        classic Excel design sheet.
      </motion.p>

      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduceMotion ? 0 : 0.55, duration: 0.4 }}
        className="flex flex-col gap-2 text-left text-sm text-muted-foreground sm:flex-row sm:gap-6"
      >
        {FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2">
            <Icon className="size-4 shrink-0 text-primary" />
            {text}
          </li>
        ))}
      </motion.ul>

      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduceMotion ? 0 : 0.7, duration: 0.4 }}
        whileHover={{ scale: reduceMotion ? 1 : 1.03 }}
        whileTap={{ scale: reduceMotion ? 1 : 0.97 }}
      >
        <Button size="lg" onClick={onEnter} autoFocus>
          Get started
          <ArrowRight className="size-4" />
        </Button>
      </motion.div>

      <button
        type="button"
        onClick={onEnter}
        className="text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Skip
      </button>
    </motion.div>
  );
}
