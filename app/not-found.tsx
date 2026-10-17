import Link from "next/link";

export default function NotFound() {
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
          padding: "36px 32px",
          textAlign: "center",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "var(--font-mono, monospace)",
            color: "var(--accent-text)",
            background: "var(--accent-tint)",
            padding: "4px 10px",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          404 · Not Found
        </div>
        <h1
          style={{
            margin: "0 0 8px 0",
            fontSize: "22px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            margin: "0 0 24px 0",
            fontSize: "14px",
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          The page or resource you are looking for could not be found or has been moved.
        </p>
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 20px",
            background: "var(--accent-solid)",
            color: "var(--on-accent)",
            border: "none",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            textDecoration: "none",
            cursor: "pointer",
            transition: "opacity 0.15s ease",
          }}
        >
          Return to dashboard
        </Link>
      </div>
    </div>
  );
}
