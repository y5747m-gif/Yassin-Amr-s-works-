import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { name: 120, email: 200, company: 160, message: 4000 } as const;

type Payload = {
  name: string;
  email: string;
  company: string;
  message: string;
  budget: string | null;
  locale: string;
};

function parse(input: unknown): Payload | null {
  if (!input || typeof input !== "object") return null;
  const body = input as Record<string, unknown>;
  const str = (key: keyof typeof MAX): string | null => {
    const value = body[key];
    if (value === undefined || value === null) return "";
    if (typeof value !== "string" || value.length > MAX[key]) return null;
    return value.trim();
  };

  const name = str("name");
  const email = str("email");
  const company = str("company");
  const message = str("message");
  if (name === null || email === null || company === null || message === null) return null;
  if (!name || !email || !EMAIL_RE.test(email)) return null;

  const budget = typeof body.budget === "string" ? body.budget.slice(0, 60) : null;
  const locale = body.locale === "ar" ? "ar" : "en";

  return { name, email, company, message, budget, locale };
}

/**
 * Contact endpoint. Validates the request and acknowledges it.
 * Delivery is intentionally a single seam: forward `payload` to your email
 * provider (Resend, Postmark, SMTP) or CRM inside `deliver()` below.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const payload = parse(json);
  if (!payload) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 422 });
  }

  try {
    await deliver(payload);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "delivery_failed" }, { status: 502 });
  }
}

async function deliver(payload: Payload): Promise<void> {
  // Keep personal data out of logs; only record that a lead arrived.
  if (process.env.NODE_ENV !== "production") {
    console.info("[contact] lead received", { budget: payload.budget, locale: payload.locale });
  }
  void payload;
}
