import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

const FROM_EMAIL = process.env.EMAIL_FROM || 'Beacon Scholarship <your-email@gmail.com>';

const handleEmailError = (error: unknown, email: string, otp: string, context: string) => {
  console.error(`Nodemailer [${context}] error:`, error);
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('\n--- EMAIL DELIVERY FAILURE ---');
    console.warn(`Context: ${context}`);
    console.warn(`Target: ${email}`);
    console.warn(`[DEVELOPMENT FALLBACK] Your OTP code is: ${otp}`);
    console.warn('--------------------------------\n');
  }
};

export async function sendOTPEmail(email: string, otp: string) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Verify your Beacon Scholarship Account',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 12px;">
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

    return { success: true, data: info };
  } catch (error) {
    handleEmailError(error, email, otp, 'Signup OTP');
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, otp: string) {
  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: 'Reset your Beacon Scholarship Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #10b981; border-radius: 12px;">
          <h2 style="color: #10b981;">Password Reset Request</h2>
          <p>We received a request to reset your password. Use the code below to set a new password:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000; border-radius: 10px;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `,
    });

    return { success: true, data: info };
  } catch (error) {
    handleEmailError(error, email, otp, 'Password Reset');
    return { success: false, error };
  }
}
