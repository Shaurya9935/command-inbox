"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

export interface EmailBodyProps {
  body?: string;
  bodyHtml?: string;
  preview?: string;
  isLoading?: boolean;
}

/**
 * Parses plain text and converts raw URLs into clickable anchor links
 */
export function LinkifiedText({ text }: { text: string }) {
  const elements = useMemo(() => {
    if (!text) return null;

    // Matches http://, https://, and www. links
    const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s]|www\.[^\s<]+[^<.,:;"')\]\s])/gi;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = urlRegex.exec(text)) !== null) {
      const url = match[0];
      const matchStart = match.index;

      // Text before the URL
      if (matchStart > lastIndex) {
        parts.push(text.slice(lastIndex, matchStart));
      }

      const href = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;

      parts.push(
        <a
          key={matchStart}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#5549C0",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            wordBreak: "break-all",
            fontWeight: 500,
            cursor: "pointer",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {url}
        </a>
      );

      lastIndex = matchStart + url.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts;
  }, [text]);

  return (
    <div
      style={{
        fontSize: 14,
        color: "#2D2C2A",
        fontFamily: "var(--font-body, 'Inter', system-ui, sans-serif)",
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {elements}
    </div>
  );
}

/**
 * Renders HTML email inside a responsive, sandbox-isolated iframe with auto-height
 */
function HtmlEmailIframe({ html }: { html: string }) {
  const [iframeHeight, setIframeHeight] = useState<number>(300);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const fullHtml = useMemo(() => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <base target="_blank">
  <style>
    *, *:before, *:after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 1.65;
      color: #2D2C2A;
      word-break: break-word;
      overflow-wrap: break-word;
      background-color: transparent;
    }
    a {
      color: #5549C0 !important;
      text-decoration: underline !important;
      text-underline-offset: 3px !important;
    }
    img {
      max-width: 100% !important;
      height: auto !important;
    }
    table {
      max-width: 100% !important;
    }
    blockquote {
      margin: 12px 0;
      padding-left: 12px;
      border-left: 3px solid #E4E0D8;
      color: #6B6762;
    }
  </style>
</head>
<body>
  <div id="email-inner-root">${html}</div>
  <script>
    function notifyHeight() {
      try {
        const root = document.getElementById('email-inner-root');
        const height = Math.max(
          root ? root.scrollHeight : 0,
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        window.parent.postMessage({ type: 'EMAIL_FRAME_HEIGHT', height }, '*');
      } catch (e) {}
    }
    window.addEventListener('load', notifyHeight);
    window.addEventListener('resize', notifyHeight);
    document.addEventListener('DOMContentLoaded', notifyHeight);
    setTimeout(notifyHeight, 50);
    setTimeout(notifyHeight, 200);
    setTimeout(notifyHeight, 600);
    setTimeout(notifyHeight, 1500);
  </script>
</body>
</html>`;
  }, [html]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "EMAIL_FRAME_HEIGHT" && typeof event.data.height === "number") {
        setIframeHeight(Math.max(120, event.data.height + 24));
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <iframe
      ref={frameRef}
      srcDoc={fullHtml}
      title="Email content"
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      style={{
        width: "100%",
        height: `${iframeHeight}px`,
        border: "none",
        overflow: "hidden",
        display: "block",
        transition: "height 0.15s ease",
      }}
    />
  );
}

export function EmailBodyContent({
  body,
  bodyHtml,
  preview,
  isLoading,
}: EmailBodyProps) {
  const hasHtml = Boolean(bodyHtml && bodyHtml.trim().length > 0);
  const hasText = Boolean(body && body.trim().length > 0);
  const [viewMode, setViewMode] = useState<"html" | "text">("html");

  // Determine what to display
  const activeContentIsHtml = hasHtml && viewMode === "html";
  const displayText = hasText ? body! : preview || "";

  if (isLoading) {
    return (
      <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            style={{ animation: "spin 0.8s linear infinite" }}
          >
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <circle cx="8" cy="8" r="6" stroke="#EAE8F8" strokeWidth="2" />
            <path d="M8 2a6 6 0 016 6" stroke="#5549C0" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span
            style={{
              fontSize: 12.5,
              color: "#9B9691",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
            }}
          >
            Loading full message…
          </span>
        </div>
        <div
          style={{
            height: 14,
            background: "#F2EFE9",
            borderRadius: 4,
            width: "80%",
            animation: "pulse 1.2s infinite ease-in-out",
          }}
        />
        <div
          style={{
            height: 14,
            background: "#F2EFE9",
            borderRadius: 4,
            width: "92%",
            animation: "pulse 1.2s infinite ease-in-out",
          }}
        />
        <div
          style={{
            height: 14,
            background: "#F2EFE9",
            borderRadius: 4,
            width: "60%",
            animation: "pulse 1.2s infinite ease-in-out",
          }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Toggle between HTML and Plain Text if both are present */}
      {hasHtml && hasText && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 4,
            marginBottom: 14,
            borderBottom: "1px solid #F0ECE4",
            paddingBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#A8A49E",
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              marginRight: 4,
            }}
          >
            Format:
          </span>
          <button
            type="button"
            onClick={() => setViewMode("html")}
            style={{
              fontSize: 11.5,
              padding: "2px 8px",
              borderRadius: 5,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              background: viewMode === "html" ? "#EAE8F8" : "transparent",
              color: viewMode === "html" ? "#5549C0" : "#8A857F",
              fontWeight: viewMode === "html" ? 600 : 400,
              transition: "background 0.12s, color 0.12s",
            }}
          >
            Rich
          </button>
          <button
            type="button"
            onClick={() => setViewMode("text")}
            style={{
              fontSize: 11.5,
              padding: "2px 8px",
              borderRadius: 5,
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-ui, 'DM Sans', system-ui, sans-serif)",
              background: viewMode === "text" ? "#EAE8F8" : "transparent",
              color: viewMode === "text" ? "#5549C0" : "#8A857F",
              fontWeight: viewMode === "text" ? 600 : 400,
              transition: "background 0.12s, color 0.12s",
            }}
          >
            Plain Text
          </button>
        </div>
      )}

      {/* Body content */}
      {activeContentIsHtml ? (
        <HtmlEmailIframe html={bodyHtml!} />
      ) : (
        <LinkifiedText text={displayText} />
      )}
    </div>
  );
}
