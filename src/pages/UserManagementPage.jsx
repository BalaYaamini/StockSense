import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Search,
  Filter,
  ShieldCheck,
  PackageCheck,
  Crown,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Upload,
  Mail,
  Building2,
  Lock,
  Sparkles,
  KeyRound
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { OTPPasswordResetModal } from '../components/auth/OTPPasswordResetModal';
import { useAuth, ROLES } from '../hooks/useAuth';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../hooks/useToast';
import { formatDate } from '../utils/formatters';

export const UserManagementPage = () => {
  const {
    registeredUsers,
    importManagers,
    addManager,
    deleteUser,
    updateUserRole,
    user: currentUser
  } = useAuth();
  const { warehouses } = useInventory();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals state
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [otpResetUser, setOtpResetUser] = useState(null);

  // Single Add Manager Form
  const [newManagerData, setNewManagerData] = useState({
    name: '',
    email: '',
    roleTitle: 'Inventory Manager',
    assignedWarehouse: warehouses[0]?.name || 'All Warehouses',
    password: 'password123'
  });

  // CSV Bulk Import Text
  const [csvText, setCsvText] = useState(
`Name,Email,RoleTitle,AssignedWarehouse,Password
Robert Taylor,robert.t@stocksense.io,Senior Inventory Manager,Main Central Warehouse,password123
Elena Rostova,elena.r@stocksense.io,Regional Supply Lead,North Regional Hub,password123
Liam O'Connor,liam.o@stocksense.io,Logistics Manager,East Coast Distribution,password123`
  );

  // Filtered directory
  const filteredUsers = useMemo(() => {
    return registeredUsers.filter((u) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.roleTitle && u.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;

      return matchSearch && matchRole;
    });
  }, [registeredUsers, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    return {
      total: registeredUsers.length,
      admins: registeredUsers.filter(u => u.role === 'ADMIN').length,
      managers: registeredUsers.filter(u => u.role === 'MANAGER').length,
      staff: registeredUsers.filter(u => u.role === 'STAFF').length,
      googleUsers: registeredUsers.filter(u => u.authProvider === 'google').length
    };
  }, [registeredUsers]);

  // Handle Add Single Manager
  const handleAddManagerSubmit = (e) => {
    e.preventDefault();
    if (!newManagerData.name.trim() || !newManagerData.email.trim()) {
      toast.error('Missing Information', 'Please provide a name and email.');
      return;
    }

    const res = addManager(newManagerData);
    if (res.success) {
      toast.success(
        'Manager Provisioned',
        `Authorized ${newManagerData.name} (${newManagerData.email}) with Manager credentials.`
      );
      setIsAddManagerOpen(false);
      setNewManagerData({
        name: '',
        email: '',
        roleTitle: 'Inventory Manager',
        assignedWarehouse: warehouses[0]?.name || 'All Warehouses',
        password: 'password123'
      });
    } else {
      toast.warning('Import Notice', 'User already exists.');
    }
  };

  // Handle Bulk CSV Import
  const handleCsvImportSubmit = (e) => {
    e.preventDefault();
    try {
      const lines = csvText.split('\n').filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.warning('Empty CSV', 'Please enter at least one manager row under the header.');
        return;
      }

      const rows = lines.slice(1);
      const parsedManagers = rows.map((row) => {
        const parts = row.split(',').map(p => p.trim());
        return {
          name: parts[0] || 'Manager',
          email: parts[1] || '',
          roleTitle: parts[2] || 'Inventory Manager',
          assignedWarehouse: parts[3] || 'All Warehouses',
          password: parts[4] || 'password123'
        };
      }).filter(m => m.email.length > 0);

      const res = importManagers(parsedManagers);
      if (res.importedCount > 0) {
        toast.success(
          'Bulk Import Complete',
          `Successfully imported ${res.importedCount} new Managers. (${res.skippedCount} skipped as duplicates).`
        );
        setIsCsvImportOpen(false);
      } else {
        toast.info('No New Managers', 'All specified accounts already exist in directory.');
      }
    } catch (err) {
      toast.error('CSV Parse Error', err.message);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    const res = deleteUser(deleteTargetId);
    if (res.success) {
      toast.success('User Deleted', res.message);
    } else {
      toast.error('Action Blocked', res.message);
    }
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              User & Manager Directory
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Admin Governance
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Authorize and bulk-import Managers, manage Staff users, and monitor Google OAuth logins
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={() => setIsCsvImportOpen(true)}
            className="text-slate-700 bg-white hover:bg-slate-50 border-slate-200 text-xs font-semibold"
          >
            Bulk Import Managers (CSV)
          </Button>

          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsAddManagerOpen(true)}
            className="coral-glow text-xs font-bold"
          >
            + Add Manager
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{stats.total}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Active profiles</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#121212] rounded-2xl border border-coral-200/80 dark:border-[#2a2a2a] shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-coral-600">Managers</p>
          <p className="text-2xl font-extrabold text-coral-600 mt-1">{stats.managers}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Admin-provisioned</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#121212] rounded-2xl border border-indigo-200/80 dark:border-[#2a2a2a] shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Floor Staff</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.staff}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Workstation operators</span>
        </div>

        <div className="p-4 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Google OAuth</p>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-1">{stats.googleUsers}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Defaulted to Staff</span>
        </div>
      </div>

      {/* Directory Filter Bar */}
      <div className="p-4 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by user name, email, or title..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-44"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">👑 Administrators</option>
            <option value="MANAGER">👔 Managers</option>
            <option value="STAFF">👷 Warehouse Staff</option>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#121212] rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-[#181818] border-b border-slate-200 dark:border-[#2a2a2a] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3.5">User Profile</th>
                <th className="px-5 py-3.5">Organizational Role</th>
                <th className="px-5 py-3.5">Authentication Provider</th>
                <th className="px-5 py-3.5">Assigned Facility</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#2a2a2a] text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a] transition-colors">
                  {/* User Profile */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs flex-shrink-0 border ${
                        u.avatarBg || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}>
                        {u.avatar || 'US'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-snug">{u.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                      u.role === 'ADMIN'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                        : u.role === 'MANAGER'
                        ? 'bg-coral-50 text-coral-700 border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-900'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900'
                    }`}>
                      {u.badge || (u.role === 'ADMIN' ? '👑 Admin' : u.role === 'MANAGER' ? '👔 Manager' : '👷 Staff')}
                    </span>
                    {u.roleTitle && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{u.roleTitle}</p>
                    )}
                  </td>

                  {/* Auth Provider */}
                  <td className="px-5 py-3.5">
                    {u.authProvider === 'google' ? (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1a1a1a] px-2 py-0.5 rounded-md border border-slate-200 dark:border-[#2a2a2a]">
                        <svg className="w-3 h-3" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        Google Account
                      </span>
                    ) : u.authProvider === 'admin_import' ? (
                      <span className="inline-flex items-center gap-1 text-coral-700 dark:text-coral-400 bg-coral-50/50 dark:bg-coral-950/40 px-2 py-0.5 rounded-md border border-coral-200/50 dark:border-coral-800">
                        Admin Imported
                      </span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">Email & Password</span>
                    )}
                  </td>

                  {/* Facility */}
                  <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                    {u.assignedWarehouse || 'All Facilities'}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setOtpResetUser(u)}
                        title={`Reset Password via OTP for ${u.name}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-coral-600 hover:bg-coral-50 dark:hover:bg-coral-950/30 transition-colors cursor-pointer"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      {u.id !== currentUser?.id ? (
                        <button
                          onClick={() => setDeleteTargetId(u.id)}
                          title="Revoke / Delete User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Active Session</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Modal: Add Single Manager */}
      <Modal
        isOpen={isAddManagerOpen}
        onClose={() => setIsAddManagerOpen(false)}
        title="Provision New Manager"
        subtitle="Authorize an inventory manager with elevated supply chain permissions"
        icon={UserPlus}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleAddManagerSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Manager Full Name"
                placeholder="e.g. Jonathan Vance"
                value={newManagerData.name}
                onChange={(e) => setNewManagerData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Input
                label="Manager Work Email"
                type="email"
                placeholder="jonathan.v@stocksense.io"
                value={newManagerData.email}
                onChange={(e) => setNewManagerData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Role Title"
                placeholder="e.g. Regional Inventory Manager"
                value={newManagerData.roleTitle}
                onChange={(e) => setNewManagerData(prev => ({ ...prev, roleTitle: e.target.value }))}
                required
              />
            </div>
            <div>
              <Select
                label="Assigned Facility"
                value={newManagerData.assignedWarehouse}
                onChange={(e) => setNewManagerData(prev => ({ ...prev, assignedWarehouse: e.target.value }))}
              >
                <option value="All Warehouses">All Warehouses (Consolidated)</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.name}>{w.name}</option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Input
              label="Temporary Password"
              placeholder="password123"
              value={newManagerData.password}
              onChange={(e) => setNewManagerData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsAddManagerOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="coral-glow">
              Authorize & Create Manager
            </Button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: Bulk CSV Import */}
      <Modal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        title="Bulk Import Managers (CSV)"
        subtitle="Paste or upload multiple manager accounts to provision them simultaneously"
        icon={FileSpreadsheet}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCsvImportSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
            <span className="font-bold text-slate-800 block mb-1">CSV Header Template:</span>
            <code className="font-mono text-[11px] text-coral-700 bg-coral-50/60 px-2 py-1 rounded block select-all border border-coral-200/50">
              Name, Email, RoleTitle, AssignedWarehouse, Password
            </code>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                CSV Data (Paste Rows):
              </label>
              <button
                type="button"
                onClick={() => setCsvText(
`Name,Email,RoleTitle,AssignedWarehouse,Password
Robert Taylor,robert.t@stocksense.io,Senior Inventory Manager,Main Central Warehouse,password123
Elena Rostova,elena.r@stocksense.io,Regional Supply Lead,North Regional Hub,password123
Liam O'Connor,liam.o@stocksense.io,Logistics Manager,East Coast Distribution,password123`
                )}
                className="text-[11px] font-bold text-coral-600 hover:text-coral-700"
              >
                Reset Sample Data
              </button>
            </div>
            <textarea
              rows={5}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full font-mono text-xs p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-coral-500 shadow-xs resize-y"
              placeholder="Name,Email,RoleTitle,AssignedWarehouse,Password..."
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsCsvImportOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Upload} className="coral-glow font-bold text-xs sm:text-sm">
              Execute Bulk Manager Import
            </Button>
          </div>
        </form>
      </Modal>

      {/* 3. Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Revoke User Access"
        message="Are you sure you want to remove this user from the system directory? They will no longer be able to log in."
        confirmText="Revoke User"
        variant="danger"
      />

      {/* 4. OTP Password Reset Modal */}
      <OTPPasswordResetModal
        isOpen={!!otpResetUser}
        onClose={() => setOtpResetUser(null)}
        targetEmail={otpResetUser?.email}
        targetUser={otpResetUser}
      />
    </div>
  );
};
