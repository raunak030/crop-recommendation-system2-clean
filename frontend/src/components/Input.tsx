"use client";

import React from "react";

type InputType = "text" | "number" | "range" | "select";

interface InputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  type?: InputType;
  unit?: string;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  className?: string;
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  step?: string;
  name?: string;
  required?: boolean;
}

function cn(classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function Input({
  label,
  error,
  icon,
  type = "text",
  unit,
  disabled = false,
  options,
  className,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  name,
  required,
}: InputProps) {
  const baseInputClasses =
    "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    onChange?.(e.target.value);
  };

  const renderInput = () => {
    if (type === "select") {
      return (
        <select
          value={String(value ?? "")}
          onChange={handleChange}
          disabled={disabled}
          name={name}
          required={required}
          className={cn([
            baseInputClasses,
            "appearance-none cursor-pointer",
            error ? "border-danger focus:ring-danger/40" : "",
            className,
          ])}
        >
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === "range") {
      return (
        <div className="space-y-1">
          <input
            type="range"
            value={value ?? 0}
            onChange={handleChange}
            disabled={disabled}
            min={min ?? 0}
            max={max ?? 200}
            step={step}
            name={name}
            className={cn([
              "w-full accent-green-600",
              error ? "accent-danger" : "",
              className,
            ])}
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>{min ?? 0}</span>
            <span>{max ?? 200}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value ?? ""}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          name={name}
          required={required}
          className={cn([
            baseInputClasses,
            icon ? "pl-10" : "",
            unit ? "pr-10" : "",
            error ? "border-danger focus:ring-danger/40" : "",
            className,
          ])}
        />
        {unit && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400 text-sm">
            {unit}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="text-xs text-danger mt-1 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}