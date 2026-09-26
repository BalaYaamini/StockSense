// StockSense - Email Service for OTP Delivery via Gmail App Password & SMTP

const EMAIL_CONFIG_KEY = 'stocksense_email_config_v1';

export const getEmailConfig = () => {
  const envUser = import.meta.env.VITE_GMAIL_USER || import.meta.env.VITE_EMAIL_USER || '';
  const envPass = import.meta.env.VITE_GMAIL_APP_PASSWORD || import.meta.env.VITE_EMAIL_APP_PASS || '';

  try {
    const saved = localStorage.getItem(EMAIL_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        senderEmail: parsed.senderEmail || envUser,
        appPassword: parsed.appPassword || envPass,
        isEnabled: parsed.isEnabled !== false && Boolean(parsed.senderEmail || envUser)
      };
    }
  } catch (e) {
    console.error('Error reading email config from localStorage', e);
  }

  return {
    senderEmail: envUser,
    appPassword: envPass,
    isEnabled: Boolean(envUser && envPass)
  };
};

export const saveEmailConfig = (config) => {
  try {
    localStorage.setItem(EMAIL_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving email config', e);
  }
};

/**
 * Send an OTP verification email to the user
 */
export const sendOtpEmail = async ({ to, otpCode, recipientName = 'User' }) => {
  const config = getEmailConfig();

  try {
    const response = await fetch('/api/send-otp-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to,
        otpCode,
        recipientName,
        senderEmail: config.senderEmail,
        appPassword: config.appPassword
      })
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return {
        success: true,
        emailSent: true,
        messageId: result.messageId,
        message: `Verification code successfully sent to ${to}`
      };
    } else {
      return {
        success: false,
        emailSent: false,
        error: result.error || 'Failed to dispatch email.',
        message: result.error || 'Email delivery failed'
      };
    }
  } catch (err) {
    console.warn('Email dispatch notice:', err.message);
    return {
      success: false,
      emailSent: false,
      error: err.message,
      message: 'Could not connect to email delivery server endpoint.'
    };
  }
};

/**
 * Test SMTP configuration by sending a test verification email
 */
export const testSmtpConnection = async ({ senderEmail, appPassword, testRecipient }) => {
  if (!senderEmail || !appPassword) {
    return {
      success: false,
      message: 'Sender Gmail and App Password are required.'
    };
  }

  const targetRecipient = testRecipient || senderEmail;

  try {
    const response = await fetch('/api/test-smtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        senderEmail,
        appPassword,
        testRecipient: targetRecipient
      })
    });

    const result = await response.json();
    if (response.ok && result.success) {
      return {
        success: true,
        message: `Test email sent successfully to ${targetRecipient}!`
      };
    } else {
      return {
        success: false,
        message: result.error || 'SMTP verification failed.'
      };
    }
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Failed to connect to email server.'
    };
  }
};
