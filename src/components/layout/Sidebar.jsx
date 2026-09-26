import React from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  History,
  Settings,
  Warehouse,
  Boxes,
  Sparkles,
  User,
  ShieldCheck,
  ChevronDown,
  PackageCheck,
  ScanLine,
  UserCheck,
  Users,
  LogOut,
  Crown
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({
  activePage,
  setActivePage,
  isMobileOpen,
  setIsMobileOpen,
  onOpenScanner
}) => {
  const { summary, warehouses, activeWarehouseId, setActiveWarehouseId } = useInventory();
  const { user, isAdmin, isManager, isStaff, logout, loginAsDemoUser, allRoles } = useAuth();

  const totalPendingOperations = summary.receiptsStats.pending + summary.deliveriesStats.pending;

  // 1. ADMIN Navigation (Full Governance + Manager Provisioning)
  const ADMIN_NAV = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'user-management',
      label: 'User & Manager Hub',
      icon: Users,
      badge: { text: 'Admin', color: 'bg-rose-100 text-rose-800' }
    },
    {
      id: 'stock',
      label: 'Products / Stock',
      icon: Package,
      badge: summary.lowStockCount > 0 ? { text: `${summary.lowStockCount} Low`, color: 'bg-amber-100 text-amber-800' } : null
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: Layers,
      badge: totalPendingOperations > 0 ? { text: totalPendingOperations, color: 'bg-coral-500 text-white' } : null
    },
    {
      id: 'staff-workstation',
      label: 'Staff Floor View',
      icon: PackageCheck,
      badge: { text: 'Floor', color: 'bg-indigo-100 text-indigo-800' }
    },
    {
      id: 'move-history',
      label: 'Move History',
      icon: History,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings & Cloud',
      icon: Settings,
      badge: null
    }
  ];

  // 2. MANAGER Navigation
  const MANAGER_NAV = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'stock',
      label: 'Products / Stock',
      icon: Package,
      badge: summary.lowStockCount > 0 ? { text: `${summary.lowStockCount} Low`, color: 'bg-amber-100 text-amber-800' } : null
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: Layers,
      badge: totalPendingOperations > 0 ? { text: totalPendingOperations, color: 'bg-sage-500 text-white' } : null
    },
    {
      id: 'staff-workstation',
      label: 'Staff Floor View',
      icon: PackageCheck,
      badge: { text: 'Floor', color: 'bg-indigo-100 text-indigo-800' }
    },
    {
      id: 'move-history',
      label: 'Move History',
      icon: History,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings & Cloud',
      icon: Settings,
      badge: null
    }
  ];

  // 3. STAFF Navigation (Google users & Floor staff)
  const STAFF_NAV = [
    {
      id: 'staff-workstation',
      label: 'Staff Workstation',
      icon: PackageCheck,
      badge: totalPendingOperations > 0 ? { text: totalPendingOperations, color: 'bg-indigo-600 text-white' } : null
    },
    {
      id: 'stock',
      label: 'Catalog & Locations',
      icon: Package,
      badge: null
    },
    {
      id: 'move-history',
      label: 'Move History',
      icon: History,
      badge: null
    }
  ];

  const navItems = isAdmin ? ADMIN_NAV : isManager ? MANAGER_NAV : STAFF_NAV;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-[#121212] border-r border-slate-200/80 dark:border-[#2a2a2a] flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sage-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-sage-500/20">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                    Stock<span className="text-sage-500">Sense</span>
                  </span>
<<<<<<< HEAD
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-coral-50 text-coral-600 rounded border border-coral-200/50 uppercase tracking-widest">
                    v2.5
=======
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-sage-50 text-sage-600 rounded border border-sage-200/50 uppercase tracking-widest">
                    v2.0
>>>>>>> origin/main
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Modular Inventory System
                </p>
              </div>
            </div>
          </div>

          {/* Warehouse Facility Scope Selector */}
          <div className="px-4 py-3 border-b border-slate-100 dark:border-[#2a2a2a] bg-slate-50/50 dark:bg-[#1a1a1a]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Facility Scope
            </label>
            <div className="relative">
              <select
                value={activeWarehouseId}
                onChange={(e) => setActiveWarehouseId(e.target.value)}
                className="w-full text-xs font-semibold bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-xl px-2.5 py-2 pr-7 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-500 cursor-pointer shadow-xs appearance-none"
              >
                <option value="ALL">🏢 All Facilities (Consolidated)</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    📍 {wh.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isAdmin ? 'Admin Portal' : isManager ? 'Manager Menu' : 'Staff Workstation'}
              </span>
<<<<<<< HEAD
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isAdmin
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isManager
                  ? 'bg-coral-50 text-coral-600 border-coral-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
=======
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                isManager ? 'bg-sage-50 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400'
>>>>>>> origin/main
              }`}>
                {user?.badge || (isAdmin ? '👑 Admin' : isManager ? '👔 Manager' : '👷 Staff')}
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    if (setIsMobileOpen) setIsMobileOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group select-none ${
                    isActive
<<<<<<< HEAD
                      ? isAdmin && item.id === 'user-management'
                        ? 'bg-rose-50 text-rose-700 shadow-xs font-bold'
                        : isStaff
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'bg-coral-50 text-coral-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
=======
                      ? isStaff
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 shadow-xs'
                        : 'bg-sage-50 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a1a]'
>>>>>>> origin/main
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
<<<<<<< HEAD
                          ? isAdmin && item.id === 'user-management'
                            ? 'text-rose-600'
                            : isStaff ? 'text-indigo-600' : 'text-coral-600'
                          : 'text-slate-400 group-hover:text-slate-600'
=======
                          ? isStaff ? 'text-indigo-600' : 'text-sage-600'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white'
>>>>>>> origin/main
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${item.badge.color}`}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Scanner Action in Sidebar */}
            <button
              onClick={() => {
                if (setIsMobileOpen) setIsMobileOpen(false);
                onOpenScanner();
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-all select-none"
            >
              <ScanLine className="w-4 h-4 text-slate-400" />
              <span>Camera Barcode Scan</span>
            </button>
          </div>

          {/* Phase 2 Auth Status Banner */}
          <div className="mt-auto p-3.5 mx-3 mb-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold mb-1 text-sage-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Google & Supabase Auth</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Admin Governance & Staff Google OAuth active.
            </p>
          </div>
        </div>

<<<<<<< HEAD
        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
=======
        {/* User Profile & Role Switcher */}
        <div className="p-4 border-t border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between bg-slate-50/60 dark:bg-[#1a1a1a]">
>>>>>>> followup-changes
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs flex-shrink-0 border ${
              user?.avatarBg || 'bg-rose-100 text-rose-700 border-rose-200'
            }`}>
              {user?.avatar || (isAdmin ? 'SV' : isManager ? 'AM' : 'DM')}
            </div>
            <div className="min-w-0">
<<<<<<< HEAD
              <p className="text-xs font-bold text-slate-900 truncate">
<<<<<<< HEAD
                {user?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                {isAdmin ? <Crown className="w-3 h-3 text-amber-500" /> : <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                {user?.roleTitle || (isAdmin ? 'System Administrator' : isManager ? 'Inventory Manager' : 'Warehouse Staff')}
=======
                {user?.name || (isManager ? 'Alex Morgan' : 'Dave Miller')}
=======
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {roleInfo.name}
>>>>>>> followup-changes
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {user?.roleTitle || (isManager ? 'Inventory Manager' : 'Warehouse Staff')}
>>>>>>> origin/main
              </p>
            </div>
          </div>

          <button
<<<<<<< HEAD
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
=======
            onClick={() => switchRole(isManager ? 'STAFF' : 'MANAGER')}
            title="Switch User Role"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#2a2a2a] transition-colors"
>>>>>>> followup-changes
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
