import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

  const { error } = await resend.emails.send({
    from: 'DevStash <onboarding@resend.dev>',
    to: email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:8px">Verify your email</h2>
        <p style="color:#555;margin-bottom:24px">Click the button below to verify your email and activate your DevStash account.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Verify Email</a>
        <p style="color:#999;font-size:12px;margin-top:24px">Link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  const { error } = await resend.emails.send({
    from: 'DevStash <onboarding@resend.dev>',
    to: email,
    subject: 'Reset your password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:8px">Reset your password</h2>
        <p style="color:#555;margin-bottom:24px">Click the button below to reset your DevStash password.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">Reset Password</a>
        <p style="color:#999;font-size:12px;margin-top:24px">Link expires in 1 hour. If you didn't request a password reset, ignore this email.</p>
      </div>
    `,
  })

  if (error) throw new Error(error.message)
}
