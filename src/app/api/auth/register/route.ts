import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { applyRateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limited = await applyRateLimit(`register:${ip}`, 3, "1 h");
  if (limited) return limited;

  const { name, email, password, confirmPassword } = await req.json();

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  if (password !== confirmPassword) {
    return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const verificationEnabled = process.env.EMAIL_VERIFICATION_ENABLED === "true";
  const hashed = await bcrypt.hash(password, 10);

  if (!verificationEnabled) {
    await prisma.user.create({
      data: { name, email, password: hashed, emailVerified: new Date() },
    });
    return NextResponse.json({ pendingVerification: false }, { status: 201 });
  }

  await prisma.user.create({ data: { name, email, password: hashed } });

  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.verificationToken.create({
    data: { identifier: email, token, expires },
  });

  try {
    await sendVerificationEmail(email, token);
  } catch (err) {
    console.error("Failed to send verification email:", err);
    await prisma.verificationToken.delete({ where: { token } });
    await prisma.user.delete({ where: { email } });
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 });
  }

  return NextResponse.json({ pendingVerification: true }, { status: 201 });
}
