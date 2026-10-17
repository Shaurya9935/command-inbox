"use client";

import { useEffect } from "react";
import Link from "next/link";
import { log } from "@/lib/logger";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error("Unhandled client error in error boundary", { error });
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-page)",
        fontFamily: "var(--font-ui, sans-serif)",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "var(--surface-card)",
          border: "1px solid var(--border-hairline)",
          borderRadius: "16px",
          padding: "32px",
          textAlign: "center",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "var(--danger-tint)",
            color: "var(--danger)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
            fontSize: "20px",
            fontWeight: 700,
          }}
        >
          !
        </div>
        <h2
          style={{
            margin: "0 0 8px 0",
            fontSize: "20px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Something went wrong
        </h2>
        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "14px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          An unexpected error occurred while processing your request. Please try again.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "10px 18px",
              background: "var(--accent-solid)",
              color: "var(--on-accent)",
              border: "none",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "opacity 0.15s ease",
            }}
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            style={{
              padding: "10px 18px",
              background: "var(--surface-raised)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border-strong)",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: 500,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
