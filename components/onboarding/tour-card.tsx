"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { TourStep } from "./tour-steps";

export interface TourCardProps {
  step: TourStep;
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onFinish: () => void;
  isMobile?: boolean;
  reducedMotion?: boolean;
  hasConnectedIntegrations?: boolean;
  onTryPrompt?: (prompt: string) => void;
  positionStyle?: React.CSSProperties;
}

export function TourCard({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  onFinish,
  isMobile = false,
  reducedMotion = false,
  hasConnectedIntegrations = false,
  onTryPrompt,
  positionStyle = {},
}: TourCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Focus trap: keep focus within card when active
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }, [step.id]);

  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === totalSteps - 1;

  // Spring animation variants
  const cardVariants: Variants = {
    initial: {
      opacity: 0,
      scale: step.isWelcome ? 0.96 : 1,
      y: step.isWelcome ? 0 : 8,
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: reducedMotion
        ? { duration: 0.1 }
        : { type: "spring" as const, stiffness: 380, damping: 28, mass: 0.8 },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      y: -6,
      transition: { duration: 0.15 },
    },
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        ref={containerRef}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-desc"
        aria-live="polite"
        style={{
          position: "fixed",
          zIndex: 99999,
          width: isMobile ? "calc(100% - 32px)" : step.isWelcome ? 400 : 340,
          background: "#FFFFFF",
          border: "1px solid #E8E4DC",
          borderRadius: 18,
          boxShadow:
            "0 20px 48px -8px rgba(22, 21, 26, 0.16), 0 4px 12px rgba(22, 21, 26, 0.05)",
          padding: 20,
          fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
          boxSizing: "border-box",
          ...(isMobile
            ? {
                left: 16,
                right: 16,
                bottom: 20,
                top: "auto",
              }
            : positionStyle),
        }}
      >
        {/* Step Indicator and Step Label */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: 10.5,
              fontWeight: 600,
              color: "#858079",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            STEP {step.stepNumber} OF {step.totalSteps}
          </span>

          {/* Connected chip for Connect Apps step */}
          {step.showConnectedChip && hasConnectedIntegrations && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                background: "#ECFDF5",
                color: "#166534",
                border: "1px solid #BBF7D0",
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 12,
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#16A34A",
                }}
              />
              Connected
            </span>
          )}

          {/* Finished Animated Check Icon */}
          {step.isFinish && (
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "#ECFDF5",
                color: "#16A34A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M20 6L9 17l-5-5"
                  initial={reducedMotion ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h3
          id="tour-step-title"
          style={{
            margin: "0 0 6px",
            fontSize: 18,
            fontWeight: 600,
            color: "#1A1917",
            letterSpacing: "-0.01em",
            fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
          }}
        >
          {step.title}
        </h3>

        {/* Body Text */}
        <p
          id="tour-step-desc"
          style={{
            margin: "0 0 16px",
            fontSize: 14.5,
            color: "#6B6762",
            lineHeight: 1.5,
          }}
        >
          {step.body}
        </p>

        {/* Step 7 Finish Suggestion Chip */}
        {step.isFinish && onTryPrompt && (
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => onTryPrompt("Show my unread emails")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 8,
                background: "#F5F2EC",
                border: "1px solid #E8E4DC",
                fontSize: 12.5,
                color: "#5046B8",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.12s, border-color 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#EDE8DF";
                e.currentTarget.style.borderColor = "#D1C9BE";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#F5F2EC";
                e.currentTarget.style.borderColor = "#E8E4DC";
              }}
            >
              <span>Try:</span>
              <span style={{ fontWeight: 500, color: "#1A1917" }}>
                &ldquo;Show my unread emails&rdquo;
              </span>
              <span style={{ fontSize: 13, opacity: 0.7 }}>&rarr;</span>
            </button>
          </div>
        )}

        {/* Progress Dots */}
        {!step.isWelcome && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              marginBottom: 16,
            }}
          >
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  style={{
                    height: 5,
                    width: isCurrent ? 20 : 5,
                    borderRadius: 4,
                    background: isCurrent ? "#5046B8" : "#E4DED4",
                    transition: "all 0.25s ease",
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Actions Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          {/* Left Action: Skip tour text link OR Back button */}
          <div>
            {step.isWelcome ? (
              <button
                type="button"
                onClick={onSkip}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "6px 10px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#858079",
                  cursor: "pointer",
                  borderRadius: 6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1A1917")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#858079")}
              >
                Skip
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {!isFirst && (
                  <button
                    type="button"
                    onClick={onBack}
                    style={{
                      background: "transparent",
                      border: "1px solid #E8E4DC",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "#6B6762",
                      cursor: "pointer",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F7F4EE")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={onSkip}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "4px 6px",
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#A8A29A",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#6B6762")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#A8A29A")}
                >
                  Skip tour
                </button>
              </div>
            )}
          </div>

          {/* Right Action: Next or Start / Finish */}
          <div>
            {step.isWelcome ? (
              <button
                type="button"
                onClick={onNext}
                style={{
                  background: "#5046B8",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(80, 70, 184, 0.25)",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4339A6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#5046B8")}
              >
                Start tour &rarr;
              </button>
            ) : isLast ? (
              <button
                type="button"
                onClick={onFinish}
                style={{
                  background: "#5046B8",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 2px 6px rgba(80, 70, 184, 0.25)",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4339A6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#5046B8")}
              >
                Start using Nexus
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                style={{
                  background: "#5046B8",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "7px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(80, 70, 184, 0.2)",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#4339A6")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#5046B8")}
              >
                Next &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Keyboard hints footer */}
        {!isMobile && (
          <div
            style={{
              marginTop: 14,
              paddingTop: 10,
              borderTop: "1px solid #F3EFE8",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: 10,
              color: "#B4ADA4",
              textAlign: "center",
              letterSpacing: "0.02em",
            }}
          >
            &rarr; next &middot; &larr; back &middot; Esc skip
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
