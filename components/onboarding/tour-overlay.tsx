"use client";

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TargetRect } from "./use-tour-target";

export interface TourOverlayProps {
  targetRect: TargetRect | null;
  isWelcome: boolean;
  isMobile: boolean;
  reducedMotion: boolean;
  cardRect: { width: number; height: number };
}

export interface ComputedPlacement {
  placement: "center" | "top" | "bottom" | "left" | "right";
  cardPosition: {
    top?: number;
    left?: number;
    bottom?: number;
    right?: number;
    transform?: string;
  };
  arrowPath?: {
    d: string;
    headX: number;
    headY: number;
    headAngle: number;
  };
}

export function computeTourPlacement(
  targetRect: TargetRect | null,
  cardWidth: number,
  cardHeight: number,
  isMobile: boolean,
  windowWidth: number,
  windowHeight: number
): ComputedPlacement {
  if (isMobile || !targetRect) {
    return {
      placement: "center",
      cardPosition: isMobile
        ? {}
        : {
            top: windowHeight / 2 - cardHeight / 2,
            left: windowWidth / 2 - cardWidth / 2,
          },
    };
  }

  const padding = 8;
  const targetBox = {
    top: Math.max(0, targetRect.top - padding),
    left: Math.max(0, targetRect.left - padding),
    right: Math.min(windowWidth, targetRect.right + padding),
    bottom: Math.min(windowHeight, targetRect.bottom + padding),
    width: targetRect.width + padding * 2,
    height: targetRect.height + padding * 2,
    x: targetRect.x - padding,
    y: targetRect.y - padding,
  };

  const spaceRight = windowWidth - targetBox.right;
  const spaceLeft = targetBox.left;
  const spaceBottom = windowHeight - targetBox.bottom;
  const spaceTop = targetBox.top;

  const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(val, max));

  let placement: "right" | "left" | "bottom" | "top" = "right";

  if (spaceRight >= cardWidth + 36) {
    placement = "right";
  } else if (spaceLeft >= cardWidth + 36) {
    placement = "left";
  } else if (spaceBottom >= cardHeight + 36) {
    placement = "bottom";
  } else if (spaceTop >= cardHeight + 36) {
    placement = "top";
  } else {
    // Pick whichever has the largest space
    const maxSpace = Math.max(spaceRight, spaceLeft, spaceBottom, spaceTop);
    if (maxSpace === spaceRight) placement = "right";
    else if (maxSpace === spaceLeft) placement = "left";
    else if (maxSpace === spaceBottom) placement = "bottom";
    else placement = "top";
  }

  let cardLeft = 16;
  let cardTop = 16;

  let arrowStart = { x: 0, y: 0 };
  let arrowEnd = { x: 0, y: 0 };
  let arrowCp = { x: 0, y: 0 };
  let headAngle = 0;

  if (placement === "right") {
    cardLeft = targetBox.right + 26;
    cardTop = clamp(
      targetBox.y + targetBox.height / 2 - cardHeight / 2,
      16,
      windowHeight - cardHeight - 16
    );

    arrowStart = { x: cardLeft, y: cardTop + 40 };
    arrowEnd = { x: targetBox.right + 5, y: targetBox.y + targetBox.height / 2 };
    arrowCp = {
      x: (arrowStart.x + arrowEnd.x) / 2,
      y: arrowStart.y - 20,
    };
    headAngle = Math.atan2(arrowEnd.y - arrowCp.y, arrowEnd.x - arrowCp.x);
  } else if (placement === "left") {
    cardLeft = targetBox.left - cardWidth - 26;
    cardTop = clamp(
      targetBox.y + targetBox.height / 2 - cardHeight / 2,
      16,
      windowHeight - cardHeight - 16
    );

    arrowStart = { x: cardLeft + cardWidth, y: cardTop + 40 };
    arrowEnd = { x: targetBox.left - 5, y: targetBox.y + targetBox.height / 2 };
    arrowCp = {
      x: (arrowStart.x + arrowEnd.x) / 2,
      y: arrowStart.y - 20,
    };
    headAngle = Math.atan2(arrowEnd.y - arrowCp.y, arrowEnd.x - arrowCp.x);
  } else if (placement === "bottom") {
    cardLeft = clamp(
      targetBox.x + targetBox.width / 2 - cardWidth / 2,
      16,
      windowWidth - cardWidth - 16
    );
    cardTop = targetBox.bottom + 26;

    arrowStart = { x: cardLeft + cardWidth / 2, y: cardTop };
    arrowEnd = { x: targetBox.x + targetBox.width / 2, y: targetBox.bottom + 5 };
    arrowCp = {
      x: (arrowStart.x + arrowEnd.x) / 2 + 30,
      y: (arrowStart.y + arrowEnd.y) / 2,
    };
    headAngle = Math.atan2(arrowEnd.y - arrowCp.y, arrowEnd.x - arrowCp.x);
  } else {
    // top
    cardLeft = clamp(
      targetBox.x + targetBox.width / 2 - cardWidth / 2,
      16,
      windowWidth - cardWidth - 16
    );
    cardTop = targetBox.top - cardHeight - 26;

    arrowStart = { x: cardLeft + cardWidth / 2, y: cardTop + cardHeight };
    arrowEnd = { x: targetBox.x + targetBox.width / 2, y: targetBox.top - 5 };
    arrowCp = {
      x: (arrowStart.x + arrowEnd.x) / 2 + 30,
      y: (arrowStart.y + arrowEnd.y) / 2,
    };
    headAngle = Math.atan2(arrowEnd.y - arrowCp.y, arrowEnd.x - arrowCp.x);
  }

  const d = `M ${arrowStart.x} ${arrowStart.y} Q ${arrowCp.x} ${arrowCp.y} ${arrowEnd.x} ${arrowEnd.y}`;

  return {
    placement,
    cardPosition: {
      left: cardLeft,
      top: cardTop,
    },
    arrowPath: {
      d,
      headX: arrowEnd.x,
      headY: arrowEnd.y,
      headAngle,
    },
  };
}

export function TourOverlay({
  targetRect,
  isWelcome,
  isMobile,
  reducedMotion,
  cardRect,
}: TourOverlayProps) {
  const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1440;
  const windowHeight = typeof window !== "undefined" ? window.innerHeight : 900;

  const placement = useMemo(
    () =>
      computeTourPlacement(
        targetRect,
        cardRect.width || 340,
        cardRect.height || 230,
        isMobile,
        windowWidth,
        windowHeight
      ),
    [targetRect, cardRect.width, cardRect.height, isMobile, windowWidth, windowHeight]
  );

  const padding = 8;
  const hasTarget = Boolean(targetRect) && !isWelcome;

  const targetBox = targetRect
    ? {
        x: targetRect.x - padding,
        y: targetRect.y - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : {
        x: windowWidth / 2,
        y: windowHeight / 2,
        width: 0,
        height: 0,
      };

  const springTransition = reducedMotion
    ? { duration: 0.1 }
    : { type: "spring" as const, stiffness: 350, damping: 32, mass: 0.7 };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99990,
        pointerEvents: "none",
      }}
    >
      {/* Dimmed backdrop with smooth SVG cut-out mask */}
      <svg
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 99991,
          pointerEvents: "none",
        }}
      >
        <defs>
          <mask id="nexus-tour-mask">
            {/* White covers entire screen */}
            <rect width="100%" height="100%" fill="white" />

            {/* Black cuts out the spotlight hole */}
            {hasTarget ? (
              <motion.rect
                animate={{
                  x: targetBox.x,
                  y: targetBox.y,
                  width: targetBox.width,
                  height: targetBox.height,
                  rx: 14,
                }}
                transition={springTransition}
                fill="black"
              />
            ) : null}
          </mask>
        </defs>

        {/* Backdrop rect using mask - absorbs clicks on dimmed background */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(22, 21, 26, 0.5)"
          mask="url(#nexus-tour-mask)"
          style={{ pointerEvents: "auto" }}
          onClick={(e) => {
            // Prevent clicks on dimmed overlay from affecting underlying page
            e.preventDefault();
            e.stopPropagation();
          }}
        />
      </svg>

      {/* Target Ring & Slow Soft Pulse */}
      {hasTarget && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 99992 }}>
          {/* Static Ring */}
          <motion.div
            animate={{
              x: targetBox.x,
              y: targetBox.y,
              width: targetBox.width,
              height: targetBox.height,
            }}
            transition={springTransition}
            style={{
              position: "absolute",
              border: "2px solid #5046B8",
              borderRadius: 14,
              boxSizing: "border-box",
            }}
          />

          {/* Pulsing Glow Ring (scale 1 -> 1.04, opacity 0.6 -> 0, 2.4s) */}
          {!reducedMotion && (
            <motion.div
              animate={{
                x: targetBox.x,
                y: targetBox.y,
                width: targetBox.width,
                height: targetBox.height,
              }}
              transition={springTransition}
              style={{
                position: "absolute",
                borderRadius: 14,
                border: "2px solid #5046B8",
                boxSizing: "border-box",
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.04],
                  opacity: [0.6, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.4,
                  ease: "easeOut",
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 14,
                  border: "2px solid #5046B8",
                  boxSizing: "border-box",
                }}
              />
            </motion.div>
          )}
        </div>
      )}

      {/* Hand-drawn style Curved SVG Arrow */}
      {hasTarget && !isMobile && placement.arrowPath && (
        <svg
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 99994,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <AnimatePresence mode="wait">
            <g key={placement.arrowPath.d}>
              {/* Curved Bézier path */}
              <motion.path
                d={placement.arrowPath.d}
                fill="none"
                stroke="#5046B8"
                strokeWidth={2}
                strokeLinecap="round"
                initial={reducedMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0.1 }
                    : { duration: 0.6, ease: "easeOut", delay: 0.15 }
                }
              />

              {/* Arrowhead at target edge */}
              <motion.g
                initial={reducedMotion ? false : { opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={
                  reducedMotion
                    ? { duration: 0.1 }
                    : { duration: 0.25, delay: 0.55, ease: "easeOut" }
                }
                transform={`translate(${placement.arrowPath.headX}, ${placement.arrowPath.headY}) rotate(${(placement.arrowPath.headAngle * 180) / Math.PI})`}
              >
                <path
                  d="M -9 -5 L 0 0 L -9 5"
                  fill="none"
                  stroke="#5046B8"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.g>
            </g>
          </AnimatePresence>
        </svg>
      )}
    </div>
  );
}
