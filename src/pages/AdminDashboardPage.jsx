import React, { useState, useMemo } from 'react';
import {
  Crown,
  Users,
  UserPlus,
  FileSpreadsheet,
  Building2,
  Package,
  Layers,
  ShieldCheck,
  PackageCheck,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  Database,
  ExternalLink,
  Lock,
  Mail,
  HardDrive
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { useAuth, ROLES } from '../hooks/useAuth';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../hooks/useToast';
import { formatCurrency, formatNumber, formatDate } from '../utils/formatters';

export const AdminDashboardPage = ({ onNavigate }) => {
  const {
    registeredUsers,
    importManagers,
    addManager,
    deleteUser,
    updateUserRole,
    user: currentUser
  } = useAuth();
  const { warehouses, products, summary, isSupabaseConnected } = useInventory();
  const toast = useToast();

  // Active sub-tab in Admin user table: 'ALL', 'MANAGER', 'STAFF', 'GOOGLE'
  const [activeUserTab, setActiveUserTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

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

  // User list stats
  const userStats = useMemo(() => {
    return {
      total: registeredUsers.length,
      admins: registeredUsers.filter(u => u.role === 'ADMIN').length,
      managers: registeredUsers.filter(u => u.role === 'MANAGER').length,
      staff: registeredUsers.filter(u => u.role === 'STAFF').length,
      googleUsers: registeredUsers.filter(u => u.authProvider === 'google').length
    };
  }, [registeredUsers]);

  // Filtered Users Table
  const filteredUsers = useMemo(() => {
    return registeredUsers.filter((u) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.roleTitle && u.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchTab = true;
      if (activeUserTab === 'MANAGER') matchTab = u.role === 'MANAGER';
      else if (activeUserTab === 'STAFF') matchTab = u.role === 'STAFF';
      else if (activeUserTab === 'GOOGLE') matchTab = u.authProvider === 'google';

      return matchSearch && matchTab;
    });
  }, [registeredUsers, searchQuery, activeUserTab]);

  // Submit Single Manager Add
  const handleAddManagerSubmit = (e) => {
    e.preventDefault();
    if (!newManagerData.name.trim() || !newManagerData.email.trim()) {
      toast.error('Missing Information', 'Please provide a manager name and email.');
      return;
    }

    const res = addManager(newManagerData);
    if (res.success) {
      toast.success(
        'Manager Authorized',
        `Provisioned ${newManagerData.name} (${newManagerData.email}) with Manager credentials.`
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
      toast.warning('Import Notice', 'This email already exists in directory.');
    }
  };

  // Submit Bulk CSV Import
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
      toast.success('User Access Revoked', res.message);
    } else {
      toast.error('Action Blocked', res.message);
    }
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* 1. Admin Header & Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-rose-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-inner flex-shrink-0">
            <Crown className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                Administrator Control Center
              </span>
              <span className="text-xs text-slate-400">• High Privilege Session</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-1">
              Admin Governance & User Portal
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Provision Inventory Managers, supervise all registered warehouse staff, manage multi-facility storage locations, and monitor system security.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <Button
            variant="secondary"
            icon={FileSpreadsheet}
            onClick={() => setIsCsvImportOpen(true)}
            className="flex-1 md:flex-initial bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs font-bold"
          >
            Bulk Import Managers (CSV)
          </Button>

          <Button
            variant="primary"
            icon={UserPlus}
            onClick={() => setIsAddManagerOpen(true)}
            className="flex-1 md:flex-initial bg-rose-600 hover:bg-rose-700 text-white border-transparent shadow-lg shadow-rose-600/30 font-bold text-xs"
          >
            + Add Manager
          </Button>
        </div>
      </div>

      {/* 2. Admin High-Level System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Users */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{userStats.total}</p>
            <p className="text-[11px] text-slate-500 mt-1">Across all roles</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Authorized Managers */}
        <div className="p-5 bg-white rounded-2xl border border-coral-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-coral-600">Inventory Managers</p>
            <p className="text-3xl font-black text-coral-600 mt-1">{userStats.managers}</p>
            <p className="text-[11px] text-slate-500 mt-1">Admin-provisioned</p>
          </div>
          <div className="p-3 bg-coral-50 text-coral-600 rounded-2xl border border-coral-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Warehouse Staff */}
        <div className="p-5 bg-white rounded-2xl border border-indigo-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Warehouse Staff</p>
            <p className="text-3xl font-black text-indigo-600 mt-1">{userStats.staff}</p>
            <p className="text-[11px] text-slate-500 mt-1">{userStats.googleUsers} from Google OAuth</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: System Inventory & Cloud */}
        <div className="p-5 bg-white rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Facilities & SKUs</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {warehouses.length} <span className="text-xs font-normal text-slate-500">Hubs /</span> {products.length} <span className="text-xs font-normal text-slate-500">SKUs</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {formatCurrency(summary.totalValue)} Valuation
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
            <Building2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Primary Section: User & Manager Directory */}
      <Card noPadding className="border-slate-200">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-rose-600" />
              <span>User & Manager Governance Directory</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorize, import, review, and manage credentials for all organization personnel
            </p>
          </div>

          {/* Sub Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/60 overflow-x-auto">
            <button
              onClick={() => setActiveUserTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeUserTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Users ({userStats.total})
            </button>

            <button
              onClick={() => setActiveUserTab('MANAGER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeUserTab === 'MANAGER'
                  ? 'bg-white text-coral-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Managers ({userStats.managers})
            </button>

            <button
              onClick={() => setActiveUserTab('STAFF')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeUserTab === 'STAFF'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff ({userStats.staff})
            </button>

            <button
              onClick={() => setActiveUserTab('GOOGLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeUserTab === 'GOOGLE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Google OAuth ({userStats.googleUsers})
            </button>
          </div>
        </div>

        {/* Search Filter Bar */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="w-full sm:w-96">
            <Input
              placeholder="Search users by name, email, or role title..."
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <span className="text-xs text-slate-500 font-medium hidden sm:block">
            Showing {filteredUsers.length} of {registeredUsers.length} profiles
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3.5">User Identity</th>
                <th className="px-5 py-3.5">Role Permission</th>
                <th className="px-5 py-3.5">Auth Method</th>
                <th className="px-5 py-3.5">Assigned Facility</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No matching users found in directory.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User Identity */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs flex-shrink-0 border ${
                          u.avatarBg || 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.avatar || 'US'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{u.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Permission */}
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] border ${
                        u.role === 'ADMIN'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : u.role === 'MANAGER'
                          ? 'bg-coral-50 text-coral-700 border-coral-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {u.badge || (u.role === 'ADMIN' ? '👑 Admin' : u.role === 'MANAGER' ? '👔 Manager' : '👷 Staff')}
                      </span>
                      {u.roleTitle && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{u.roleTitle}</p>
                      )}
                    </td>

                    {/* Auth Method */}
                    <td className="px-5 py-3.5">
                      {u.authProvider === 'google' ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                          </svg>
                          <span>Google Sign-In (Staff)</span>
                        </span>
                      ) : u.authProvider === 'admin_import' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-coral-700 bg-coral-50 px-2 py-0.5 rounded-md border border-coral-200">
                          Admin CSV Import
                        </span>
                      ) : (
                        <span className="text-slate-600">Email & Password</span>
                      )}
                    </td>

                    {/* Facility */}
                    <td className="px-5 py-3.5 text-slate-600">
                      {u.assignedWarehouse || 'All Facilities'}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      {u.id !== currentUser?.id ? (
                        <button
                          onClick={() => setDeleteTargetId(u.id)}
                          title="Revoke / Delete User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold italic bg-slate-100 px-2 py-0.5 rounded">
                          Current Admin
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. Quick Admin Jump Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Jump 1: Catalog */}
        <Card
          hoverEffect
          className="cursor-pointer border-slate-200"
          onClick={() => onNavigate('stock')}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-coral-50 text-coral-600 rounded-2xl border border-coral-100">
              <Package className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Products & Valuation</h4>
          <p className="text-xs text-slate-500 mt-1">
            Review {products.length} catalog items, safety stock thresholds, and total valuation.
          </p>
        </Card>

        {/* Jump 2: Facilities */}
        <Card
          hoverEffect
          className="cursor-pointer border-slate-200"
          onClick={() => onNavigate('settings')}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <Building2 className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Storage Facilities & Clouds</h4>
          <p className="text-xs text-slate-500 mt-1">
            Manage {warehouses.length} physical warehouse buildings and Supabase sync.
          </p>
        </Card>

        {/* Jump 3: Audit Ledger */}
        <Card
          hoverEffect
          className="cursor-pointer border-slate-200"
          onClick={() => onNavigate('move-history')}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <Layers className="w-6 h-6" />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Immutable Move Ledger</h4>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction audit trail with CSV download for compliance.
          </p>
        </Card>
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
    </div>
  );
};
