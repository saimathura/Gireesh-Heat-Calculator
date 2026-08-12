"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { fmt } from "@/lib/format";

interface Props {
  value: number;
  decimals?: number;
}

/** Tweens from the previous displayed value to the new one on change,
 * rather than popping straight to the new number. */
export function AnimatedNumber({ value, decimals = 1 }: Props) {
  const [displayed, setDisplayed] = useState(value);
  const previousRef = useRef(value);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) {
      previousRef.current = value;
      return;
    }
    const controls = animate(previousRef.current, value, {
      duration: 0.7,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayed(latest),
    });
    previousRef.current = value;
    return () => controls.stop();
  }, [value, reduceMotion]);

  // Reduced-motion renders the target value directly rather than the
  // (possibly stale) tweened state, since no tween effect ever runs for it.
  return <>{fmt(reduceMotion ? value : displayed, decimals)}</>;
}
