import React from 'react';
import {
  Package,
  Layers,
  AlertTriangle,
  XCircle,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Plus,
  ArrowRight,
  Warehouse,
  Sparkles,
  ScanLine,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useInventory } from '../hooks/useInventory';
import { formatNumber, formatCurrency, formatTimeAgo } from '../utils/formatters';

export const DashboardPage = ({
  onNavigate,
  onOpenProductModal,
  onOpenReceiptModal,
  onOpenDeliveryModal,
  onOpenTransferModal,
  onOpenAdjustmentModal,
  onOpenReplenishmentModal,
  onOpenScanner
}) => {
  const { summary, moveHistory, products, activeWarehouseId, warehouses } = useInventory();

  const activeWarehouseObj = warehouses.find(w => w.id === activeWarehouseId);

  // Recent 6 stock movements
  const recentActivities = moveHistory.slice(0, 6);

  // Low stock products
  const lowStockItems = summary.lowStockItems.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* 1. Scope Banner if filtered */}
      {activeWarehouseId !== 'ALL' && activeWarehouseObj && (
        <div className="px-4 py-3 bg-sage-50/80 dark:bg-[#1a1a1a] border border-sage-200/60 dark:border-[#2a2a2a] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-sage-900 dark:text-slate-200">
            <div className="p-1.5 rounded-lg bg-sage-200/60 dark:bg-sage-900/40 text-sage-700 dark:text-sage-300">
              <Warehouse className="w-4 h-4" />
            </div>
            <span>
              Active Facility Scope: <strong className="font-bold text-slate-900 dark:text-white">{activeWarehouseObj.name}</strong>
            </span>
          </div>
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {activeWarehouseObj.address}
          </span>
        </div>
      )}

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Catalog Products"
          value={formatNumber(summary.totalProducts)}
          subtext="Active SKU definitions"
          icon={Package}
          variant="default"
          onClick={() => onNavigate('stock')}
        />

        <StatCard
          title="Total Stock Units"
          value={formatNumber(summary.totalStock)}
          subtext={`Valued at ${formatCurrency(summary.totalValue)}`}
          icon={Layers}
          variant="sage"
          onClick={() => onNavigate('stock')}
        />

        <StatCard
          title="Low Stock Alert"
          value={formatNumber(summary.lowStockCount)}
          badgeText={summary.lowStockCount > 0 ? 'Needs Attention' : 'Optimal'}
          subtext="Items below reorder point"
          icon={AlertTriangle}
          variant={summary.lowStockCount > 0 ? 'amber' : 'default'}
          onClick={() => onNavigate('stock', { filter: 'LOW_STOCK' })}
        />

        <StatCard
          title="Out of Stock"
          value={formatNumber(summary.outOfStockCount)}
          badgeText={summary.outOfStockCount > 0 ? 'Critical' : 'Zero'}
          subtext="Zero physical inventory"
          icon={XCircle}
          variant={summary.outOfStockCount > 0 ? 'rose' : 'default'}
          onClick={() => onNavigate('stock', { filter: 'OUT_OF_STOCK' })}
        />
      </div>

      {/* 3. Operations & Quick Actions Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Receipts Operation Card */}
        <Card className="hover:shadow-card-hover transition-all border-slate-200/80 dark:border-[#2a2a2a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inbound Receipts</h3>
                  <p className="text-xs text-slate-400">Vendor shipments & docks</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => onOpenReceiptModal()}
                className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-xs font-semibold"
              >
                New
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50/80 dark:bg-[#181818] rounded-xl border border-slate-100 dark:border-[#2a2a2a]">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{summary.receiptsStats.pending}</p>
              </div>
              <div className="text-center border-x border-slate-200/60 dark:border-[#2a2a2a]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Late</p>
                <p className={`text-base font-extrabold mt-0.5 ${summary.receiptsStats.late > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  {summary.receiptsStats.late}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{summary.receiptsStats.total}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              <strong className="text-emerald-600 font-semibold">{summary.receiptsStats.done}</strong> completed
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onNavigate('operations', { tab: 'receipts' })}
              className="text-emerald-700 hover:text-emerald-800 text-xs font-semibold"
            >
              View All
            </Button>
          </div>
        </Card>

        {/* Deliveries Operation Card */}
        <Card className="hover:shadow-card-hover transition-all border-slate-200/80 dark:border-[#2a2a2a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Customer Deliveries</h3>
                  <p className="text-xs text-slate-400">Outbound dispatches</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => onOpenDeliveryModal()}
                className="text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 text-xs font-semibold"
              >
                New
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50/80 dark:bg-[#181818] rounded-xl border border-slate-100 dark:border-[#2a2a2a]">
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{summary.deliveriesStats.pending}</p>
              </div>
              <div className="text-center border-x border-slate-200/60 dark:border-[#2a2a2a]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Late</p>
                <p className={`text-base font-extrabold mt-0.5 ${summary.deliveriesStats.late > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                  {summary.deliveriesStats.late}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
                <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{summary.deliveriesStats.total}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              <strong className="text-blue-600 font-semibold">{summary.deliveriesStats.done}</strong> dispatched
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onNavigate('operations', { tab: 'deliveries' })}
              className="text-blue-700 hover:text-blue-800 text-xs font-semibold"
            >
              View All
            </Button>
          </div>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="hover:shadow-card-hover transition-all border-slate-200/80 dark:border-[#2a2a2a] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h3>
                <p className="text-xs text-slate-400">Warehouse floor tools</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={onOpenScanner}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-[#1a1a1a] dark:hover:bg-[#222] border border-slate-200/60 dark:border-[#2a2a2a] text-slate-800 dark:text-slate-200 transition-all text-xs font-bold cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-[#121212] text-indigo-600 shadow-xs border border-slate-200/50">
                    <ScanLine className="w-4 h-4" />
                  </div>
                  <span>Barcode & QR Scanner</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onOpenTransferModal()}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-[#1a1a1a] dark:hover:bg-[#222] border border-slate-200/60 dark:border-[#2a2a2a] text-slate-800 dark:text-slate-200 transition-all text-xs font-bold cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-[#121212] text-indigo-600 shadow-xs border border-slate-200/50">
                    <ArrowLeftRight className="w-4 h-4" />
                  </div>
                  <span>Internal Stock Transfer</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => onOpenAdjustmentModal()}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/70 dark:bg-[#1a1a1a] dark:hover:bg-[#222] border border-slate-200/60 dark:border-[#2a2a2a] text-slate-800 dark:text-slate-200 transition-all text-xs font-bold cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-[#121212] text-indigo-600 shadow-xs border border-slate-200/50">
                    <SlidersHorizontal className="w-4 h-4" />
                  </div>
                  <span>Physical Inventory Count</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between text-xs text-slate-400">
            <span>Fast shortcuts</span>
            <span className="font-mono text-[11px] font-semibold text-slate-500">Live Sync</span>
          </div>
        </Card>
      </div>

      {/* 4. Bottom Grid: Recent Activity & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Stock Activity (2 Cols) */}
        <div className="lg:col-span-2">
          <Card noPadding className="h-full flex flex-col border-slate-200/80 dark:border-[#2a2a2a]">
            <div className="p-5 border-b border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Recent Activity Ledger</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 6 recorded warehouse stock movements</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => onNavigate('move-history')}
                className="text-sage-700 hover:text-sage-800 dark:text-sage-300 text-xs font-bold"
              >
                Full Ledger
              </Button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#2a2a2a] flex-1 overflow-hidden">
              {recentActivities.length === 0 ? (
                <div className="p-10 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No stock movements recorded yet.
                </div>
              ) : (
                recentActivities.map((act) => {
                  const isPositive = act.quantity > 0;
                  const isNegative = act.quantity < 0;

                  return (
                    <div
                      key={act.id}
                      className="px-5 py-3.5 hover:bg-slate-50/60 dark:hover:bg-[#1a1a1a] transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant={act.type} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">
                            {act.productName}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {act.source} → {act.destination}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`font-mono font-bold text-xs sm:text-sm ${
                          act.type === 'TRANSFER'
                            ? 'text-indigo-600'
                            : isPositive
                            ? 'text-emerald-600'
                            : isNegative
                            ? 'text-rose-600'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {act.type === 'TRANSFER' ? '⇄ ' : isPositive ? '+' : ''}
                          {act.quantity} {act.unit}
                        </span>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {formatTimeAgo(act.date)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Low Stock Alert (1 Col) */}
        <div className="lg:col-span-1">
          <Card noPadding className="h-full flex flex-col border-slate-200/80 dark:border-[#2a2a2a]">
            <div className="p-5 border-b border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Low Stock Watch</h3>
                  <p className="text-[11px] text-slate-400">Needs restock</p>
                </div>
              </div>
              {summary.lowStockCount > 0 && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800">
                  {summary.lowStockCount} items
                </span>
              )}
            </div>

            <div className="p-4 flex-1 space-y-2.5">
              {lowStockItems.length === 0 ? (
                <div className="py-10 text-center text-slate-500 dark:text-slate-400 text-xs">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-emerald-600 font-bold block mb-1">Inventory Healthy</span>
                  All stock items are comfortably above safety reorder levels.
                </div>
              ) : (
                lowStockItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-slate-50/80 dark:bg-[#1a1a1a] rounded-xl border border-slate-200/50 dark:border-[#2a2a2a] flex items-center justify-between gap-3 hover:border-amber-200 transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {prod.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                          {prod.quantity} on hand
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          (Min: {prod.reorderLevel})
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      title="Create Restock Receipt"
                      onClick={() => onOpenReceiptModal(prod.id)}
                      className="text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border-amber-200 text-xs font-bold flex-shrink-0"
                    >
                      + PO
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-[#2a2a2a] space-y-2 bg-slate-50/40 dark:bg-[#161616] rounded-b-2xl">
              {summary.lowStockCount > 0 && onOpenReplenishmentModal && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  onClick={onOpenReplenishmentModal}
                  className="w-full justify-center bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                >
                  Generate Smart Restock PO
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-semibold"
                onClick={() => onNavigate('stock', { filter: 'LOW_STOCK' })}
              >
                View All Low Stock Items →
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
