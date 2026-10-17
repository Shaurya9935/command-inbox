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
          background: "var(--bg-card)",
          border: "1px solid var(--border-subtle)",
          borderRadius: 18,
          boxShadow: "var(--shadow-modal)",
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
              color: "var(--text-muted)",
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
                background: "var(--status-success-bg)",
                color: "var(--status-success-text)",
                border: "1px solid var(--status-success-border)",
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
                  background: "var(--status-success-text)",
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
                background: "var(--status-success-bg)",
                color: "var(--status-success-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--status-success-text)" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
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
            color: "var(--text-primary)",
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
            color: "var(--text-secondary)",
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
                background: "var(--bg-inset)",
                border: "1px solid var(--border-subtle)",
                fontSize: 12.5,
                color: "var(--brand-accent)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.12s, border-color 0.12s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-hover)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-inset)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
            >
              <span>Try:</span>
              <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>
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
                    background: isCurrent ? "var(--brand-accent)" : "var(--border-subtle)",
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
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  borderRadius: 6,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
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
                      border: "1px solid var(--border-subtle)",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      transition: "background 0.12s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
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
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
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
                  background: "var(--brand-accent)",
                  color: "var(--text-inverse)",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-accent)")}
              >
                Start tour &rarr;
              </button>
            ) : isLast ? (
              <button
                type="button"
                onClick={onFinish}
                style={{
                  background: "var(--brand-accent)",
                  color: "var(--text-inverse)",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-accent)")}
              >
                Start using Nexus
              </button>
            ) : (
              <button
                type="button"
                onClick={onNext}
                style={{
                  background: "var(--brand-accent)",
                  color: "var(--text-inverse)",
                  border: "none",
                  padding: "7px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "var(--shadow-sm)",
                  transition: "background 0.12s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-accent-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--brand-accent)")}
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
              borderTop: "1px solid var(--border-subtle)",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: 10,
              color: "var(--text-muted)",
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
