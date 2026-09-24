import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

const BLOCKED_EMAIL_DOMAINS = new Set([
  "something.com",
  "example.com",
  "test.com",
  "domain.com",
  "asdf.com",
  "abc.com",
]);

const LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const;

const GENERIC_FAIL = {
  success: false as const,
  message: "Unable to send your message. Please try again.",
};

function validateName(value: unknown): string | null {
  if (typeof value !== "string") return "Invalid name.";
  const name = value.trim();
  if (!name) return "Please enter your name.";
  if (name.length < 2) return "Name must be at least 2 characters.";
  if (name.length > LIMITS.name) return "Name is too long.";
  if (/\d/.test(name)) return "Name cannot contain numbers.";
  if (/[^A-Za-z\u00C0-\u024F\s'.-]/.test(name)) {
    return "Name can only include letters, spaces, hyphens, apostrophes, and periods.";
  }
  if (!/^[A-Za-z\u00C0-\u024F]/.test(name)) {
    return "Name must start with a letter.";
  }
  return null;
}

function validateEmail(value: unknown): string | null {
  if (typeof value !== "string") return "Invalid email.";
  const email = value.trim();
  if (!email) return "Please enter your email address.";
  if (email.length > LIMITS.email) return "Email is too long.";
  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address.";
  }

  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  const labels = domain.split(".");
  const tld = labels[labels.length - 1] ?? "";

  if (tld.length < 2 || !/^[a-z]+$/i.test(tld)) {
    return "Enter a valid email domain.";
  }
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return "Please use your real email address.";
  }
  if (labels.some((part) => !part || part.startsWith("-") || part.endsWith("-"))) {
    return "Enter a valid email domain.";
  }
  return null;
}

function validateMessage(value: unknown): string | null {
  if (typeof value !== "string") return "Invalid message.";
  const message = value.trim();
  if (!message) return "Please enter a message.";
  if (message.length < 10) return "Message should be at least 10 characters.";
  if (message.length > LIMITS.message) return "Message is too long.";
  return null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 },
    );
  }

  const { name, email, message } = payload as Record<string, unknown>;

  const nameError = validateName(name);
  const emailError = validateEmail(email);
  const messageError = validateMessage(message);

  if (nameError || emailError || messageError) {
    return NextResponse.json(
      {
        success: false,
        message: nameError || emailError || messageError || "Invalid request.",
      },
      { status: 400 },
    );
  }

  const safeName = String(name).trim();
  const safeEmail = String(email).trim();
  const safeMessage = String(message).trim();

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail =
    process.env.CONTACT_TO_EMAIL?.trim() ||
    "support@bestfreepdfconverter.com";

  if (!apiKey || !fromEmail) {
    console.error("[contact] Missing RESEND_API_KEY or RESEND_FROM_EMAIL");
    return NextResponse.json(GENERIC_FAIL, { status: 500 });
  }

  const subject = `Contact from ${safeName}`;
  const textBody = [
    `Name: ${safeName}`,
    `Email: ${safeEmail}`,
    "",
    "Message:",
    "",
    safeMessage,
  ].join("\n");

  const htmlBody = `
    <p><strong>Name:</strong> ${escapeHtml(safeName)}</p>
    <p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>
    <p><strong>Message:</strong></p>
    <p>${escapeHtml(safeMessage).replace(/\n/g, "<br />")}</p>
  `;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: safeEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    if (error) {
      console.error("[contact] Resend error:", error.name);
      return NextResponse.json(GENERIC_FAIL, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Message sent successfully.",
    });
  } catch (err) {
    console.error(
      "[contact] Send failed:",
      err instanceof Error ? err.name : "unknown",
    );
    return NextResponse.json(GENERIC_FAIL, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json(
    { success: false, message: "Method not allowed." },
    { status: 405 },
  );
}

export function PUT() {
  return NextResponse.json(
    { success: false, message: "Method not allowed." },
    { status: 405 },
  );
}

export function DELETE() {
  return NextResponse.json(
    { success: false, message: "Method not allowed." },
    { status: 405 },
  );
}
