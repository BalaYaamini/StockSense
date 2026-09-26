import React, { useState } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth, DEMO_ACCOUNTS } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

export const LoginPage = ({ onLoginSuccess }) => {
  const {
    login,
    signup,
    requestPasswordResetOTP,
    verifyOTPAndResetPassword,
    loginAsDemoUser
  } = useAuth();
  const toast = useToast();

  // Mode: 'login', 'signup', 'forgot_otp_step1', 'forgot_otp_step2'
  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MANAGER', // 'MANAGER' or 'STAFF'
    otpCode: '',
    newPassword: ''
  });

  const [simulatedOTP, setSimulatedOTP] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
        `Logged in as ${res.user.name} (${res.user.roleTitle})`
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
      setAuthMode('forgot_otp_step2');
      toast.info('OTP Generated', `Verification code: ${res.otpCode} (valid for 10 min)`);
    } else {
      setErrorMessage(res.message);
    }
  };

  // 4. Verify OTP & Reset Password (Step 2)
  const handleVerifyOTPAndReset = async (e) => {
    e.preventDefault();
    if (!formData.otpCode.trim() || !formData.newPassword) {
      setErrorMessage('Please enter the 6-digit OTP and your new password.');
      return;
    }
    if (formData.newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await verifyOTPAndResetPassword({
      email: formData.email,
      otp: formData.otpCode,
      newPassword: formData.newPassword
    });
    setIsLoading(false);

    if (res.success) {
      toast.success('Password Reset', res.message);
      setAuthMode('login');
      setFormData(prev => ({ ...prev, password: prev.newPassword }));
    } else {
      setErrorMessage(res.message);
    }
  };

  // 5. Quick 1-Click Demo Login
  const handleQuickDemoLogin = (roleKey) => {
    const loggedUser = loginAsDemoUser(roleKey);
    toast.success(
      'Demo Mode Active',
      `Switched to ${loggedUser.name} (${loggedUser.roleTitle})`
    );
    if (onLoginSuccess) onLoginSuccess(loggedUser);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-coral-100/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-500 to-rose-600 items-center justify-center text-white shadow-lg shadow-coral-500/30 mb-3">
            <Boxes className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Stock<span className="text-coral-500">Sense</span> IMS
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Modular Inventory & Warehouse Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-card-hover rounded-3xl border border-slate-200/80">
          {/* View: LOGIN */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sign In</h3>
                  <p className="text-xs text-slate-500">Access your inventory dashboard</p>
                </div>
                <span className="text-xs font-bold text-coral-600 bg-coral-50 px-2 py-0.5 rounded-full border border-coral-200/60">
                  Secure Access
                </span>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <Input
                  label="Work Email Address"
                  name="email"
                  type="email"
                  placeholder="alex.morgan@stocksense.io"
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
                    className="text-xs font-semibold text-coral-600 hover:text-coral-700 transition-colors"
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
                Sign In to Dashboard
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setAuthMode('signup');
                    }}
                    className="font-bold text-coral-600 hover:text-coral-700"
                  >
                    Create one now
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* View: SIGN UP */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Account</h3>
                  <p className="text-xs text-slate-500">Register as a Manager or Staff member</p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                  New User
                </span>
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
                  placeholder="e.g. Sarah Jenkins"
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
                  placeholder="sarah.jenkins@company.com"
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

              {/* Role Selector Cards */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Select Your Organizational Role:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setFormData(prev => ({ ...prev, role: 'MANAGER' }))}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      formData.role === 'MANAGER'
                        ? 'border-coral-500 bg-coral-50/50 ring-2 ring-coral-500/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`w-4 h-4 ${formData.role === 'MANAGER' ? 'text-coral-600' : 'text-slate-400'}`} />
                      <span className="font-bold text-xs text-slate-900">Inventory Mgr</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                      Full control, incoming/outgoing shipments & analytics.
                    </p>
                  </div>

                  <div
                    onClick={() => setFormData(prev => ({ ...prev, role: 'STAFF' }))}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                      formData.role === 'STAFF'
                        ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <PackageCheck className={`w-4 h-4 ${formData.role === 'STAFF' ? 'text-indigo-600' : 'text-slate-400'}`} />
                      <span className="font-bold text-xs text-slate-900">Warehouse Staff</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                      Order picking, dock receiving & rapid shelf counting.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full justify-center coral-glow py-2.5 font-bold text-sm"
              >
                Register & Enter StockSense
              </Button>

              <div className="text-center pt-2">
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

          {/* View: OTP RESET STEP 1 (Enter Email) */}
          {authMode === 'forgot_otp_step1' && (
            <form onSubmit={handleRequestOTP} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
                  <p className="text-xs text-slate-500">We'll generate a 6-digit verification code</p>
                </div>
                <KeyRound className="w-5 h-5 text-coral-500" />
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
                  placeholder="alex.morgan@stocksense.io"
                  icon={Mail}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full justify-center py-2.5 font-bold text-sm coral-glow"
              >
                Generate 6-Digit OTP Code
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthMode('login');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}

          {/* View: OTP RESET STEP 2 (Verify OTP & Set New Password) */}
          {authMode === 'forgot_otp_step2' && (
            <form onSubmit={handleVerifyOTPAndReset} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enter OTP & New Password</h3>
                  <p className="text-xs text-slate-500">Enter the verification code sent to your email</p>
                </div>
                <KeyRound className="w-5 h-5 text-emerald-600" />
              </div>

              {/* Simulated OTP Helper Chip */}
              {simulatedOTP && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                  <div>
                    <span className="font-bold block">Generated OTP Code:</span>
                    <span className="font-mono font-black text-lg tracking-widest text-emerald-700">
                      {simulatedOTP}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, otpCode: simulatedOTP }))}
                    className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Auto-Fill OTP
                  </button>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <Input
                  label="6-Digit Verification Code (OTP)"
                  name="otpCode"
                  placeholder="e.g. 584920"
                  value={formData.otpCode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Input
                  label="New Password (min. 6 chars)"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full justify-center py-2.5 font-bold text-sm coral-glow"
              >
                Reset Password & Continue
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setAuthMode('login');
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  ← Back to Login
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 1-Click Fast Demo Switcher Card for Hackathon Judges */}
        <div className="mt-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-coral-500" />
              <span>1-Click Demo Quick-Access</span>
            </div>
            <span className="text-[10px] text-slate-400">Skip password typing</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleQuickDemoLogin('MANAGER')}
              className="p-2.5 rounded-xl border border-coral-200 bg-coral-50/70 hover:bg-coral-100/70 transition-all text-left group"
            >
              <span className="text-[10px] uppercase font-bold text-coral-700 block">👔 Inventory Manager</span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-coral-600 transition-colors">
                Alex Morgan
              </span>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('STAFF')}
              className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-all text-left group"
            >
              <span className="text-[10px] uppercase font-bold text-indigo-700 block">👷 Warehouse Staff</span>
              <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Dave Miller
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
