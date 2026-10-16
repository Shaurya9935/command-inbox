"use client";

import { useState, useEffect, useCallback } from "react";

export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export function useTourTarget(targetSelector?: string) {
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const measure = useCallback(() => {
    if (!targetSelector) {
      setTargetRect(null);
      setTargetElement(null);
      return;
    }

    const el = document.querySelector<HTMLElement>(targetSelector);
    if (!el) {
      setTargetRect(null);
      setTargetElement(null);
      return;
    }

    // Check if element is displayed and in DOM
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      setTargetRect(null);
      setTargetElement(null);
      return;
    }

    setTargetElement(el);
    setTargetRect({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      right: rect.right,
      bottom: rect.bottom,
    });
  }, [targetSelector]);

  // Handle window media queries
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkMedia = () => {
      setIsMobile(window.innerWidth < 768);
      setReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    };

    checkMedia();
    window.addEventListener("resize", checkMedia);
    return () => window.removeEventListener("resize", checkMedia);
  }, []);

  // Measure and observe element
  useEffect(() => {
    if (typeof window === "undefined") return;

    const raf = requestAnimationFrame(() => {
      measure();
    });

    if (!targetSelector) {
      return () => cancelAnimationFrame(raf);
    }

    const el = document.querySelector<HTMLElement>(targetSelector);
    if (el) {
      // Scroll into view gently if outside viewport
      const rect = el.getBoundingClientRect();
      const inView =
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth;

      if (!inView) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    const handleUpdate = () => {
      measure();
    };

    window.addEventListener("resize", handleUpdate, { passive: true });
    window.addEventListener("scroll", handleUpdate, { passive: true });

    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => handleUpdate());
      ro.observe(el);
      ro.observe(document.body);
    }

    // Also poll briefly for animations (like sidebar expand)
    const interval = setInterval(measure, 100);
    const timeout = setTimeout(() => clearInterval(interval), 1000);

    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate);
      clearInterval(interval);
      clearTimeout(timeout);
      if (ro) ro.disconnect();
    };
  }, [targetSelector, measure]);

  return { targetRect, targetElement, isMobile, reducedMotion, remeasure: measure };
}
