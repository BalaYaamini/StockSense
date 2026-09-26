import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { User, ShieldAlert, CheckCircle2, ArrowRight, Globe, Lock, KeyRound, Eye, EyeOff, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';

const SAVED_ACCOUNTS_STORAGE_KEY = 'stocksense_saved_google_accounts_v1';

export const GoogleOAuthModal = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { loginWithGoogle, setUserPassword } = useAuth();
  const { isSupabaseConnected } = useInventory();
  const toast = useToast();

  // Saved accounts from localStorage
  const [savedAccounts, setSavedAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(SAVED_ACCOUNTS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Step: 'select_account' | 'password_prompt'
  const [step, setStep] = useState('select_account');
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Password Setup States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Reset states when modal is closed/opened
  useEffect(() => {
    if (!isOpen) {
      setStep('select_account');
      setAuthenticatedUser(null);
      setCustomName('');
      setCustomEmail('');
      setIsAddingNew(false);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  const saveAccountToMemory = (account) => {
    try {
      const updated = [account, ...savedAccounts.filter(a => a.email.toLowerCase() !== account.email.toLowerCase())].slice(0, 5);
      setSavedAccounts(updated);
      localStorage.setItem(SAVED_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const removeSavedAccount = (e, email) => {
    e.stopPropagation();
    const updated = savedAccounts.filter(a => a.email.toLowerCase() !== email.toLowerCase());
    setSavedAccounts(updated);
    localStorage.setItem(SAVED_ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSelectAccount = (account) => {
    if (!account) return;
    const name = account.name || 'Google Staff Member';
    const email = (account.email || '').trim().toLowerCase();
    const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'GS';
    const avatarBg = account.avatarBg || 'bg-indigo-100 text-indigo-700 border-indigo-200';

    const preparedUser = {
      name,
      email,
      avatar: initials,
      avatarBg
    };

    saveAccountToMemory(preparedUser);
    setAuthenticatedUser(preparedUser);
    setPasswordError('');
    setNewPassword('');
    setConfirmPassword('');
    // Transition to password setup / reset prompt
    setStep('password_prompt');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;

    handleSelectAccount({
      name: customName.trim(),
      email: customEmail.trim(),
      avatarBg: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    });
  };

  // Submit Password Setup / Reset for this Google Account
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    // Now execute login with the specified custom password
    const res = await loginWithGoogle(authenticatedUser, newPassword);
    if (res?.success) {
      toast.success(
        'Password Configured!',
        `Your password has been saved. Welcome, ${authenticatedUser.name}!`
      );
      onClose();
      if (onSuccess) onSuccess(res.user);
    }
  };

  const handleSkipPassword = async () => {
    const res = await loginWithGoogle(authenticatedUser, '');
    if (res?.success) {
      toast.info(
        'Signed in via Google',
        `Welcome, ${authenticatedUser.name}! Signed in as Warehouse Staff.`
      );
      onClose();
      if (onSuccess) onSuccess(res.user);
    }
  };

  const showAccountList = savedAccounts.length > 0 && !isAddingNew;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 'password_prompt' ? "Set / Reset Account Password" : "Sign in with Google"}
      subtitle={
        step === 'password_prompt'
          ? `Configure password for ${authenticatedUser?.email || 'your account'}`
          : "Choose an account to continue to StockSense IMS"
      }
      icon={step === 'password_prompt' ? KeyRound : undefined}
      maxWidth="max-w-md"
    >
      {step === 'select_account' ? (
        <div className="space-y-4">
          {showAccountList ? (
            <div className="space-y-2.5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                Select Your Google Account:
              </p>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {savedAccounts.map((acc) => (
                  <div
                    key={acc.email}
                    onClick={() => handleSelectAccount(acc)}
                    className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                        {acc.avatar || acc.name?.slice(0, 2).toUpperCase() || 'GS'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate group-hover:text-coral-600 transition-colors">
                          {acc.name}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                          {acc.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => removeSavedAccount(e, acc.email)}
                        className="p-1 rounded text-slate-300 hover:text-rose-500 transition-colors"
                        title="Remove account from device"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-coral-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="text-xs font-bold text-coral-600 hover:text-coral-700 flex items-center justify-center gap-1.5 mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Use another Google account</span>
                </button>
              </div>
            </div>
          ) : (
            /* Direct Enter Your Google Account Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5 animate-fade-in">
              <div>
                <Input
                  label="Your Full Name"
                  placeholder="e.g. Chitra Devi"
                  icon={User}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Input
                  label="Google Email Address"
                  type="email"
                  placeholder="your.email@gmail.com"
                  icon={Lock}
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {savedAccounts.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    ← Back to Accounts
                  </button>
                ) : (
                  <Button variant="secondary" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                )}

                <Button type="submit" variant="primary" size="sm" className="coral-glow font-bold">
                  Continue to Password Setup →
                </Button>
              </div>
            </form>
          )}

          {showAccountList && (
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Cancel
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* STEP 2: PASSWORD SETUP / RESET PROMPT */
        <form onSubmit={handleSavePassword} className="space-y-4 animate-fade-in">
          {/* User Preview Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm border ${
                authenticatedUser?.avatarBg || 'bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}>
                {authenticatedUser?.avatar || 'GS'}
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">{authenticatedUser?.name}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{authenticatedUser?.email}</p>
              </div>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
              👷 Staff
            </span>
          </div>

          <div className="p-3 bg-coral-50/70 border border-coral-200/60 rounded-xl text-xs text-coral-950 flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-coral-600 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="font-bold block">Password Setup / Reset:</strong>
              Set a password so you can sign in directly using email & password or reset credentials anytime.
            </div>
          </div>

          {passwordError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <div className="space-y-3">
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
                    if (passwordError) setPasswordError('');
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
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep('select_account')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Back to Accounts
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSkipPassword}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2 py-1"
              >
                Skip
              </button>

              <Button type="submit" variant="primary" className="coral-glow text-xs font-bold">
                Save Password & Enter
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
