"use client";

import React, { useState, FormEvent } from "react";
import { Icon } from "./icons";

export function EmailCapture({ dark = false }: { dark?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <form
      className={`email-capture ${dark ? "email-capture-dark" : ""}`}
      onSubmit={submit}
    >
      <label className="sr-only" htmlFor={dark ? "footer-email" : "hero-email"}>
        Work email
      </label>
      <input
        id={dark ? "footer-email" : "hero-email"}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        disabled={submitted}
      />
      <button type="submit" disabled={submitted}>
        {submitted ? "You’re on the list" : "Get early access"}{" "}
        <Icon name={submitted ? "check" : "arrow"} size={16} />
      </button>
    </form>
  );
}
