import { randomBytes } from "crypto";
import { prisma } from "./prisma";

const TOKEN_EXPIRY_MINUTES = 15;

export async function generateMagicToken(email: string): Promise<string> {
    // Delete any existing tokens for this email
    await prisma.magicToken.deleteMany({ where: { email } });

    // Generate a new token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await prisma.magicToken.create({
        data: {
            token,
            email,
            expires,
        },
    });

    return token;
}

export async function verifyMagicToken(token: string): Promise<string | null> {
    const magicToken = await prisma.magicToken.findUnique({
        where: { token },
    });

    if (!magicToken) {
        return null;
    }

    // Check if expired
    if (magicToken.expires < new Date()) {
        await prisma.magicToken.delete({ where: { id: magicToken.id } });
        return null;
    }

    // Delete the token (one-time use)
    await prisma.magicToken.delete({ where: { id: magicToken.id } });

    return magicToken.email;
}

export async function sendMagicLinkEmail(email: string, token: string): Promise<boolean> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const magicLink = `${appUrl}/api/auth/verify?token=${token}`;

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": process.env.BREVO_API_KEY || "",
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender: {
                    name: "Client Feedback Enforcer",
                    email: "noreply@feedbackenforcer.app",
                },
                to: [{ email }],
                subject: "🔐 Your Magic Link to Sign In",
                htmlContent: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" max-width="500" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%); border-radius: 24px; border: 1px solid rgba(99, 102, 241, 0.2); padding: 48px;">
                    <tr>
                      <td align="center" style="padding-bottom: 32px;">
                        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center;">
                          <span style="font-size: 32px;">✓</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom: 16px;">
                        <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0;">Client Feedback Enforcer</h1>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom: 32px;">
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0;">Click the button below to securely sign in to your account. This link will expire in 15 minutes.</p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-bottom: 32px;">
                        <a href="${magicLink}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #a855f7); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 700; padding: 16px 48px; border-radius: 12px;">Sign In Now</a>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <p style="color: #64748b; font-size: 12px; margin: 0;">If you didn't request this email, you can safely ignore it.</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
            }),
        });

        return response.ok;
    } catch (error) {
        console.error("Failed to send magic link email:", error);
        return false;
    }
}
