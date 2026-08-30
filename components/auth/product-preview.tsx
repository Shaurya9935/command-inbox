import React from "react";
import { CommandInboxIcon } from "./icons";

export function ProductPreview() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-10 overflow-hidden select-none">
      {/* Ambient gradient blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="blob-a absolute -top-24 -left-16 w-[480px] h-[480px] rounded-full opacity-50"
          style={{
            background: "radial-gradient(circle, #E5F0EA 0%, transparent 70%)",
          }}
        />
        <div
          className="blob-b absolute top-1/3 -right-20 w-[400px] h-[400px] rounded-full opacity-35"
          style={{
            background: "radial-gradient(circle, #D4E8DE 0%, transparent 70%)",
          }}
        />
        <div
          className="blob-c absolute -bottom-20 left-1/4 w-[360px] h-[360px] rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, #E5E1D8 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Product mock UI */}
      <div className="float-gentle relative z-10 w-full max-w-[520px]">
        <div
          className="rounded-[14px] overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.78)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(229,225,216,0.6)",
            boxShadow:
              "0 4px 40px rgba(36,92,74,0.07), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}
        >
          {/* Titlebar */}
          <div
            className="flex items-center gap-2 px-4 h-9 border-b"
            style={{
              borderColor: "rgba(229,225,216,0.7)",
              background: "rgba(229,240,234,0.3)",
            }}
          >
            <div className="flex gap-1.5">
              {["#F87171", "#FBBF24", "#34D399"].map((c, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: c, opacity: 0.65 }}
                />
              ))}
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#77736D]">
                <CommandInboxIcon size={13} />
                Command Inbox
              </div>
            </div>
          </div>

          {/* App body */}
          <div className="flex" style={{ height: "340px" }}>
            {/* Sidebar */}
            <div
              className="w-[48px] flex flex-col items-center gap-3 py-4 border-r"
              style={{
                borderColor: "rgba(229,225,216,0.6)",
                background: "rgba(229,240,234,0.2)",
              }}
            >
              {[
                <path
                  key="a"
                  d="M4 4h8v8H4zM10 10h8v8h-8z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />,
                <path
                  key="b"
                  d="M3 6h14M3 10h10M3 14h8"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />,
                <path
                  key="c"
                  d="M4 5h14v12H4zM4 9h14M8 5v4"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                />,
              ].map((icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 flex items-center justify-center rounded-[6px] transition-colors"
                  style={{
                    color: i === 0 ? "#245C4A" : "#C4BFB8",
                    background:
                      i === 0 ? "rgba(36,92,74,0.09)" : "transparent",
                  }}
                  aria-label={["Inbox", "Messages", "Calendar"][i]}
                >
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                    {icon}
                  </svg>
                </button>
              ))}
            </div>

            {/* Inbox panel */}
            <div
              className="w-[190px] flex flex-col border-r"
              style={{ borderColor: "rgba(229,225,216,0.6)" }}
            >
              <div
                className="px-3 py-2.5 border-b flex items-center justify-between"
                style={{ borderColor: "rgba(229,225,216,0.5)" }}
              >
                <span className="text-[11px] font-semibold text-[#242424]">
                  Inbox
                </span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "rgba(36,92,74,0.1)",
                    color: "#245C4A",
                  }}
                >
                  4
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                {[
                  {
                    from: "Alex M.",
                    subject: "Q4 planning doc",
                    time: "9:41",
                    unread: true,
                  },
                  {
                    from: "Priya S.",
                    subject: "Design review tomorrow",
                    time: "8:22",
                    unread: true,
                  },
                  {
                    from: "Team",
                    subject: "Weekly standup notes",
                    time: "Tue",
                    unread: false,
                  },
                  {
                    from: "Jordan K.",
                    subject: "Contract draft v2",
                    time: "Mon",
                    unread: false,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`email-row-${i + 1} px-3 py-2 cursor-default border-b`}
                    style={{
                      borderColor: "rgba(229,225,216,0.4)",
                      background:
                        i === 0 ? "rgba(36,92,74,0.04)" : "transparent",
                    }}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        {item.unread && (
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: "#245C4A" }}
                          />
                        )}
                        <span
                          className={`text-[11px] truncate ${
                            item.unread
                              ? "font-semibold text-[#242424]"
                              : "font-medium text-[#77736D]"
                          }`}
                        >
                          {item.from}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#C4BFB8] flex-shrink-0">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-[#77736D] truncate pl-3">
                      {item.subject}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main area */}
            <div className="flex-1 flex flex-col">
              {/* Command bar */}
              <div
                className="cmd-appear px-4 py-3 border-b"
                style={{ borderColor: "rgba(229,225,216,0.6)" }}
              >
                <div
                  className="flex items-center gap-2 h-8 px-3 rounded-[7px]"
                  style={{
                    background: "rgba(229,240,234,0.5)",
                    border: "1px solid rgba(36,92,74,0.15)",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{ color: "#77736D", flexShrink: 0 }}
                  >
                    <path
                      d="M2 4.5l2 1.5L2 7.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="5.5"
                      y="6"
                      width="5"
                      height="1.2"
                      rx="0.6"
                      fill="currentColor"
                      opacity="0.7"
                    />
                  </svg>
                  <span className="text-[11px] text-[#77736D] flex-1 truncate">
                    Schedule a meeting with Alex tomorrow at 10 AM
                  </span>
                  <span className="cursor-blink text-[11px] font-medium text-[#245C4A]">
                    |
                  </span>
                </div>
              </div>

              {/* Email preview + calendar */}
              <div className="flex-1 flex overflow-hidden">
                {/* Email detail */}
                <div
                  className="flex-1 p-4 border-r"
                  style={{ borderColor: "rgba(229,225,216,0.6)" }}
                >
                  <div className="text-[11px] font-semibold text-[#242424] mb-1">
                    Q4 planning doc
                  </div>
                  <div className="text-[10px] text-[#77736D] mb-3">
                    Alex M. · Today 9:41 AM
                  </div>
                  <div className="space-y-1.5">
                    {["85%", "72%", "60%"].map((w, i) => (
                      <div
                        key={i}
                        className="h-2 rounded-full"
                        style={{
                          background: "rgba(229,225,216,0.7)",
                          width: w,
                        }}
                      />
                    ))}
                  </div>

                  {/* AI result card */}
                  <div
                    className="ai-appear mt-4 p-2.5 rounded-[8px]"
                    style={{
                      background: "rgba(229,240,234,0.7)",
                      border: "1px solid rgba(36,92,74,0.15)",
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div
                        className="status-pulse w-1.5 h-1.5 rounded-full"
                        style={{ background: "#245C4A" }}
                      />
                      <span className="text-[10px] font-semibold text-[#245C4A]">
                        Meeting created
                      </span>
                    </div>
                    <div className="text-[10px] text-[#242424]">
                      Thu, tomorrow · 10:00–10:30 AM
                    </div>
                    <div className="text-[10px] text-[#77736D] mt-0.5">
                      Alex M. invited · Invite sent
                    </div>
                  </div>
                </div>

                {/* Calendar sidebar */}
                <div className="w-[130px] p-3 flex flex-col gap-2">
                  <div className="text-[10px] font-semibold text-[#242424] mb-1">
                    Thursday
                  </div>
                  <div className="space-y-1.5">
                    {[
                      {
                        time: "9 AM",
                        label: "Standup",
                        bg: "rgba(229,225,216,0.5)",
                        color: "#77736D",
                        accent: false,
                      },
                      {
                        time: "10 AM",
                        label: "Alex · Planning",
                        bg: "rgba(229,240,234,0.8)",
                        color: "#245C4A",
                        accent: true,
                      },
                      {
                        time: "2 PM",
                        label: "Design review",
                        bg: "rgba(229,225,216,0.5)",
                        color: "#77736D",
                        accent: false,
                      },
                    ].map((ev, i) => (
                      <div
                        key={i}
                        className={`cal-event-${i + 1} flex gap-1.5 items-start`}
                      >
                        <span className="text-[9px] text-[#C4BFB8] pt-0.5 w-8 flex-shrink-0">
                          {ev.time}
                        </span>
                        <div
                          className="flex-1 px-1.5 py-1 rounded-[4px] text-[9.5px] font-medium leading-tight"
                          style={{
                            background: ev.bg,
                            color: ev.color,
                            border: ev.accent
                              ? "1px solid rgba(36,92,74,0.2)"
                              : "1px solid transparent",
                          }}
                        >
                          {ev.label}
                          {ev.accent && (
                            <span className="ml-1 opacity-50 text-[8px]">
                              new
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand statement */}
      <div className="relative z-10 mt-10 text-center">
        <p className="text-[15px] font-semibold tracking-[-0.2px] text-[#242424]">
          Your inbox, your calendar, your workflow.
        </p>
        <p className="text-[13px] text-[#77736D] mt-1.5 leading-relaxed">
          One command center for the work that keeps your day moving.
        </p>
      </div>
    </div>
  );
}
