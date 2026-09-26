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
  UserCheck
} from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useRole } from '../../hooks/useRole';

export const Sidebar = ({
  activePage,
  setActivePage,
  isMobileOpen,
  setIsMobileOpen,
  onOpenScanner
}) => {
  const { summary, warehouses, activeWarehouseId, setActiveWarehouseId } = useInventory();
  const { currentRole, switchRole, isManager, isStaff, roleInfo } = useRole();

  const totalPendingOperations = summary.receiptsStats.pending + summary.deliveriesStats.pending;

  // Navigation Items depending on active role
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

  const navItems = isManager ? MANAGER_NAV : STAFF_NAV;

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
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-coral-500/20">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-slate-900">
                    Stock<span className="text-coral-500">Sense</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-coral-50 text-coral-600 rounded border border-coral-200/50 uppercase tracking-widest">
                    v2.0
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Modular Inventory System
                </p>
              </div>
            </div>
          </div>

          {/* Warehouse Facility Scope Selector */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Active Facility Scope
            </label>
            <div className="relative">
              <select
                value={activeWarehouseId}
                onChange={(e) => setActiveWarehouseId(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-xl px-2.5 py-2 pr-7 text-slate-800 focus:outline-none focus:ring-1 focus:ring-coral-500 cursor-pointer shadow-xs appearance-none"
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
                {isManager ? 'Manager Menu' : 'Staff Workstation'}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                isManager ? 'bg-coral-50 text-coral-600' : 'bg-indigo-50 text-indigo-700'
              }`}>
                {roleInfo.badge}
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
                      ? isStaff
                        ? 'bg-indigo-50 text-indigo-700 shadow-xs'
                        : 'bg-coral-50 text-coral-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? isStaff ? 'text-indigo-600' : 'text-coral-600'
                          : 'text-slate-400 group-hover:text-slate-600'
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
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all select-none"
            >
              <ScanLine className="w-4 h-4 text-slate-400" />
              <span>Camera Barcode Scan</span>
            </button>
          </div>

          {/* Phase 2 Ready Status Box */}
          <div className="mt-auto p-3.5 mx-3 mb-2 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold mb-1 text-coral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Phase 2 Activated</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Supabase PostgreSQL schema, Barcode Scanner & Smart POs active.
            </p>
          </div>
        </div>

        {/* User Profile & Role Switcher */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs flex-shrink-0 border ${roleInfo.avatarBg}`}>
              {roleInfo.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {roleInfo.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {roleInfo.roleTitle}
              </p>
            </div>
          </div>

          <button
            onClick={() => switchRole(isManager ? 'STAFF' : 'MANAGER')}
            title="Switch User Role"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
