import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/clients/email";
import { applyRateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limited = await applyRateLimit(`forgot-password:${ip}`, 3, "1 h");
  if (limited) return limited;

  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Always return success to avoid user enumeration
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Delete any existing reset token for this user
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${email}` },
  });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.create({
    data: { identifier: `reset:${email}`, token, expires },
  });

  try {
    await sendPasswordResetEmail(email, token);
  } catch (err) {
    console.error("Failed to send password reset email:", err);
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
