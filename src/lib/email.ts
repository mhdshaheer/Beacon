import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Beacon Scholarship <onboarding@resend.dev>', // Replace with your verified domain in production
      to: email,
      subject: 'Verify your Beacon Scholarship Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; rounded-xl">
          <h2 style="color: #10b981;">Welcome to Beacon Scholarship!</h2>
          <p>Please use the following code to verify your account:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; border-radius: 10px;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This code will expire in 10 minutes. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
}
