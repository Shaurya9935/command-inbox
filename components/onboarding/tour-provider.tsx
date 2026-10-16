"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { TOUR_STEPS, TourStep } from "./tour-steps";
import { useTourTarget } from "./use-tour-target";
import { TourOverlay, computeTourPlacement } from "./tour-overlay";
import { TourCard } from "./tour-card";

export interface TourContextValue {
  isActive: boolean;
  currentStepIndex: number;
  currentStep: TourStep;
  totalSteps: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  finishTour: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) {
    return {
      isActive: false,
      currentStepIndex: 0,
      currentStep: TOUR_STEPS[0],
      totalSteps: TOUR_STEPS.length,
      startTour: () => {},
      nextStep: () => {},
      prevStep: () => {},
      skipTour: () => {},
      finishTour: () => {},
    };
  }
  return ctx;
}

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasConnectedIntegrations, setHasConnectedIntegrations] = useState(false);

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];

  // Target observing hook
  const { targetRect, isMobile, reducedMotion } = useTourTarget(
    isActive && !currentStep.isWelcome ? currentStep.targetSelector : undefined
  );

  // Fetch live integrations status for Step 3 "Connected" chip
  useEffect(() => {
    fetch("/api/integrations/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const statuses = data.statuses || {};
        const isConn = Boolean(statuses.gmail || statuses.googlecalendar);
        setHasConnectedIntegrations(isConn);
      })
      .catch(() => {});
  }, []);

  // Check onboarding persistence from DB on first load (runs once per session)
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      fetch("/api/onboarding")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (cancelled || !data) return;
          // Auto-start only if neither completed nor skipped
          if (!data.completed && !data.skipped) {
            setIsActive(true);
            setCurrentStepIndex(0);
          }
        })
        .catch(() => {});
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const saveStatus = async (action: "complete" | "skip") => {
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
    } catch (err) {
      console.warn("Failed to save onboarding status:", err);
    }
  };

  const focusCommandInput = () => {
    setTimeout(() => {
      const input = document.querySelector<HTMLTextAreaElement | HTMLInputElement>(
        '[data-tour="command-bar"] textarea, [data-tour="command-bar"] input'
      );
      if (input) {
        input.focus();
      }
    }, 100);
  };

  const startTour = useCallback(() => {
    setCurrentStepIndex(0);
    setIsActive(true);
  }, []);

  const skipTour = useCallback(() => {
    setIsActive(false);
    saveStatus("skip");
    focusCommandInput();
  }, []);

  const finishTour = useCallback(() => {
    setIsActive(false);
    saveStatus("complete");
    focusCommandInput();
  }, []);

  const nextStep = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      finishTour();
    }
  }, [currentStepIndex, finishTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const handleTryPrompt = (prompt: string) => {
    finishTour();
    setTimeout(() => {
      const input = document.querySelector<HTMLTextAreaElement | HTMLInputElement>(
        '[data-tour="command-bar"] textarea, [data-tour="command-bar"] input'
      );
      if (input) {
        input.value = prompt;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      }
    }, 120);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skipTour();
      } else if (e.key === "ArrowRight" || (e.key === "Enter" && !e.shiftKey)) {
        e.preventDefault();
        if (currentStepIndex === TOUR_STEPS.length - 1) {
          finishTour();
        } else {
          nextStep();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, currentStepIndex, nextStep, prevStep, skipTour, finishTour]);

  // Compute card positioning
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 900;
  const placement = computeTourPlacement(
    currentStep.isWelcome ? null : targetRect,
    currentStep.isWelcome ? 400 : 340,
    220,
    isMobile,
    windowWidth,
    windowHeight
  );

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStepIndex,
        currentStep,
        totalSteps: TOUR_STEPS.length,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        finishTour,
      }}
    >
      {children}

      {/* Render Tour Overlay and Card when Tour is active */}
      {isActive && (
        <>
          <TourOverlay
            targetRect={currentStep.isWelcome ? null : targetRect}
            isWelcome={Boolean(currentStep.isWelcome)}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            cardRect={{ width: currentStep.isWelcome ? 400 : 340, height: 220 }}
          />

          <TourCard
            step={currentStep}
            currentStepIndex={currentStepIndex}
            totalSteps={TOUR_STEPS.length}
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipTour}
            onFinish={finishTour}
            isMobile={isMobile}
            reducedMotion={reducedMotion}
            hasConnectedIntegrations={hasConnectedIntegrations}
            onTryPrompt={handleTryPrompt}
            positionStyle={placement.cardPosition}
          />
        </>
      )}
    </TourContext.Provider>
  );
}
