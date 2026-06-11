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

const schoolName = process.env.SCHOOL_NAME || 'Greenfield Academy';

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
          <span class="info-label">Class Level</span>
          <span class="info-value">${student.classLevel}</span>
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

async function sendSubmissionEmail(student) {
  const recipientEmails = [student.motherEmail, student.fatherEmail]
    .filter(e => e && e.trim());

  if (recipientEmails.length === 0) return null;

  const submittedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const submittedTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  const prevSchoolSection = student.prevSchoolName ? `
    <tr>
      <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">
        <span style="color:#64748b;font-weight:500;font-size:13px;">Previous School</span>
      </td>
      <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
        <span style="color:#1e293b;font-weight:600;font-size:13px;">${student.prevSchoolName}</span>
      </td>
    </tr>` : '';

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application Submitted – ${schoolName}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">

  <div style="max-width:620px;margin:40px auto;padding:0 16px 40px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0f2447 0%,#1a3c6e 50%,#2d6bcf 100%);border-radius:16px 16px 0 0;padding:40px 36px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">🏫</div>
      <h1 style="color:#ffffff;margin:0 0 6px;font-size:24px;font-weight:800;letter-spacing:-0.5px;">${schoolName}</h1>
      <p style="color:rgba(255,255,255,0.7);margin:0;font-size:14px;">Official Admissions Office</p>
      <div style="display:inline-block;background:#f5a623;color:white;padding:8px 24px;border-radius:999px;font-size:13px;font-weight:700;margin-top:20px;letter-spacing:0.5px;">
        📬 APPLICATION RECEIVED
      </div>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:36px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">

      <p style="font-size:17px;font-weight:600;color:#1a3c6e;margin:0 0 12px;">Dear Parent / Guardian,</p>
      <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Thank you for submitting an admission application for your child at <strong>${schoolName}</strong>.
        We have successfully received your application and it is now <strong>under review</strong> by our admissions team.
        You will be notified by email once a decision has been made.
      </p>

      <!-- Application Number Box -->
      <div style="background:#eff6ff;border:2px dashed #93c5fd;border-radius:12px;padding:20px 24px;text-align:center;margin:0 0 28px;">
        <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Your Application Number</p>
        <p style="margin:0;font-size:28px;font-weight:800;color:#1a3c6e;letter-spacing:3px;">${student.applicationNumber}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#64748b;">Please keep this number safe – you will need it to track your application status.</p>
      </div>

      <!-- Student Details Card -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;margin:0 0 24px;">
        <div style="background:#1a3c6e;padding:12px 20px;">
          <p style="margin:0;color:white;font-size:13px;font-weight:700;letter-spacing:0.3px;">👤 STUDENT INFORMATION</p>
        </div>
        <div style="padding:8px 20px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;font-weight:500;font-size:13px;">Full Name</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                <span style="color:#1e293b;font-weight:700;font-size:13px;">${student.fullName}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;font-weight:500;font-size:13px;">Date of Birth</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                <span style="color:#1e293b;font-weight:600;font-size:13px;">${student.dateOfBirth}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;font-weight:500;font-size:13px;">Gender</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                <span style="color:#1e293b;font-weight:600;font-size:13px;">${student.gender}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;font-weight:500;font-size:13px;">Class Level to Join</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                <span style="color:#1e293b;font-weight:700;font-size:13px;background:#dbeafe;color:#1e40af;padding:2px 10px;border-radius:999px;">${student.classLevel}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;font-weight:500;font-size:13px;">Country of Birth</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                <span style="color:#1e293b;font-weight:600;font-size:13px;">${student.countryOfBirth}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;font-weight:500;font-size:13px;">Citizenship</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                <span style="color:#1e293b;font-weight:600;font-size:13px;">${student.citizenship}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;font-weight:500;font-size:13px;">Religion</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                <span style="color:#1e293b;font-weight:600;font-size:13px;">${student.religion || 'Not specified'}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;font-weight:500;font-size:13px;">Language(s) Spoken</span>
              </td>
              <td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right;">
                <span style="color:#1e293b;font-weight:600;font-size:13px;">${student.languageSpoken}</span>
              </td>
            </tr>
            ${prevSchoolSection}
            <tr>
              <td style="padding:8px 0;">
                <span style="color:#64748b;font-weight:500;font-size:13px;">Emergency Contact</span>
              </td>
              <td style="padding:8px 0;text-align:right;">
                <span style="color:#1e293b;font-weight:600;font-size:13px;">${student.emergencyName} · ${student.emergencyPhone}</span>
              </td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Submission Details -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px 20px;margin:0 0 28px;display:flex;align-items:center;gap:12px;">
        <div style="font-size:24px;">✅</div>
        <div>
          <p style="margin:0 0 3px;font-size:14px;font-weight:700;color:#065f46;">Application Successfully Submitted</p>
          <p style="margin:0;font-size:13px;color:#166534;">Submitted on <strong>${submittedDate}</strong> at <strong>${submittedTime}</strong></p>
          <p style="margin:0;font-size:13px;color:#166534;">Current Status: <strong>Pending Review</strong></p>
        </div>
      </div>

      <!-- What Happens Next -->
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:20px 24px;margin:0 0 28px;">
        <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#92400e;">📋 What Happens Next?</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:7px 0;vertical-align:top;width:28px;">
              <span style="display:inline-block;width:22px;height:22px;background:#f5a623;color:white;border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;">1</span>
            </td>
            <td style="padding:7px 0;padding-left:10px;">
              <span style="color:#78350f;font-size:13px;">Our admissions team will review your application carefully.</span>
            </td>
          </tr>
          <tr>
            <td style="padding:7px 0;vertical-align:top;width:28px;">
              <span style="display:inline-block;width:22px;height:22px;background:#f5a623;color:white;border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;">2</span>
            </td>
            <td style="padding:7px 0;padding-left:10px;">
              <span style="color:#78350f;font-size:13px;">You will receive an email notification once a decision has been made.</span>
            </td>
          </tr>
          <tr>
            <td style="padding:7px 0;vertical-align:top;width:28px;">
              <span style="display:inline-block;width:22px;height:22px;background:#f5a623;color:white;border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;">3</span>
            </td>
            <td style="padding:7px 0;padding-left:10px;">
              <span style="color:#78350f;font-size:13px;">If approved, you will be required to visit the admissions office with supporting documents within <strong>7 working days</strong>.</span>
            </td>
          </tr>
          <tr>
            <td style="padding:7px 0;vertical-align:top;width:28px;">
              <span style="display:inline-block;width:22px;height:22px;background:#f5a623;color:white;border-radius:50%;text-align:center;font-size:12px;font-weight:700;line-height:22px;">4</span>
            </td>
            <td style="padding:7px 0;padding-left:10px;">
              <span style="color:#78350f;font-size:13px;">You can track your application status at any time using your application number: <strong>${student.applicationNumber}</strong></span>
            </td>
          </tr>
        </table>
      </div>

      <p style="color:#4b5563;font-size:14px;line-height:1.7;margin:0 0 8px;">
        If you have any questions or need assistance, please contact our admissions office directly.
        Please quote your application number in all correspondence.
      </p>

      <p style="color:#1a3c6e;font-size:15px;font-weight:600;margin:24px 0 0;">
        Warm regards,<br>
        <span style="font-weight:700;">${schoolName} Admissions Team</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#1e293b;border-radius:0 0 16px 16px;padding:24px 36px;text-align:center;">
      <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0 0 4px;">${schoolName} &bull; Admissions Office</p>
      <p style="color:rgba(255,255,255,0.35);font-size:11px;margin:0;">This is an automated confirmation email. Please do not reply directly to this message.</p>
    </div>

  </div>
</body>
</html>`;

  const mailOptions = {
    from: `"${schoolName} Admissions" <${process.env.SMTP_USER}>`,
    to: recipientEmails.join(', '),
    subject: `📬 Application Received – ${student.fullName} | Ref: ${student.applicationNumber}`,
    html
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendApprovalEmail, sendSubmissionEmail };
