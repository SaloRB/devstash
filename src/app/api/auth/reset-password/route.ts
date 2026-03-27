import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { applyRateLimit, getIP } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getIP(req);
  const limited = await applyRateLimit(`reset-password:${ip}`, 5, "15 m");
  if (limited) return limited;

  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });

  if (!record || !record.identifier.startsWith("reset:") || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken.delete({ where: { token } });
    }
    return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
  }

  const email = record.identifier.replace("reset:", "");
  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.json({ ok: true });
}
