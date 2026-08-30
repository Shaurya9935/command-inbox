import React from "react";
import { ProductPreview } from "./product-preview";

export interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-full flex" style={{ background: "#F8F6F0" }}>
      {/* Left — Product showcase */}
      <div
        className="hidden lg:flex flex-col relative overflow-hidden"
        style={{
          width: "58%",
          background:
            "linear-gradient(150deg, #F8F6F0 0%, #EFF5F2 50%, #EAF0ED 100%)",
          borderRight: "1px solid #E5E1D8",
        }}
      >
        <ProductPreview />
      </div>

      {/* Right — Form Container */}
      <div
        className="flex-1 flex flex-col items-center justify-center relative px-8 py-12"
        style={{ minHeight: "100vh", background: "#F8F6F0" }}
      >
        {/* Soft green ambient tints */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-0 right-0 w-72 h-72 opacity-40 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #E5F0EA 0%, transparent 70%)",
              transform: "translate(35%, -35%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-56 h-56 opacity-25 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #E5F0EA 0%, transparent 70%)",
              transform: "translate(-35%, 35%)",
            }}
          />
        </div>

        {/* Card */}
        <div
          className="relative w-full max-w-[400px] px-8 py-9 rounded-[16px]"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E1D8",
            boxShadow:
              "0 1px 3px rgba(36,92,74,0.04), 0 4px 24px rgba(36,92,74,0.06)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
