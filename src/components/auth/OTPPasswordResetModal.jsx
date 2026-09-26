import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export const OTPPasswordResetModal = ({
  isOpen,
  onClose,
  targetEmail: initialEmail = '',
  targetUser = null
}) => {
  const {
    user: currentUser,
    requestPasswordResetOTP,
    resendPasswordResetOTP,
    verifyOTPAndResetPassword
  } = useAuth();
  const toast = useToast();

  const [step, setStep] = useState(1); // 1: Request, 2: Verify & Reset
  const [email, setEmail] = useState(initialEmail || currentUser?.email || '');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [generatedOTP, setGeneratedOTP] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Sync email if props change
  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail || currentUser?.email || '');
      setStep(1);
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setGeneratedOTP('');
      setExpiresAt(null);
    }
  }, [isOpen, initialEmail, currentUser]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!expiresAt || step !== 2) return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      if (remaining <= 0) {
        setTimeLeft('Expired');
      } else {
        const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
        const secs = (remaining % 60).toString().padStart(2, '0');
        setTimeLeft(`${mins}:${secs}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, step]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  // Step 1: Send OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await requestPasswordResetOTP(email);
    setIsLoading(false);

    if (res.success) {
      setGeneratedOTP(res.otpCode);
      setExpiresAt(res.expiresAt || (Date.now() + 10 * 60 * 1000));
      setResendCooldown(30);
      setEmailSent(Boolean(res.emailSent));
      setStep(2);
      if (res.emailSent) {
        toast.success('Email Dispatched', `Verification code sent to ${email}`);
      } else {
        toast.info('OTP Generated', `Verification code sent to ${email} (Code: ${res.otpCode})`);
      }
    } else {
      setError(res.message || 'Failed to generate OTP.');
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setError('');

    const res = await resendPasswordResetOTP(email);
    setIsLoading(false);

    if (res.success) {
      setGeneratedOTP(res.otpCode);
      setExpiresAt(res.expiresAt || (Date.now() + 10 * 60 * 1000));
      setResendCooldown(30);
      setEmailSent(Boolean(res.emailSent));
      if (res.emailSent) {
        toast.success('Email Re-sent', `New verification code sent to ${email}`);
      } else {
        toast.success('New OTP Generated', `New code: ${res.otpCode}`);
      }
    } else {
      setError(res.message || 'Failed to resend code.');
    }
  };

  // Step 2: Verify & Reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setError('Please enter the valid 6-digit verification code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    const res = await verifyOTPAndResetPassword({
      email,
      otp: otpCode.trim(),
      newPassword
    });
    setIsLoading(false);

    if (res.success) {
      toast.success('Password Updated', res.message);
      onClose();
    } else {
      setError(res.message || 'Failed to reset password.');
    }
  };

  const handleCopyOTP = () => {
    if (!generatedOTP) return;
    navigator.clipboard.writeText(generatedOTP);
    setCopied(true);
    toast.info('Copied to Clipboard', `Code: ${generatedOTP}`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Password Strength Calculation
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-rose-500 text-rose-600' };
    if (score <= 3) return { score: 2, text: 'Medium', color: 'bg-amber-500 text-amber-600' };
    return { score: 3, text: 'Strong', color: 'bg-emerald-500 text-emerald-600' };
  };

  const strength = getPasswordStrength(newPassword);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="OTP-Based Password Reset"
      subtitle={
        step === 1
          ? 'Request a secure 6-digit verification code'
          : `Verify code and set new password for ${email}`
      }
      icon={KeyRound}
      maxWidth="max-w-md"
    >
      {step === 1 ? (
        /* STEP 1: Request OTP */
        <form onSubmit={handleRequestOTP} className="space-y-4 animate-fade-in">
          {targetUser && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs border ${
                    targetUser.avatarBg || 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {targetUser.avatar || 'US'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">{targetUser.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{targetUser.email}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {targetUser.badge || targetUser.role}
              </span>
            </div>
          )}

          <div className="p-3 bg-coral-50/60 border border-coral-200/60 rounded-xl text-xs text-coral-950 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-coral-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="font-bold block">Two-Step Verification:</strong>
              A 6-digit one-time passcode (OTP) will be generated and verified before updating password credentials.
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <Input
              label="Account Email Address"
              name="email"
              type="email"
              placeholder="user@stocksense.io"
              icon={Mail}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="coral-glow font-bold text-xs"
            >
              Generate 6-Digit OTP
            </Button>
          </div>
        </form>
      ) : (
        /* STEP 2: Verify OTP & Reset Password */
        <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
          {/* Email Delivery Card */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs text-emerald-950 shadow-xs">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl flex-shrink-0 mt-0.5 border border-emerald-200">
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-emerald-900 block">Check Your Email</span>
                {timeLeft && (
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {timeLeft}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                A 6-digit verification code was sent to <strong className="font-semibold text-emerald-950">{email}</strong>. Please check your inbox or spam folder and enter the code below.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 6-Digit OTP Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                6-Digit Verification Code
              </label>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
                className="text-[11px] font-bold text-coral-600 hover:text-coral-700 disabled:text-slate-400 flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>
            <input
              type="text"
              maxLength={6}
              placeholder="••••••"
              value={otpCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setOtpCode(val);
                if (error) setError('');
              }}
              className="w-full font-mono text-center tracking-[0.4em] font-extrabold text-xl py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 shadow-xs"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              New Password (min. 6 characters)
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        strength.score === 1
                          ? 'w-1/3 bg-rose-500'
                          : strength.score === 2
                          ? 'w-2/3 bg-amber-500'
                          : 'w-full bg-emerald-500'
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-bold ${strength.color}`}>
                    {strength.text}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && newPassword && (
              <div className="mt-1 flex items-center gap-1 text-[11px]">
                {newPassword === confirmPassword ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passwords match
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Passwords do not match
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError('');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Change Email
            </button>

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="coral-glow font-bold text-xs"
            >
              Verify OTP & Save Password
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
