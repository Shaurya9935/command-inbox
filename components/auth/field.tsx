import React from "react";
import { AlertIcon } from "./icons";

export interface FieldProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  suffix?: React.ReactNode;
}

export function Field({
  id,
  label,
  type,
  value,
  onChange,
  autoComplete,
  error,
  required,
  suffix,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[12.5px] font-medium text-[#242424]">
        {label}
        {required && (
          <span className="ml-0.5 text-[#245C4A]" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={[
            "w-full h-9 px-3 text-[13.5px] text-[#242424] bg-white rounded-[7px] border transition-all duration-150",
            "placeholder:text-[#C4BFB8]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245C4A] focus-visible:ring-offset-0",
            error
              ? "border-[#FCA5A5] bg-[#FEF7F7] focus-visible:ring-[#EF4444]"
              : "border-[#E5E1D8] hover:border-[#C8C3BA]",
            suffix ? "pr-9" : "",
          ].join(" ")}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p
          id={`${id}-err`}
          role="alert"
          className="flex items-center gap-1.5 text-[11.5px] font-medium text-[#B91C1C]"
        >
          <AlertIcon />
          {error}
        </p>
      )}
    </div>
  );
}
