import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Helper to read current .env file on demand
function getRuntimeEnv() {
  const env = {};
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          let val = match[2] || '';
          val = val.trim().replace(/^['"](.*)['"]$/, '$1');
          env[match[1]] = val;
        }
      });
    }
  } catch (e) {
    console.error('Error reading .env dynamically', e);
  }
  return env;
}

// Helper to create OTP HTML email
function createOtpEmailTemplate({ otpCode, recipientName = 'User', toEmail }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>StockSense - Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF6B4A 0%, #E11D48 100%); padding: 28px 32px; text-align: center;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                Stock<span style="color: #FFE4E6;">Sense</span> IMS
              </h1>
              <p style="margin: 6px 0 0 0; color: #FFF1F2; font-size: 13px; font-weight: 500;">
                Enterprise Inventory & Warehouse Operations
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h2 style="margin: 0 0 12px 0; color: #0F172A; font-size: 18px; font-weight: 700;">
                Password Reset Verification Code
              </h2>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Hello <strong>${recipientName || 'StockSense User'}</strong>,<br>
                We received a request to reset your password for your StockSense account (<span style="color: #0F172A; font-weight: 600;">${toEmail}</span>). Use the 6-digit one-time code below to proceed:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background: #FFF5F4; border: 2px dashed #FED7D2; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 700; color: #EA580C; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">
                  Your Verification Code
                </div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #C2410C; margin: 4px 0;">
                  ${otpCode}
                </div>
                <div style="font-size: 12px; color: #9A3412; margin-top: 6px;">
                  ⏱️ Valid for 10 minutes
                </div>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px; padding: 14px 16px; margin: 20px 0 0 0;">
                <p style="margin: 0; color: #64748B; font-size: 12px; line-height: 1.5;">
                  🔒 <strong>Security tip:</strong> Never share this code with anyone. StockSense staff will never ask for your verification code. If you did not request this password reset, you can safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0; color: #94A3B8; font-size: 11px;">
                © ${new Date().getFullYear()} StockSense IMS Inc. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

// Vite Server Email Plugin
function emailOtpServerPlugin() {
  const handleEmailRequest = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { to, otpCode, recipientName, senderEmail, appPassword } = payload;
        const env = getRuntimeEnv();

        const userEmail = (senderEmail || env.VITE_GMAIL_USER || env.GMAIL_USER || env.VITE_EMAIL_USER || process.env.VITE_GMAIL_USER || '').trim();
        const userPass = (appPassword || env.VITE_GMAIL_APP_PASSWORD || env.GMAIL_APP_PASSWORD || env.VITE_EMAIL_APP_PASS || process.env.VITE_GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');

        if (!to || !otpCode) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ success: false, error: 'Recipient email ("to") and "otpCode" are required.' }));
        }

        if (!userEmail || !userPass) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            success: false,
            error: 'Sender Gmail and App Password not configured. Please enter them in Settings or .env file.'
          }));
        }

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: userEmail,
            pass: userPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const htmlContent = createOtpEmailTemplate({
          otpCode,
          recipientName,
          toEmail: to
        });

        const mailOptions = {
          from: `"StockSense Security" <${userEmail}>`,
          to,
          subject: `${otpCode} is your StockSense password reset code`,
          html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] OTP Email successfully sent to ${to} (Message ID: ${info.messageId})`);

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          messageId: info.messageId,
          message: `Verification email delivered to ${to}`
        }));
      } catch (err) {
        console.error('[Email Service Error]', err.message);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: false,
          error: err.message || 'Failed to send verification email via Gmail SMTP.'
        }));
      }
    });
  };

  const handleTestSmtp = async (req, res) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { senderEmail, appPassword, testRecipient } = payload;
        const env = getRuntimeEnv();

        const userEmail = (senderEmail || env.VITE_GMAIL_USER || '').trim();
        const userPass = (appPassword || env.VITE_GMAIL_APP_PASSWORD || '').trim().replace(/\s+/g, '');
        const recipient = (testRecipient || userEmail).trim();

        if (!userEmail || !userPass) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            success: false,
            error: 'Sender Gmail address and 16-character App Password are required.'
          }));
        }

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: userEmail,
            pass: userPass
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        // Verify credentials with transporter
        await transporter.verify();

        // Send a test verification email
        const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const html = createOtpEmailTemplate({
          otpCode: testOtp,
          recipientName: 'StockSense Admin',
          toEmail: recipient
        });

        await transporter.sendMail({
          from: `"StockSense Security" <${userEmail}>`,
          to: recipient,
          subject: 'StockSense IMS - SMTP Connection Test Successful',
          html
        });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: true,
          message: `Successfully connected to Gmail SMTP! Test email sent to ${recipient}.`
        }));
      } catch (err) {
        console.error('[SMTP Test Error]', err.message);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          success: false,
          error: err.message || 'SMTP Authentication failed. Please check your Gmail address and 16-character App Password.'
        }));
      }
    });
  };

  return {
    name: 'email-otp-server-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/send-otp-email' && req.method === 'POST') {
          return handleEmailRequest(req, res);
        }
        if (req.url === '/api/test-smtp' && req.method === 'POST') {
          return handleTestSmtp(req, res);
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/send-otp-email' && req.method === 'POST') {
          return handleEmailRequest(req, res);
        }
        if (req.url === '/api/test-smtp' && req.method === 'POST') {
          return handleTestSmtp(req, res);
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    emailOtpServerPlugin()
  ],
  server: {
    port: 3000,
    open: false
  }
});
