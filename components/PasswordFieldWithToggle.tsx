"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";

type Props = {
  label: string;
  name: string;
  autoComplete: string;
  required?: boolean;
  minLength?: number;
  /** e.g. forgot-password link on the same row as the label */
  labelEnd?: ReactNode;
  /** When false, field is always masked (e.g. confirm password). Default true. */
  visibilityToggle?: boolean;
  showPasswordLabel: string;
  hidePasswordLabel: string;
};

export function PasswordFieldWithToggle({
  label,
  name,
  autoComplete,
  required,
  minLength,
  labelEnd,
  visibilityToggle = true,
  showPasswordLabel,
  hidePasswordLabel,
}: Props) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1 text-sm">
      <span className={`flex items-center gap-2 ${labelEnd ? "justify-between" : ""}`}>
        <span className="font-medium" id={`${id}-label`}>
          {label}
        </span>
        {labelEnd}
      </span>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visibilityToggle && visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          aria-labelledby={`${id}-label`}
          className={`h-11 w-full rounded-md border border-border bg-background py-2 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/40 ${
            visibilityToggle ? "pl-3 pr-14" : "px-3"
          }`}
        />
        {visibilityToggle ? (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold tabular-nums text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={visible ? hidePasswordLabel : showPasswordLabel}
            aria-pressed={visible}
          >
            {visible ? hidePasswordLabel : showPasswordLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
