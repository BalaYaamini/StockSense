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
  Link2
} from 'lucide-react';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { WarehouseModal } from '../components/modals/WarehouseModal';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../hooks/useToast';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
  resetSupabaseClient
} from '../services/supabaseClient';

export const SettingsPage = () => {
  const { warehouses, resetToMockData, products, moveHistory, receipts, deliveries } = useInventory();
  const toast = useToast();

  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Supabase Configuration State
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseConfig());
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connTestResult, setConnTestResult] = useState(null);

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

      {/* 3. Database Sandbox & Reset */}
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
    </div>
  );
};
