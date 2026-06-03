const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const schoolName = process.env.SCHOOL_NAME || 'Canon Andrea Mwaka International School';

async function sendApprovalEmail(student) {
  const mailOptions = {
    from: `"${schoolName} Admissions" <${process.env.SMTP_USER}>`,
    to: student.motherEmail || student.fatherEmail,
    subject: `🎉 Admission Approved – ${student.fullName} | ${schoolName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7fb; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1a3c6e 0%, #2d6bcf 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 26px; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
    .badge { display: inline-block; background: #22c55e; color: white; padding: 6px 18px; border-radius: 999px; font-size: 13px; font-weight: 600; margin-top: 16px; }
    .body { padding: 40px 32px; }
    .greeting { font-size: 18px; font-weight: 600; color: #1a3c6e; margin-bottom: 16px; }
    .text { color: #4b5563; line-height: 1.7; font-size: 15px; }
    .info-card { background: #f0f5ff; border-left: 4px solid #2d6bcf; border-radius: 8px; padding: 20px 24px; margin: 24px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #dbeafe; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #1e293b; font-weight: 600; }
    .app-number { font-size: 22px; font-weight: 800; color: #2d6bcf; letter-spacing: 2px; text-align: center; padding: 16px; background: #eff6ff; border-radius: 8px; margin: 20px 0; }
    .footer { background: #f8fafc; padding: 24px 32px; text-align: center; border-top: 1px solid #e2e8f0; }
    .footer p { color: #94a3b8; font-size: 13px; margin: 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🏫 ${schoolName}</h1>
      <p>Official Admissions Office</p>
      <span class="badge">✓ APPLICATION APPROVED</span>
    </div>
    <div class="body">
      <p class="greeting">Dear Parent/Guardian,</p>
      <p class="text">We are delighted to inform you that the admission application for your child has been <strong>officially approved</strong>. Welcome to the ${schoolName} family!</p>
      
      <div class="app-number">
        Application No: ${student.applicationNumber}
      </div>

      <div class="info-card">
        <div class="info-row">
          <span class="info-label">Student Name</span>
          <span class="info-value">${student.fullName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date of Birth</span>
          <span class="info-value">${student.dateOfBirth}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Gender</span>
          <span class="info-value">${student.gender}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Approval Date</span>
          <span class="info-value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value" style="color:#22c55e;">✓ Approved</span>
        </div>
      </div>

      <p class="text">Please report to the school's admissions office with all required documents within <strong>7 working days</strong> to complete the enrollment process. Bring this email as confirmation of approval.</p>

      <p class="text">If you have any questions, please contact our admissions office. We look forward to welcoming ${student.fullName} to our school community!</p>

      <p class="text" style="margin-top: 24px;">Warm regards,<br><strong>${schoolName} Admissions Team</strong></p>
    </div>
    <div class="footer">
      <p>${schoolName} &bull; Admissions Office &bull; This is an automated email, please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendApprovalEmail };
