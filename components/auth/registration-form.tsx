"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { CommandInboxIcon, AlertIcon, GoogleIcon } from "./icons";
import { Field } from "./field";
import { PasswordField } from "./password-field";

export function RegistrationForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState<string | null>(null);

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Full name is required.";
    if (!email.trim()) e.email = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (!confirm) e.confirm = "Please confirm your password.";
    else if (confirm !== password) e.confirm = "Passwords do not match.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    setFormError(null);

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);

    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setFormError(error.message || "Registration failed. Please try again.");
    } else {
      setSuccess(true);
    }
  }

  async function handleGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  function err(f: string) {
    return touched[f] ? errors[f] : undefined;
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center text-center px-2">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center mb-5"
          style={{ background: "#E5F0EA" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10l4.5 4.5 7.5-8"
              stroke="#245C4A"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-[19px] font-semibold tracking-[-0.3px] text-[#242424] mb-2">
          Account created!
        </h2>
        <p className="text-[13.5px] text-[#77736D] leading-relaxed max-w-[260px]">
          Welcome aboard! You can now log in with{" "}
          <span className="font-medium text-[#242424]">{email}</span>.
        </p>
        <Link
          href="/login"
          className="mt-7 inline-flex items-center justify-center px-5 h-9 rounded-[7px] text-[13px] font-medium text-white bg-[#245C4A] hover:bg-[#1B493A] transition-colors focus-ring"
        >
          Proceed to log in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[360px]">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <CommandInboxIcon size={26} />
        <span className="text-[16px] font-semibold tracking-[-0.3px] text-[#242424]">
          Command Inbox
        </span>
      </div>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-[21px] font-semibold tracking-[-0.4px] text-[#242424] mb-1.5">
          Create your account
        </h1>
        <p className="text-[13.5px] text-[#77736D] leading-snug">
          Your email and calendar, organized around the way you work.
        </p>
      </div>

      {/* Form error banner */}
      {formError && (
        <div
          role="alert"
          className="mb-4 p-2.5 rounded-[7px] bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-2 text-[12px] font-medium text-[#B91C1C]"
        >
          <AlertIcon />
          <span>{formError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
        <Field
          id="name"
          label="Full name"
          type="text"
          value={name}
          onChange={setName}
          autoComplete="name"
          error={err("name")}
          required
        />

        <Field
          id="email"
          label="Work email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          error={err("email")}
          required
        />

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          error={err("password")}
          showStrength
          required
        />

        <PasswordField
          id="confirm"
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          error={err("confirm")}
          required
        />

        {/* Primary CTA */}
        <button
          type="submit"
          disabled={loading}
          className={[
            "w-full h-9 mt-0.5 rounded-[7px] text-[13.5px] font-semibold transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C4A] focus-visible:ring-offset-2",
            loading
              ? "cursor-not-allowed text-white"
              : "active:scale-[0.99] text-white cursor-pointer",
          ].join(" ")}
          style={{ background: loading ? "#3D7A63" : "#245C4A" }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.background = "#1B493A";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.background = "#245C4A";
          }}
          aria-label={loading ? "Creating account…" : "Create account"}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="5.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeOpacity="0.3"
                />
                <path
                  d="M7 1.5a5.5 5.5 0 015.5 5.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Creating account…
            </span>
          ) : (
            "Create account"
          )}
        </button>

        {/* Terms */}
        <p className="text-center text-[11.5px] text-[#C4BFB8] leading-relaxed">
          By continuing, you agree to our{" "}
          <a
            href="#"
            className="text-[#77736D] underline underline-offset-2 hover:text-[#242424] transition-colors focus-ring rounded-sm"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="#"
            className="text-[#77736D] underline underline-offset-2 hover:text-[#242424] transition-colors focus-ring rounded-sm"
          >
            Privacy Policy
          </a>
          .
        </p>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E5E1D8]" />
          <span className="text-[11px] font-medium text-[#C4BFB8] uppercase tracking-wide">
            or
          </span>
          <div className="flex-1 h-px bg-[#E5E1D8]" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full h-9 flex items-center justify-center gap-2 rounded-[7px] text-[13.5px] font-medium text-[#242424] bg-white border border-[#E5E1D8] hover:bg-[#F8F6F0] hover:border-[#C8C3BA] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C4A] focus-visible:ring-offset-2 active:scale-[0.99] cursor-pointer"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>

      {/* Login link */}
      <p className="text-center mt-6 text-[13px] text-[#77736D]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[#245C4A] hover:text-[#1B493A] transition-colors focus-ring rounded-sm"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
