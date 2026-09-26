import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Edit2,
  MapPin,
  Layers,
  Database,
  RotateCcw,
  ShieldCheck,
  Server,
  FileCode,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Link2,
  KeyRound,
  Mail,
  Send,
  HelpCircle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { WarehouseModal } from '../components/modals/WarehouseModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { OTPPasswordResetModal } from '../components/auth/OTPPasswordResetModal';
import { useInventory } from '../hooks/useInventory';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  resetSupabaseClient
} from '../services/supabaseClient';
import {
  getEmailConfig,
  saveEmailConfig,
  testSmtpConnection
} from '../services/emailService';

export const SettingsPage = () => {
  const { warehouses, resetToMockData, products, moveHistory, receipts, deliveries } = useInventory();
  const { user } = useAuth();
  const toast = useToast();

  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isOtpResetOpen, setIsOtpResetOpen] = useState(false);

  // Supabase Configuration State
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseConfig());
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connTestResult, setConnTestResult] = useState(null);

  // Email / SMTP App Password State
  const [emailConfig, setEmailConfig] = useState(getEmailConfig());
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState(null);
  const [showAppPass, setShowAppPass] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);
  const [testRecipientEmail, setTestRecipientEmail] = useState('');

  const handleEdit = (wh) => {
    setEditingWarehouse(wh);
    setIsWarehouseModalOpen(true);
  };

  const handleAdd = () => {
    setEditingWarehouse(null);
    setIsWarehouseModalOpen(true);
  };

  const handleResetConfirm = () => {
    resetToMockData();
    toast.success('Data Reset', 'All inventory data restored to default mock state.');
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setConnTestResult(null);
    const res = await testSupabaseConnection(supabaseConfig.url, supabaseConfig.anonKey);
    setIsTestingConn(false);
    setConnTestResult(res);

    if (res.success) {
      toast.success('Connection Successful', res.message);
    } else {
      toast.error('Connection Failed', res.message);
    }
  };

  const handleSaveSupabase = (e) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseConfig);
    resetSupabaseClient();
    toast.success(
      'Settings Saved',
      supabaseConfig.isEnabled ? 'Supabase PostgreSQL sync enabled!' : 'Using Local Storage Mode.'
    );
  };

  const handleSaveEmailConfig = (e) => {
    e.preventDefault();
    saveEmailConfig(emailConfig);
    toast.success(
      'Email Config Saved',
      emailConfig.senderEmail ? `Email dispatch configured for ${emailConfig.senderEmail}` : 'Email config updated.'
    );
  };

  const handleTestEmail = async () => {
    setIsTestingEmail(true);
    setEmailTestResult(null);

    const recipient = testRecipientEmail.trim() || emailConfig.senderEmail || user?.email;
    const res = await testSmtpConnection({
      senderEmail: emailConfig.senderEmail,
      appPassword: emailConfig.appPassword,
      testRecipient: recipient
    });

    setIsTestingEmail(false);
    setEmailTestResult(res);

    if (res.success) {
      toast.success('Test Email Sent', res.message);
    } else {
      toast.error('SMTP Connection Failed', res.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl pb-12">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Settings & Infrastructure
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure storage facilities, live Supabase PostgreSQL connection, and database preferences
        </p>
      </div>

      {/* 1. Warehouse Facility Management */}
      <Card noPadding>
        <div className="p-6 border-b border-slate-100 dark:border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sage-50 dark:bg-sage-500/10 text-sage-600 rounded-2xl border border-sage-100 dark:border-sage-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Warehouse Facilities ({warehouses.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Storage buildings, fulfillment hubs, and physical shelving rack locations
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleAdd}
            className="sage-glow self-start sm:self-auto"
          >
            Add Warehouse
          </Button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {warehouses.map((wh) => (
            <div
              key={wh.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] bg-white dark:bg-[#121212] hover:border-sage-200 hover:shadow-card-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300">
                    {wh.code}
                  </span>
                  {wh.isPrimary && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Primary Hub
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{wh.name}</h4>

                {wh.address && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mt-1.5 leading-relaxed">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                    <span>{wh.address}</span>
                  </p>
                )}

                {/* Locations list */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2a2a2a]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                    Storage Zones & Racks:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(wh.locations || []).map((loc, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-[#1a1a1a] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-[#2a2a2a]"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-[#2a2a2a] flex items-center justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={Edit2}
                  onClick={() => handleEdit(wh)}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs"
                >
                  Edit Facility
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Supabase PostgreSQL Integration & Dual-Mode Connector */}
      <Card>
        <CardHeader
          title="Supabase PostgreSQL Integration"
          subtitle="Connect to your live Supabase cloud database or continue using offline LocalStorage"
          icon={Database}
          action={
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                supabaseConfig.isEnabled
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {supabaseConfig.isEnabled ? '● Supabase Mode Active' : '○ LocalStorage Mode'}
              </span>
            </div>
          }
        />

        <form onSubmit={handleSaveSupabase} className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-800 dark:text-slate-200 text-sm">
                <input
                  type="checkbox"
                  checked={supabaseConfig.isEnabled}
                  onChange={(e) => setSupabaseConfig(prev => ({ ...prev, isEnabled: e.target.checked }))}
                  className="w-4 h-4 text-sage-600 rounded border-slate-300 focus:ring-sage-500 cursor-pointer"
                />
                <span>Enable Live Supabase PostgreSQL Sync</span>
              </label>

              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                SQL schema available in <code className="font-mono bg-slate-200/70 dark:bg-[#2a2a2a] px-1 py-0.5 rounded">supabase_schema.sql</code>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <Input
                  label="Supabase Project URL"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseConfig.url}
                  onChange={(e) => setSupabaseConfig(prev => ({ ...prev, url: e.target.value.trim() }))}
                  disabled={!supabaseConfig.isEnabled}
                />
              </div>
              <div>
                <Input
                  label="Supabase Anon / Public Key"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  type="password"
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseConfig(prev => ({ ...prev, anonKey: e.target.value.trim() }))}
                  disabled={!supabaseConfig.isEnabled}
                />
              </div>
            </div>

            {/* Test Connection Button & Status */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={Link2}
                loading={isTestingConn}
                disabled={!supabaseConfig.isEnabled || !supabaseConfig.url || !supabaseConfig.anonKey}
                onClick={handleTestConnection}
                className="text-xs"
              >
                Test Database Connection
              </Button>

              {connTestResult && (
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                  connTestResult.success ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {connTestResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {connTestResult.message}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-slate-500 dark:text-slate-400">
              When disabled, StockSense operates seamlessly in ultra-fast local sandbox mode.
            </p>
            <Button type="submit" variant="primary" size="sm">
              Save Database Preferences
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Email Dispatch & Gmail App Password Configuration */}
      <Card>
        <CardHeader
          title="Email Service Configuration (Gmail App Password)"
          subtitle="Configure Gmail SMTP and App Password to deliver real 6-digit OTP emails to users"
          icon={Mail}
          action={
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                emailConfig.senderEmail && emailConfig.appPassword
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {emailConfig.senderEmail && emailConfig.appPassword ? '● Live Email Active' : '○ Simulated Mode'}
              </span>
            </div>
          }
        />

        <form onSubmit={handleSaveEmailConfig} className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div>
                <p className="font-bold text-slate-800 text-sm">Gmail SMTP Dispatcher</p>
                <p className="text-[11px] text-slate-500">
                  Sends automated password reset OTP emails using Google's secure 16-character App Password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSetupGuide(!showSetupGuide)}
                className="text-xs font-bold text-coral-600 hover:text-coral-700 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showSetupGuide ? 'Hide Setup Guide' : 'How to get App Password?'}</span>
              </button>
            </div>

            {/* Expandable Google App Password Step-by-Step Guide */}
            {showSetupGuide && (
              <div className="p-3.5 bg-coral-50/70 border border-coral-200/70 rounded-xl space-y-2 text-slate-700 animate-fade-in">
                <p className="font-bold text-coral-900 text-xs flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-coral-600" />
                  <span>How to generate a free Gmail 16-character App Password (30 seconds):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 pl-1 leading-relaxed">
                  <li>Visit your Google Account at <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="font-bold text-coral-600 underline">myaccount.google.com/security</a>.</li>
                  <li>Enable <strong>2-Step Verification</strong> (if not already turned on).</li>
                  <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="font-bold text-coral-600 underline">myaccount.google.com/apppasswords</a>.</li>
                  <li>Enter app name (e.g. <code>StockSense</code>) and click <strong>Create</strong>.</li>
                  <li>Copy the generated <strong>16-character code</strong> (e.g. <code>abcd efgh ijkl mnop</code>) and paste it below!</li>
                </ol>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Sender Gmail Address"
                  type="email"
                  placeholder="your-account@gmail.com"
                  icon={Mail}
                  value={emailConfig.senderEmail}
                  onChange={(e) => setEmailConfig(prev => ({ ...prev, senderEmail: e.target.value.trim() }))}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    16-Character Google App Password
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showAppPass ? 'text' : 'password'}
                    placeholder="xxxx xxxx xxxx xxxx"
                    icon={Lock}
                    value={emailConfig.appPassword}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, appPassword: e.target.value.trim() }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAppPass(!showAppPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showAppPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Test Email Delivery Row */}
            <div className="pt-2 border-t border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 max-w-sm w-full">
                <input
                  type="email"
                  placeholder={`Send test to: ${emailConfig.senderEmail || user?.email || 'email@domain.com'}`}
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white w-full focus:outline-none focus:ring-1 focus:ring-coral-500"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Send}
                  loading={isTestingEmail}
                  disabled={!emailConfig.senderEmail || !emailConfig.appPassword}
                  onClick={handleTestEmail}
                  className="flex-shrink-0 text-xs"
                >
                  Test Delivery
                </Button>
              </div>

              {emailTestResult && (
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                  emailTestResult.success ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {emailTestResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="truncate max-w-xs">{emailTestResult.message}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-slate-500">
              Credentials can also be stored in <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">.env</code> as <code>VITE_GMAIL_USER</code> and <code>VITE_GMAIL_APP_PASSWORD</code>.
            </p>
            <Button type="submit" variant="primary" size="sm">
              Save Email Credentials
            </Button>
          </div>
        </form>
      </Card>

      {/* 4. Account Security & OTP Password Reset */}
      <Card>
        <CardHeader
          title="Account Security & Password Management"
          subtitle="Reset or update your account password using secure 6-digit OTP verification"
          icon={KeyRound}
          action={
            <Button
              variant="primary"
              size="sm"
              icon={KeyRound}
              onClick={() => setIsOtpResetOpen(true)}
              className="coral-glow text-xs font-bold"
            >
              Reset Password via OTP
            </Button>
          }
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm border flex-shrink-0 ${
              user?.avatarBg || 'bg-slate-100 text-slate-700'
            }`}>
              {user?.avatar || 'US'}
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{user?.name || 'StockSense User'}</p>
              <p className="text-slate-500 font-mono text-xs">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">Active Profile:</span>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-800">
              {user?.badge || user?.role || 'Staff'}
            </span>
          </div>
        </div>
      </Card>

      {/* 4. Database Sandbox & Reset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Local Data Sandbox Status"
            subtitle="Client-side storage statistics and record counts"
            icon={HardDrive}
          />
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-100 dark:border-[#2a2a2a] font-medium text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Catalog Items:</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">{products.length} Products</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Audit Records:</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">{moveHistory.length} Moves</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Inbound Receipts:</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">{receipts.length} Receipts</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-bold">Outbound Deliveries:</span>
                <span className="text-slate-900 dark:text-white font-bold text-sm">{deliveries.length} Deliveries</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                icon={RotateCcw}
                onClick={() => setIsResetConfirmOpen(true)}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Reset Database to Demo Seed
              </Button>
            </div>
          </div>
        </Card>

        {/* PostgreSQL Schema Overview */}
        <Card>
          <CardHeader
            title="PostgreSQL Table Relational Schema"
            subtitle="Engineered for production scale multi-tenant IMS"
            icon={FileCode}
          />
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <div className="p-3 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200/80 dark:border-[#2a2a2a] font-mono text-[11px] space-y-1">
              <div className="text-slate-800 dark:text-slate-200 font-bold">📦 Tables mapped in supabase_schema.sql:</div>
              <p className="text-slate-600 dark:text-slate-400">• <span className="text-sage-600 dark:text-sage-400 font-semibold">products</span> (id, name, sku, category, unit, unit_price, reorder_level)</p>
              <p className="text-slate-600 dark:text-slate-400">• <span className="text-indigo-600 dark:text-indigo-400 font-semibold">warehouses</span> (id, name, code, address, locations)</p>
              <p className="text-slate-600 dark:text-slate-400">• <span className="text-emerald-600 dark:text-emerald-400 font-semibold">receipts & deliveries</span> (inbound / outbound workflow)</p>
              <p className="text-slate-600 dark:text-slate-400">• <span className="text-purple-600 dark:text-purple-400 font-semibold">move_history</span> (immutable transaction ledger)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Warehouse Modal */}
      <WarehouseModal
        isOpen={isWarehouseModalOpen}
        onClose={() => setIsWarehouseModalOpen(false)}
        warehouse={editingWarehouse}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset Demo Data"
        message="This will reset all products, receipts, deliveries, and move history back to initial factory demo seed. Any custom edits will be discarded."
        confirmText="Reset to Seed Data"
        variant="danger"
      />

      {/* OTP Password Reset Modal */}
      <OTPPasswordResetModal
        isOpen={isOtpResetOpen}
        onClose={() => setIsOtpResetOpen(false)}
        targetEmail={user?.email}
        targetUser={user}
      />
    </div>
  );
};
