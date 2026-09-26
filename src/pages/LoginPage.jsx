import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Crown,
  Copy,
  Check,
  Clock,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth, ROLES } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const LoginPage = ({ onLoginSuccess }) => {
  const {
    login,
    signup,
    loginWithGoogle,
    requestPasswordResetOTP,
    resendPasswordResetOTP,
    verifyOTPAndResetPassword,
    loginAsDemoUser
  } = useAuth();
  const toast = useToast();

  // Mode: 'login', 'signup', 'forgot_otp_step1', 'forgot_otp_step2'
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF', // Public signup defaults to Staff
    otpCode: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [simulatedOTP, setSimulatedOTP] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [otpTimeLeft, setOtpTimeLeft] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [copiedOTP, setCopiedOTP] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Live OTP expiration countdown
  useEffect(() => {
    if (!otpExpiresAt || authMode !== 'forgot_otp_step2') return;

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      if (remaining <= 0) {
        setOtpTimeLeft('Expired');
      } else {
        const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
        const secs = (remaining % 60).toString().padStart(2, '0');
        setOtpTimeLeft(`${mins}:${secs}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [otpExpiresAt, authMode]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // 1. Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await login({ email: formData.email, password: formData.password });
    setIsLoading(false);

    if (res.success) {
      toast.success(
        'Welcome Back!',
        `Signed in as ${res.user.name} (${res.user.roleTitle})`
      );
      if (onLoginSuccess) onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.message || 'Invalid email or password.');
    }
  };

  // 2. Submit Sign Up
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await signup({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    setIsLoading(false);

    if (res.success) {
      toast.success(
        'Account Created!',
        `Welcome to StockSense, ${res.user.name}!`
      );
      if (onLoginSuccess) onLoginSuccess(res.user);
    } else {
      setErrorMessage(res.message || 'Failed to create account.');
    }
  };

  // 3. Request OTP for Password Reset (Step 1)
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      setErrorMessage('Please enter your account email.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await requestPasswordResetOTP(formData.email);
    setIsLoading(false);

    if (res.success) {
      setSimulatedOTP(res.otpCode);
      setOtpExpiresAt(res.expiresAt || (Date.now() + 10 * 60 * 1000));
      setResendCooldown(30);
      setEmailSent(Boolean(res.emailSent));
      setAuthMode('forgot_otp_step2');
      if (res.emailSent) {
        toast.success('Email Dispatched', `Verification code sent to ${formData.email}`);
      } else {
        toast.info('OTP Generated', `Verification code: ${res.otpCode} (valid for 10 min)`);
      }
    } else {
      setErrorMessage(res.message);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage('');

    const res = await (resendPasswordResetOTP ? resendPasswordResetOTP(formData.email) : requestPasswordResetOTP(formData.email));
    setIsLoading(false);

    if (res.success) {
      setSimulatedOTP(res.otpCode);
      setOtpExpiresAt(res.expiresAt || (Date.now() + 10 * 60 * 1000));
      setResendCooldown(30);
      setEmailSent(Boolean(res.emailSent));
      if (res.emailSent) {
        toast.success('Email Re-sent', `New verification code sent to ${formData.email}`);
      } else {
        toast.success('New OTP Generated', `New code: ${res.otpCode}`);
      }
    } else {
      setErrorMessage(res.message || 'Failed to resend code.');
    }
  };

  // Copy OTP helper
  const handleCopyOTP = () => {
    if (!simulatedOTP) return;
    navigator.clipboard.writeText(simulatedOTP);
    setCopiedOTP(true);
    toast.info('Copied to Clipboard', `Code: ${simulatedOTP}`);
    setTimeout(() => setCopiedOTP(false), 2000);
  };

  // 4. Verify OTP & Reset Password (Step 2)
  const handleVerifyOTPAndReset = async (e) => {
    e.preventDefault();
    if (!formData.otpCode.trim() || formData.otpCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }
    if (!formData.newPassword || formData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await verifyOTPAndResetPassword({
      email: formData.email,
      otp: formData.otpCode.trim(),
      newPassword: formData.newPassword
    });
    setIsLoading(false);

    if (res.success) {
      toast.success('Password Reset Successful', res.message);
      setAuthMode('login');
      setFormData(prev => ({
        ...prev,
        password: prev.newPassword,
        newPassword: '',
        confirmPassword: '',
        otpCode: ''
      }));
    } else {
      setErrorMessage(res.message);
    }
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

  const strength = getPasswordStrength(formData.newPassword);

  // 5. Quick 1-Click Demo Login
  const handleQuickDemoLogin = (roleKey) => {
    const loggedUser = loginAsDemoUser(roleKey);
    toast.success(
      'Profile Activated',
      `Switched to ${loggedUser.name} (${loggedUser.roleTitle})`
    );
    if (onLoginSuccess) onLoginSuccess(loggedUser);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'Google OAuth failed to initialize.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-coral-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/60 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-md border border-slate-200/80 bg-white p-1.5">
            <img
              src="/logo.png"
              alt="StockSense Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Stock<span className="text-coral-500">Sense</span> IMS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Inventory & Warehouse Operations
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-card-hover rounded-3xl border border-slate-200/80 space-y-5">
          {/* VIEW: LOGIN */}
          {authMode === 'login' && (
            <div className="space-y-4 animate-fade-in">
              {/* Continue with Google (Direct Google OAuth Redirect) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 rounded-2xl font-bold text-slate-700 text-xs sm:text-sm shadow-xs transition-all active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
                <span className="text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  Staff Login
                </span>
              </button>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  or sign in with email
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div>
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="admin@stocksense.io or alex.morgan@..."
                    icon={Mail}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage('');
                        setAuthMode('forgot_otp_step1');
                      }}
                      className="text-xs font-semibold text-coral-600 hover:text-coral-700"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      icon={Lock}
                      value={formData.password}
                      onChange={handleChange}
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
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  loading={isLoading}
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full justify-center coral-glow py-2.5 font-bold text-sm"
                >
                  Sign In
                </Button>
              </form>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500">
                  New staff member?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setAuthMode('signup');
                    }}
                    className="font-bold text-coral-600 hover:text-coral-700"
                  >
                    Create staff account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* VIEW: SIGN UP */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <h3 className="text-base font-bold text-slate-900">Create Staff Profile</h3>
                <p className="text-xs text-slate-500">
                  Join StockSense (Managers are authorized by Administrator)
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="e.g. John Miller"
                  icon={User}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="john.miller@warehouse.com"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="Password (min. 6 characters)"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-900 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span>Default role: <strong>Warehouse Staff</strong>. Manager accounts are imported via Admin.</span>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full justify-center coral-glow py-2.5 font-bold text-sm"
              >
                Register Staff Account
              </Button>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setAuthMode('login');
                    }}
                    className="font-bold text-coral-600 hover:text-coral-700"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* VIEW: OTP STEP 1 */}
          {authMode === 'forgot_otp_step1' && (
            <form onSubmit={handleRequestOTP} className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">OTP Password Reset</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral-50 text-coral-700 border border-coral-200">
                    Step 1 of 2
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your account email to receive a secure 6-digit verification code
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <Input
                  label="Registered Email Address"
                  name="email"
                  type="email"
                  placeholder="e.g. admin@stocksense.io"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Quick Select Demo Accounts */}
              <div className="pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Quick Select Demo Email:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, email: ROLES.ADMIN.email }))}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 transition-colors"
                  >
                    👑 Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, email: ROLES.MANAGER.email }))}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-coral-50 text-coral-700 border border-coral-200/80 hover:bg-coral-100 transition-colors"
                  >
                    👔 Manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, email: ROLES.STAFF.email }))}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200/80 hover:bg-indigo-100 transition-colors"
                  >
                    👷 Staff
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
                className="w-full justify-center py-2.5 font-bold text-sm coral-glow mt-2"
              >
                Send 6-Digit OTP Code
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthMode('login');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* VIEW: OTP STEP 2 */}
          {authMode === 'forgot_otp_step2' && (
            <form onSubmit={handleVerifyOTPAndReset} className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 pb-3 mb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Verify Code & Reset</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Step 2 of 2
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-slate-500 truncate max-w-[220px]">
                    Code sent to <span className="font-semibold text-slate-700">{formData.email}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setAuthMode('forgot_otp_step1');
                    }}
                    className="text-[11px] font-bold text-coral-600 hover:text-coral-700 ml-2 flex-shrink-0"
                  >
                    Change
                  </button>
                </div>
              </div>

              {/* Email Delivery Card */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-start gap-3 text-xs text-emerald-950 shadow-xs">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl flex-shrink-0 mt-0.5 border border-emerald-200">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-emerald-900 block">Check Your Email</span>
                    {otpTimeLeft && (
                      <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {otpTimeLeft}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                    A 6-digit verification code was sent to <strong className="font-semibold text-emerald-950">{formData.email}</strong>. Please check your inbox or spam folder and enter the code below.
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
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
                    onClick={handleResendOTP}
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
                  value={formData.otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData(prev => ({ ...prev, otpCode: val }));
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-full font-mono text-center tracking-[0.4em] font-extrabold text-xl py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-coral-500 shadow-xs"
                  required
                />
              </div>

              {/* New Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  New Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Input
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={Lock}
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.newPassword && (
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

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    icon={Lock}
                    value={formData.confirmPassword}
                    onChange={handleChange}
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
                {formData.confirmPassword && formData.newPassword && (
                  <div className="mt-1 flex items-center gap-1 text-[11px]">
                    {formData.newPassword === formData.confirmPassword ? (
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

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full justify-center py-2.5 font-bold text-sm coral-glow mt-2"
              >
                Reset Password & Continue to Sign In
              </Button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthMode('login');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3 Profiles 1-Click Fast Demo Switcher for Hackathon Testing */}
        <div className="mt-5 p-4 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-coral-500" />
              <span>3 Profiles Quick-Access (No Password Needed)</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('ADMIN')}
              className="p-2 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 transition-all text-left group"
            >
              <span className="text-[9px] uppercase font-bold text-rose-700 block">👑 Admin</span>
              <span className="text-[11px] font-bold text-slate-900 group-hover:text-rose-700 block truncate">
                Sarah Vance
              </span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('MANAGER')}
              className="p-2 rounded-xl border border-coral-200 bg-coral-50/70 hover:bg-coral-100 transition-all text-left group"
            >
              <span className="text-[9px] uppercase font-bold text-coral-700 block">👔 Manager</span>
              <span className="text-[11px] font-bold text-slate-900 group-hover:text-coral-700 block truncate">
                Alex Morgan
              </span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('STAFF')}
              className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 transition-all text-left group"
            >
              <span className="text-[9px] uppercase font-bold text-indigo-700 block">👷 Staff</span>
              <span className="text-[11px] font-bold text-slate-900 group-hover:text-indigo-700 block truncate">
                Dave Miller
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
