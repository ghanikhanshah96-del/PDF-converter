"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/** Domains that look like placeholders often used in QA. */
const BLOCKED_EMAIL_DOMAINS = new Set([
  "something.com",
  "example.com",
  "test.com",
  "domain.com",
  "asdf.com",
  "abc.com",
]);

function validateName(value: string): string | null {
  const name = value.trim();
  if (!name) return "Please enter your name.";
  if (name.length < 2) return "Name must be at least 2 characters.";
  if (name.length > 100) return "Name is too long.";
  if (/\d/.test(name)) return "Name cannot contain numbers.";
  if (/[^A-Za-z\u00C0-\u024F\s'.-]/.test(name)) {
    return "Name can only include letters, spaces, hyphens, apostrophes, and periods.";
  }
  if (!/^[A-Za-z\u00C0-\u024F]/.test(name)) {
    return "Name must start with a letter.";
  }
  return null;
}

function validateEmail(value: string): string | null {
  const email = value.trim();
  if (!email) return "Please enter your email address.";
  if (email.length > 254) return "Email is too long.";
  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address, such as name@company.org.";
  }

  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const labels = domain.split(".");
  const tld = labels[labels.length - 1] ?? "";

  if (tld.length < 2 || !/^[a-z]+$/i.test(tld)) {
    return "Email domain must end with a valid extension (for example .com or .org).";
  }

  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return "Please use your real email address — placeholder domains are not accepted.";
  }

  if (labels.some((part) => !part || part.startsWith("-") || part.endsWith("-"))) {
    return "Enter a valid email domain.";
  }

  return null;
}

function validateMessage(value: string): string | null {
  const message = value.trim();
  if (!message) return "Please enter a message.";
  if (message.length < 10) return "Message should be at least 10 characters.";
  if (message.length > 5000) return "Message is too long.";
  return null;
}

export function ContactForm({ supportEmail }: { supportEmail: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
    form?: string;
  }>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "copied">(
    "idle",
  );

  const subject = useMemo(
    () => `Contact from ${name.trim() || "website visitor"}`,
    [name],
  );

  const body = useMemo(() => {
    return [
      `Name: ${name.trim()}`,
      `Email: ${email.trim()}`,
      "",
      "Message:",
      "",
      message.trim(),
    ].join("\n");
  }, [name, email, message]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("idle");

    const nextErrors = {
      name: validateName(name) ?? undefined,
      email: validateEmail(email) ?? undefined,
      message: validateMessage(message) ?? undefined,
    };

    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.message) return;

    setStatus("sending");
    setErrors({});

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      });

      let data: { success?: boolean; message?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok || !data.success) {
        setStatus("idle");
        setErrors({
          form: "We couldn't send your message.\nPlease try again in a moment.",
        });
        return;
      }

      setName("");
      setEmail("");
      setMessage("");
      setStatus("sent");
    } catch {
      setStatus("idle");
      setErrors({
        form: "We couldn't send your message.\nPlease try again in a moment.",
      });
    }
  };

  const copyFallback = async () => {
    const text = `To: ${supportEmail}\nSubject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setErrors({
        form: `Could not copy. Please email ${supportEmail} manually.`,
      });
    }
  };

  const sending = status === "sending";

  return (
    <form className="mt-6 grid gap-4" onSubmit={onSubmit} noValidate>
      <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
        Name
        <input
          name="name"
          type="text"
          autoComplete="name"
          value={name}
          disabled={sending}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: undefined, form: undefined }));
            if (status === "sent" || status === "copied") setStatus("idle");
          }}
          className="min-h-12 rounded-lg border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition focus:border-[var(--brand)] disabled:opacity-60"
          placeholder="Your name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && (
          <span id="name-error" className="text-sm font-normal text-[var(--danger)]" role="alert">
            {errors.name}
          </span>
        )}
      </label>

      <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
        Email
        <input
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          disabled={sending}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
            if (status === "sent" || status === "copied") setStatus("idle");
          }}
          className="min-h-12 rounded-lg border border-[var(--line)] bg-white px-4 text-base font-normal outline-none transition focus:border-[var(--brand)] disabled:opacity-60"
          placeholder="you@company.org"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <span id="email-error" className="text-sm font-normal text-[var(--danger)]" role="alert">
            {errors.email}
          </span>
        )}
      </label>

      <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
        Message
        <textarea
          name="message"
          rows={7}
          value={message}
          disabled={sending}
          onChange={(e) => {
            setMessage(e.target.value);
            setErrors((prev) => ({
              ...prev,
              message: undefined,
              form: undefined,
            }));
            if (status === "sent" || status === "copied") setStatus("idle");
          }}
          className="resize-y rounded-lg border border-[var(--line)] bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-[var(--brand)] disabled:opacity-60"
          placeholder="Tell us what happened or what you need."
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && (
          <span
            id="message-error"
            className="text-sm font-normal text-[var(--danger)]"
            role="alert"
          >
            {errors.message}
          </span>
        )}
      </label>

      {errors.form && (
        <p
          className="whitespace-pre-line rounded-xl bg-red-50 px-3 py-2 text-sm font-normal text-[var(--danger)]"
          role="alert"
        >
          {errors.form}
        </p>
      )}

      {status === "sent" && (
        <p
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-normal text-emerald-800"
          role="status"
        >
          <span className="font-semibold text-emerald-700">
            ✓ Message sent successfully.
          </span>
          <br />
          Thank you for contacting us. We&apos;ll get back to you soon.
        </p>
      )}

      {status === "copied" && (
        <p
          className="rounded-xl bg-[var(--brand-soft)] px-3 py-2 text-sm font-normal text-[var(--brand-deep)]"
          role="status"
        >
          Message copied. Paste it into your email app and send to {supportEmail}.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="submit"
          className="btn btn-primary w-full sm:w-auto"
          disabled={sending}
        >
          {sending ? "Sending..." : "Send message"}
        </button>
        <button
          type="button"
          className="btn btn-secondary w-full sm:w-auto"
          onClick={copyFallback}
          disabled={sending}
        >
          Copy message
        </button>
      </div>

      <p className="text-sm font-normal leading-relaxed text-[var(--ink-muted)]">
        Or email us directly at{" "}
        <a
          href={`mailto:${supportEmail}`}
          className="font-semibold text-[var(--brand)] underline"
        >
          {supportEmail}
        </a>
        . For privacy details, read the{" "}
        <Link href="/privacy" className="font-semibold text-[var(--brand)] underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
