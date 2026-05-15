import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendCredentialsEmail = async (studentEmail, studentName, password) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
    to: studentEmail,
    subject: 'Your InternLink Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 12px;">
        <h2 style="color: #1e40af;">Welcome to InternLink, ${studentName}!</h2>
        <p>Your account has been created by your OJT Adviser. You can now log in to the portal using the following credentials:</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${studentEmail}</p>
          <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <span style="color: #2563eb; font-family: monospace; font-size: 1.1em;">${password}</span></p>
        </div>
        
        <p style="color: #ef4444; font-size: 0.9em;">Important: Please change your password after your first login for security.</p>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
           style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
          Log In Now
        </a>
        
        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 0.8em; color: #64748b;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendAdminWelcomeEmail = async (adminEmail, adminName) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>`,
    to: adminEmail,
    subject: 'Admin Account Created - InternLink',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 12px;">
        <h2 style="color: #1e40af;">Admin Account Ready, ${adminName}!</h2>
        <p>Your administrator account for the InternLink portal has been created successfully.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${adminEmail}</p>
          <p style="margin: 5px 0;"><strong>Role:</strong> System Administrator</p>
        </div>
        
        <p>You can now log in to manage students, OJT Advisers, and system settings.</p>
        
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
           style="display: inline-block; background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
          Go to Dashboard
        </a>
        
        <hr style="margin: 30px 0; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 0.8em; color: #64748b;">This is an automated message. Please do not reply to this email.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Admin Email sent: ' + info.response);
    return { success: true };
  } catch (error) {
    console.error('Error sending admin email:', error);
    return { success: false, error: error.message };
  }
};
