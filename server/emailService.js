import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import https from 'https';

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

/**
 * Unified email sending wrapper.
 * Automatically falls back to EmailJS REST API if SMTP is not configured.
 */
const sendMailWrapper = async (mailOptions, templateParams = null, customTemplateId = null) => {
  if (process.env.SMTP_HOST) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('SMTP Email sent successfully: ' + info.response);
      return { success: true };
    } catch (error) {
      console.error('SMTP Email sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // Fallback to EmailJS REST API using existing .env config variables
  console.log('⏰ SMTP_HOST is missing. Falling back to EmailJS REST API...');
  
  const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID || 'service_44i6qlq';
  const templateId = customTemplateId || process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'template_1xp6nve';
  const publicKey  = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'VqhDjdPSs3EnemrV-';

  // Strip HTML to plain text for email message fallback
  const plainMsg = mailOptions.html
    ? mailOptions.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : mailOptions.text;

  const postData = JSON.stringify({
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams || {
      to_name: mailOptions.to.split('@')[0],
      to_email: mailOptions.to,
      message: plainMsg
    }
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.emailjs.com',
      port: 443,
      path: '/api/v1.0/email/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'Origin': 'http://localhost:3000',
        'Referer': 'http://localhost:3000/'
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        console.log(`EmailJS REST response status: ${res.statusCode}`);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: body || 'Unknown EmailJS error' });
        }
      });
    });

    req.on('error', (e) => {
      console.error('EmailJS REST connection error:', e);
      resolve({ success: false, error: e.message });
    });

    req.write(postData);
    req.end();
  });
};

export const sendCredentialsEmail = async (studentEmail, studentName, password) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'InternLink'}" <${process.env.SMTP_USER || 'no-reply@internlink.com'}>`,
    to: studentEmail,
    subject: 'Your InternLink Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
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
      </div>
    `,
  };

  const params = {
    to_name: studentName,
    to_email: studentEmail,
    message: `Welcome to InternLink! Your adviser created your account. Email: ${studentEmail}, Temporary Password: ${password}. Log in at ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
  };

  return await sendMailWrapper(mailOptions, params);
};

export const sendAdminWelcomeEmail = async (adminEmail, adminName) => {
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'InternLink'}" <${process.env.SMTP_USER || 'no-reply@internlink.com'}>`,
    to: adminEmail,
    subject: 'Admin Account Created - InternLink',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1e40af;">Admin Account Ready, ${adminName}!</h2>
        <p>Your administrator account for the InternLink portal has been created successfully.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${adminEmail}</p>
          <p style="margin: 5px 0;"><strong>Role:</strong> System Administrator</p>
        </div>
      </div>
    `,
  };

  const params = {
    to_name: adminName,
    to_email: adminEmail,
    message: `Hello ${adminName}, your InternLink Administrator account is now active. Log in at ${process.env.FRONTEND_URL || 'http://localhost:3000'}/login to manage students.`
  };

  return await sendMailWrapper(mailOptions, params);
};

export const sendAttendanceReminderEmail = async (studentEmail, studentName, type, usualTime) => {
  const isClockIn = type === 'clock_in';
  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'InternLink'}" <${process.env.SMTP_USER || 'no-reply@internlink.com'}>`,
    to: studentEmail,
    subject: isClockIn ? '⚠️ Reminding you to Clock In - InternLink' : '⚠️ Reminding you to Clock Out - InternLink',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1D2D5B; margin-bottom: 6px;">OJT Shift Reminder</h2>
        <p style="font-size: 0.95rem; color: #475569;">Hello ${studentName},</p>
        
        <div style="background-color: ${isClockIn ? '#EFF6FF' : '#FEF2F2'}; border-left: 4px solid ${isClockIn ? '#2563EB' : '#EF4444'}; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; font-size: 1rem; font-weight: bold; color: ${isClockIn ? '#1E40AF' : '#991B1B'};">
            ${isClockIn ? '⏰ Time to Clock In!' : '🔒 Time to Clock Out!'}
          </p>
          <p style="margin: 8px 0 0; font-size: 0.9rem; color: #334155; line-height: 1.5;">
            According to your preset OJT schedule, your standard shift is configured to ${isClockIn ? 'start' : 'end'} at <strong>${usualTime}</strong>. 
            You have not recorded your ${isClockIn ? 'Clock-In' : 'Clock-Out'} entry yet for today.
          </p>
        </div>
      </div>
    `,
  };

  const params = {
    to_name: studentName,
    to_email: studentEmail,
    action_type: isClockIn ? 'Clock In' : 'Clock Out',
    usual_time: usualTime,
    action_verb: isClockIn ? 'start' : 'end',
    bg_color: isClockIn ? '#EFF6FF' : '#FEF2F2',
    border_color: isClockIn ? '#2563EB' : '#EF4444',
    text_color: isClockIn ? '#1E40AF' : '#991B1B',
    emoji: isClockIn ? '⏰' : '🔒',
    message: `⚠️ OJT Reminder Alert: It is time to ${isClockIn ? 'Clock In' : 'Clock Out'}. Your shift is scheduled to ${isClockIn ? 'start' : 'end'} at ${usualTime}. Please log in to InternLink to update your status.`
  };

  return await sendMailWrapper(mailOptions, params, process.env.REACT_APP_EMAILJS_ATTENDANCE_TEMPLATE_ID || 'template_3b3tvwr');
};
