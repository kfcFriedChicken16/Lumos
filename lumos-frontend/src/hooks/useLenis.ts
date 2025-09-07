"use client";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

export function useLenis(options: ConstructorParameters<typeof Lenis>[0] = {}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      ...options,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
}
