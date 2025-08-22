import nodemailer from 'nodemailer';

export const sendLoginEmail = async (toEmail, name) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"Your App" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Login Successful',
      html: `<p>Hi ${name},</p><p>You have successfully logged in to your account.</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Login email sent to ${toEmail}`);
  } catch (err) {
    console.error('❌ Error sending login email:', err.message);
  }
};
  