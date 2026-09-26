import React from 'react';
import {
  Menu,
  RotateCcw,
  UserCheck,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

export const Header = ({
  activePage,
  onOpenMobileMenu
}) => {
  const { resetToMockData } = useInventory();
  const { user, isAdmin, isManager, isStaff, logout, loginAsDemoUser } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const toast = useToast();

  const PAGE_TITLES = {
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: 'Real-time inventory metrics, pending operations, and stock health'
    },
    'user-management': {
      title: 'User & Manager Governance Hub',
      subtitle: 'Provision, bulk-import, and authorize Inventory Managers and view Staff directory'
    },
    stock: {
      title: 'Stock & Products Catalog',
      subtitle: 'Manage items, track SKU quantities across facilities, and configure reorder levels'
    },
    operations: {
      title: 'Inventory Operations',
      subtitle: 'Process incoming receipts, customer dispatches, internal transfers, and physical counts'
    },
    'move-history': {
      title: 'Move History & Ledger',
      subtitle: 'Complete chronological audit trail of all inventory movements and adjustments'
    },
    settings: {
      title: 'Settings & Infrastructure',
      subtitle: 'Manage physical storage locations, live Supabase PostgreSQL connection, and facility codes'
    },
    'staff-workstation': {
      title: 'Warehouse Floor Workstation',
      subtitle: 'Touch-optimized order picking lists, receiving docks, and aisle stock counting'
    }
  };

  const currentInfo = PAGE_TITLES[activePage] || PAGE_TITLES.dashboard;

  const handleReset = () => {
    if (window.confirm('Reset all inventory data back to initial demo state?')) {
      resetToMockData();
      toast.info('Data Reset', 'Inventory restored to initial demo state.');
    }
  };

  // 3-Way Quick Switcher: ADMIN -> MANAGER -> STAFF -> ADMIN
  const cycleDemoRole = () => {
    let nextRole = 'MANAGER';
    if (isAdmin) nextRole = 'MANAGER';
    else if (isManager) nextRole = 'STAFF';
    else nextRole = 'ADMIN';

    const switched = loginAsDemoUser(nextRole);
    toast.info(
      'Profile Switched',
      `Switched to ${switched.name} (${switched.roleTitle})`
    );
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged Out', 'You have been signed out.');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#2a2a2a] px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Page Title & Mobile Menu Trigger */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              {currentInfo.title}
            </h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-block ${
              isAdmin
                ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                : isManager
                ? 'bg-coral-50 text-coral-700 border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-900'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900'
            }`}>
              {user?.badge || (isAdmin ? '👑 Admin' : isManager ? '👔 Manager' : '👷 Staff')}
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block truncate mt-0.5">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Clean User Profile & Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Role / User Switcher Chip */}
        <button
          onClick={cycleDemoRole}
          title="Switch Profile (Admin ↔ Manager ↔ Staff)"
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all cursor-pointer shadow-xs ${
            isAdmin
              ? 'bg-rose-50/80 hover:bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
              : isManager
              ? 'bg-coral-50/80 hover:bg-coral-100 text-coral-800 border-coral-200 dark:bg-coral-950/40 dark:text-coral-300 dark:border-coral-900'
              : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {user?.name || (isAdmin ? 'Sarah Admin' : isManager ? 'Alex Morgan' : 'Dave Miller')}
          </span>
          <span className="sm:hidden">
            {isAdmin ? 'Admin' : isManager ? 'Manager' : 'Staff'}
          </span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-700 cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Demo Data Reset Trigger */}
        <button
          onClick={handleReset}
          title="Reset to Initial Demo State"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-700 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
