import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { KeyRound, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

export const GooglePasswordSetupModal = ({
  isOpen,
  onClose,
  googleUser
}) => {
  const { setUserPassword } = useAuth();
  const toast = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !googleUser) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const res = setUserPassword(googleUser.email, newPassword);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(
        'Password Configured!',
        `Your password has been saved. You can now log in via Google or email & password.`
      );
      onClose();
    } else {
      setError(res.message || 'Failed to save password.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set / Reset Account Password"
      subtitle={`Configure a password for ${googleUser.email}`}
      icon={KeyRound}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
        {/* Authenticated User Identity Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm border flex-shrink-0 ${
              googleUser.avatarBg || 'bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}>
              {googleUser.avatar || 'GS'}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-xs truncate">{googleUser.name}</p>
              <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{googleUser.email}</p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 flex-shrink-0">
            👷 Staff
          </span>
        </div>

        <div className="p-3 bg-coral-50/70 border border-coral-200/60 rounded-xl text-xs text-coral-950 flex items-start gap-2">
          <KeyRound className="w-4 h-4 text-coral-600 mt-0.5 flex-shrink-0" />
          <div>
            <strong className="font-bold block">Account Authenticated:</strong>
            Set a password for your account so you can also log in directly using your email and password anytime.
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
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
                if (error) setError('');
              }}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Skip (Keep Google Only)
          </button>

          <Button type="submit" variant="primary" loading={isSubmitting} className="coral-glow text-xs font-bold">
            Save Password & Continue
          </Button>
        </div>
      </form>
    </Modal>
  );
};
