"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { isDisposableEmailDomain } from "@/lib/disposableEmails";

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

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

  if (labels.some((part) => !part || part.startsWith("-") || part.endsWith("-"))) {
    return "Enter a valid email domain.";
  }

  if (isDisposableEmailDomain(domain)) {
    return "Temporary or disposable email addresses are not accepted. Please use a permanent email.";
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

/** True while the address can still become valid by typing more characters. */
function isStillTypingEmail(value: string): boolean {
  const email = value.trim();
  if (!email || /\s/.test(email)) return false;
  const at = email.indexOf("@");
  if (at === -1) return true;
  if (email.indexOf("@", at + 1) !== -1) return false;
  const domain = email.slice(at + 1);
  if (!domain || domain.startsWith(".") || domain.includes("..")) return false;
  if (!domain.includes(".")) return true;
  const tld = domain.split(".").pop() ?? "";
  return tld.length < 2;
}

function visibleNameError(value: string, blurred: boolean): string | null {
  const error = validateName(value);
  if (!error) return null;
  if (!blurred && !value.trim()) return null;
  return error;
}

function visibleEmailError(value: string, blurred: boolean): string | null {
  const error = validateEmail(value);
  if (!error) return null;
  if (blurred) return error;
  if (!value.trim() || isStillTypingEmail(value)) return null;
  return error;
}

function visibleMessageError(value: string, blurred: boolean): string | null {
  const error = validateMessage(value);
  if (!error) return null;
  if (!blurred && !value.trim()) return null;
  return error;
}

function fieldClass(invalid: boolean, extra = "") {
  return [
    "rounded-lg border bg-white text-base font-normal outline-none transition focus:border-[var(--brand)] disabled:opacity-60",
    invalid ? "border-[var(--danger)]" : "border-[var(--line)]",
    extra,
  ].join(" ");
}

export function ContactForm({ supportEmail }: { supportEmail: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [blurred, setBlurred] = useState({
    name: false,
    email: false,
    message: false,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const nameError = visibleNameError(name, blurred.name);
  const emailError = visibleEmailError(email, blurred.email);
  const messageError = visibleMessageError(message, blurred.message);

  const markEdited = () => {
    setFormError(null);
    if (status === "sent") setStatus("idle");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("idle");
    setBlurred({ name: true, email: true, message: true });

    const nextErrors = {
      name: validateName(name),
      email: validateEmail(email),
      message: validateMessage(message),
    };

    if (nextErrors.name || nextErrors.email || nextErrors.message) return;

    setStatus("sending");
    setFormError(null);

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
        setFormError(
          data.message && res.status === 400
            ? data.message
            : "We couldn't send your message.\nPlease try again in a moment.",
        );
        return;
      }

      setName("");
      setEmail("");
      setMessage("");
      setBlurred({ name: false, email: false, message: false });
      setStatus("sent");
    } catch {
      setStatus("idle");
      setFormError(
        "We couldn't send your message.\nPlease try again in a moment.",
      );
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
            markEdited();
          }}
          onBlur={() => setBlurred((prev) => ({ ...prev, name: true }))}
          className={fieldClass(Boolean(nameError), "min-h-12 px-4")}
          placeholder="Your name"
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? "name-error" : undefined}
        />
        {nameError && (
          <span id="name-error" className="text-sm font-normal text-[var(--danger)]" role="alert">
            {nameError}
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
            markEdited();
          }}
          onBlur={() => setBlurred((prev) => ({ ...prev, email: true }))}
          className={fieldClass(Boolean(emailError), "min-h-12 px-4")}
          placeholder="you@company.org"
          aria-invalid={Boolean(emailError)}
          aria-describedby={emailError ? "email-error" : undefined}
        />
        {emailError && (
          <span id="email-error" className="text-sm font-normal text-[var(--danger)]" role="alert">
            {emailError}
          </span>
        )}
      </label>

      <label className="grid gap-2 text-sm font-semibold text-[var(--ink)]">
        Message
        <textarea
          name="message"
          rows={5}
          value={message}
          disabled={sending}
          onChange={(e) => {
            setMessage(e.target.value);
            markEdited();
          }}
          onBlur={() => setBlurred((prev) => ({ ...prev, message: true }))}
          className={fieldClass(Boolean(messageError), "contact-message px-4 py-3")}
          placeholder="Tell us what happened or what you need."
          aria-invalid={Boolean(messageError)}
          aria-describedby={
            messageError ? "message-error" : "message-hint"
          }
        />
        <span id="message-hint" className="text-xs font-normal text-[var(--ink-muted)]">
          Fixed height — scroll inside the box when your message is longer.
        </span>
        {messageError && (
          <span
            id="message-error"
            className="text-sm font-normal text-[var(--danger)]"
            role="alert"
          >
            {messageError}
          </span>
        )}
      </label>

      {formError && (
        <p
          className="whitespace-pre-line rounded-xl bg-red-50 px-3 py-2 text-sm font-normal text-[var(--danger)]"
          role="alert"
        >
          {formError}
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

      <button
        type="submit"
        className="btn btn-primary w-full sm:w-auto"
        disabled={sending}
      >
        {sending ? "Sending..." : "Send message"}
      </button>

      <p className="text-sm font-normal leading-relaxed text-[var(--ink-muted)]">
        Or email us directly at{" "}
        <a
          href={`mailto:${supportEmail}`}
          className="font-semibold text-[var(--brand)] underline underline-offset-2"
        >
          {supportEmail}
        </a>
        . For privacy details, read the{" "}
        <Link
          href="/privacy-policy"
          className="font-semibold text-[var(--brand)] underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
