import { Email } from "@convex-dev/auth/providers/Email";
import { alphabet, generateRandomString } from "oslo/crypto";

export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes
  generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, token }) {
    // Log OTP to console for development
    console.log("=========================================");
    console.log(`📧 OTP for ${email}: ${token}`);
    console.log("=========================================");

    // TODO: For production, integrate a real email service like Resend:
    // import { Resend } from "resend";
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: "SafeTravel <noreply@yourdomain.com>",
    //   to: email,
    //   subject: "Your SafeTravel verification code",
    //   text: `Your verification code is: ${token}`,
    // });
  },
});
