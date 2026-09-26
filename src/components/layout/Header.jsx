import React from 'react';
import {
  Menu,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  ScanLine,
  Sparkles,
  UserCheck,
<<<<<<< HEAD
  ShieldCheck,
  LogOut,
<<<<<<< HEAD
  Crown,
  Users
=======
  ChevronDown
=======
  Sun,
  Moon
>>>>>>> followup-changes
>>>>>>> origin/main
} from 'lucide-react';
import { Button } from '../common/Button';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
<<<<<<< HEAD
import { useAuth } from '../../hooks/useAuth';
=======
import { useRole, ROLES } from '../../hooks/useRole';
import { useTheme } from '../../context/ThemeContext';
>>>>>>> followup-changes

export const Header = ({
  activePage,
  onOpenMobileMenu,
  onOpenProductModal,
  onOpenReceiptModal,
  onOpenDeliveryModal,
  onOpenScanner,
  onOpenReplenishmentModal
}) => {
  const { warehouses, activeWarehouseId, setActiveWarehouseId, resetToMockData, summary } = useInventory();
<<<<<<< HEAD
  const { user, isAdmin, isManager, isStaff, logout, loginAsDemoUser } = useAuth();
=======
<<<<<<< HEAD
  const { user, isManager, isStaff, logout, loginAsDemoUser } = useAuth();
=======
  const { currentRole, switchRole, isManager, isStaff, roleInfo } = useRole();
  const { toggleTheme, isDark } = useTheme();
>>>>>>> followup-changes
>>>>>>> origin/main
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
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#2a2a2a] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Left Title & Mobile Menu Trigger */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
              {currentInfo.title}
            </h1>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border hidden sm:inline-block ${
<<<<<<< HEAD
              isAdmin
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : isManager
                ? 'bg-coral-50 text-coral-700 border-coral-200'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
=======
              isManager
                ? 'bg-sage-50 text-sage-700 border-sage-200 dark:bg-sage-900/30 dark:text-sage-400 dark:border-sage-800'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800'
>>>>>>> origin/main
            }`}>
              {user?.badge || (isAdmin ? '👑 Admin' : isManager ? '👔 Manager' : '👷 Staff')}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate mt-0.5">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Quick Actions, Role Switcher & Logout */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
        {/* Barcode Scanner Shortcut */}
        <Button
          variant="secondary"
          size="sm"
          icon={ScanLine}
          onClick={onOpenScanner}
          className="text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
          title="Open Barcode & QR Scanner"
        >
          <span className="hidden md:inline">Scanner</span>
        </Button>

        {/* Smart Restock PO Trigger (Admin / Manager) */}
        {(isAdmin || isManager) && summary.lowStockCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            onClick={onOpenReplenishmentModal}
            className="hidden lg:inline-flex bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 text-xs font-semibold"
          >
            Auto Restock ({summary.lowStockCount})
          </Button>
        )}

        {/* Quick Add Buttons for Admin/Manager */}
        {(isAdmin || isManager) && (
          <>
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowDownRight}
              onClick={onOpenReceiptModal}
              className="hidden xl:inline-flex text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200/70"
            >
              + Receipt
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={ArrowUpRight}
              onClick={onOpenDeliveryModal}
              className="hidden xl:inline-flex text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200/70"
            >
              + Delivery
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={onOpenProductModal}
              className="sage-glow"
            >
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Product</span>
            </Button>
          </>
        )}

        {/* 3-Profile Cycle Switcher Button */}
        <button
<<<<<<< HEAD
          onClick={cycleDemoRole}
          title="Switch Profile (Admin ↔ Manager ↔ Staff)"
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
            isAdmin
              ? 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 shadow-xs'
              : isManager
              ? 'bg-coral-50 hover:bg-coral-100 text-coral-800 border-coral-200 shadow-xs'
=======
          onClick={toggleRole}
          title="Click to Switch Role (Manager ↔ Staff)"
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
            isManager
              ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300/80 dark:border-slate-600'
>>>>>>> origin/main
              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-xs'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {isAdmin ? '👑 Admin (Sarah)' : isManager ? '👔 Manager (Alex)' : '👷 Staff (Dave)'}
          </span>
          <span className="sm:hidden">
            {isAdmin ? 'Admin' : isManager ? 'Mgr' : 'Staff'}
          </span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-700"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Demo Data Reset Trigger */}
        <button
          onClick={handleReset}
          title="Reset to Initial Demo State"
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors dark:text-slate-500 dark:hover:text-slate-200 dark:hover:bg-slate-800 dark:hover:border-slate-700"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
