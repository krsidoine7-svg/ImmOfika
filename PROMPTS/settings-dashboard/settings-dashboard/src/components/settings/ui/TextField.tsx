"use client";

import { useId, useState } from "react";
import styles from "./Field.module.css";
import { Icon } from "./Icon";

type BaseProps = {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  prefix?: string;
  type?: "text" | "email" | "password" | "url";
  disabled?: boolean;
};

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  prefix,
  type = "text",
  disabled,
}: BaseProps) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword ? (reveal ? "text" : "password") : type;

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.controlWrap}>
        {prefix ? <span className={styles.prefix}>{prefix}</span> : null}
        <input
          id={id}
          className={`${styles.input} ${prefix ? styles.hasPrefix : ""}`}
          type={resolvedType}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={isPassword ? "new-password" : undefined}
        />
        {isPassword ? (
          <button
            type="button"
            className={styles.suffixBtn}
            aria-label={reveal ? "Masquer" : "Afficher"}
            onClick={() => setReveal((r) => !r)}
          >
            <Icon name={reveal ? "eye-off" : "eye"} size={16} />
          </button>
        ) : null}
      </div>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  maxLength,
}: BaseProps & { maxLength?: number }) {
  const id = useId();
  return (
    <div className={styles.field}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {maxLength ? (
          <span className={styles.hint}>
            {value.length}/{maxLength}
          </span>
        ) : null}
      </div>
      <textarea
        id={id}
        className={styles.textarea}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  value,
  onChange,
  options,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className={styles.controlWrap}>
        <select
          id={id}
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron}>
          <Icon name="chevron" size={14} />
        </span>
      </div>
      {hint ? <span className={styles.hint}>{hint}</span> : null}
    </div>
  );
}
