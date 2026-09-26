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
  Calendar,
  Clock,
  Warehouse,
  DollarSign,
  Sparkles,
  ScanLine
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useInventory } from '../hooks/useInventory';
import { formatNumber, formatCurrency, formatTimeAgo, formatDate } from '../utils/formatters';

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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Scope Banner if filtered */}
      {activeWarehouseId !== 'ALL' && activeWarehouseObj && (
        <div className="p-3.5 bg-coral-50/80 border border-coral-200/80 rounded-2xl flex items-center justify-between text-xs text-coral-900">
          <div className="flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-coral-600" />
            <span>
              Showing filtered metrics for <strong className="font-bold">{activeWarehouseObj.name}</strong> ({activeWarehouseObj.code}).
            </span>
          </div>
          <span className="font-semibold text-coral-600">
            {activeWarehouseObj.address}
          </span>
        </div>
      )}

      {/* A. Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Products"
          value={formatNumber(summary.totalProducts)}
          subtext="Active catalog items"
          icon={Package}
          variant="default"
          onClick={() => onNavigate('stock')}
          actionText="View Catalog"
        />

        <StatCard
          title="Total Stock"
          value={formatNumber(summary.totalStock)}
          subtext={`Valued at ${formatCurrency(summary.totalValue)}`}
          icon={Layers}
          variant="coral"
          onClick={() => onNavigate('stock')}
          actionText="Inspect Stock"
        />

        <StatCard
          title="Low Stock Items"
          value={formatNumber(summary.lowStockCount)}
          badgeText={summary.lowStockCount > 0 ? 'Action Needed' : 'Healthy'}
          subtext="Below reorder threshold"
          icon={AlertTriangle}
          variant={summary.lowStockCount > 0 ? 'amber' : 'default'}
          onClick={() => onNavigate('stock', { filter: 'LOW_STOCK' })}
          actionText="View Low Stock"
        />

        <StatCard
          title="Out of Stock Items"
          value={formatNumber(summary.outOfStockCount)}
          badgeText={summary.outOfStockCount > 0 ? 'Critical' : 'None'}
          subtext="Zero physical inventory"
          icon={XCircle}
          variant={summary.outOfStockCount > 0 ? 'rose' : 'default'}
          onClick={() => onNavigate('stock', { filter: 'OUT_OF_STOCK' })}
          actionText="Restock Items"
        />
      </div>

      {/* B. Operations Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* RECEIPTS OVERVIEW CARD */}
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-card-hover transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <ArrowDownRight className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Receipts Overview</h3>
                <p className="text-xs text-slate-500">Inbound supplier shipments & receiving</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => onOpenReceiptModal()}
              className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
            >
              New Receipt
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 mb-5">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Pending
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {summary.receiptsStats.pending}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Late
              </p>
              <p className={`text-xl font-extrabold mt-1 ${
                summary.receiptsStats.late > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {summary.receiptsStats.late}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Operations
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {summary.receiptsStats.total}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-medium">
              {summary.receiptsStats.done} successfully received & shelved
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onNavigate('operations', { tab: 'receipts' })}
              className="text-emerald-700 hover:text-emerald-800 font-semibold"
            >
              View Receipts
            </Button>
          </div>
        </Card>

        {/* DELIVERIES OVERVIEW CARD */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-card-hover transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Deliveries Overview</h3>
                <p className="text-xs text-slate-500">Outbound fulfillment & customer dispatches</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => onOpenDeliveryModal()}
              className="text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
            >
              New Delivery
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 mb-5">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Pending
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {summary.deliveriesStats.pending}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Late
              </p>
              <p className={`text-xl font-extrabold mt-1 ${
                summary.deliveriesStats.late > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {summary.deliveriesStats.late}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Operations
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {summary.deliveriesStats.total}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 font-medium">
              {summary.deliveriesStats.done} successfully dispatched
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              iconPosition="right"
              onClick={() => onNavigate('operations', { tab: 'deliveries' })}
              className="text-blue-700 hover:text-blue-800 font-semibold"
            >
              View Deliveries
            </Button>
          </div>
        </Card>
      </div>

      {/* Quick Action Shortcuts Bar & Barcode Scanner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/10 rounded-xl">
            <ScanLine className="w-5 h-5 text-coral-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Need to scan SKUs or relocate warehouse inventory?</h4>
            <p className="text-xs text-slate-300">Fast one-click inventory actions</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="primary"
            size="sm"
            icon={ScanLine}
            onClick={onOpenScanner}
            className="flex-1 sm:flex-initial bg-coral-500 hover:bg-coral-600"
          >
            Barcode Scanner
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={ArrowLeftRight}
            onClick={() => onOpenTransferModal()}
            className="flex-1 sm:flex-initial text-slate-900 bg-white hover:bg-slate-100"
          >
            Internal Transfer
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={SlidersHorizontal}
            onClick={() => onOpenAdjustmentModal()}
            className="flex-1 sm:flex-initial border-slate-600 text-slate-100 hover:bg-white/10"
          >
            Stock Adjustment
          </Button>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Low Stock Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* C. Recent Stock Activity (2 Columns) */}
        <div className="lg:col-span-2">
          <Card noPadding className="h-full flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Stock Activity</h3>
                <p className="text-xs text-slate-500">Live ledger stream across all locations</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => onNavigate('move-history')}
                className="text-coral-600 hover:text-coral-700 font-semibold"
              >
                Full History
              </Button>
            </div>

            <div className="divide-y divide-slate-100 flex-1 overflow-hidden">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No stock movements recorded yet.
                </div>
              ) : (
                recentActivities.map((act) => {
                  const isPositive = act.quantity > 0;
                  const isNegative = act.quantity < 0;

                  return (
                    <div
                      key={act.id}
                      className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant={act.type} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">
                            {act.productName}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {act.source} → {act.destination}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`font-mono font-bold text-sm ${
                          act.type === 'TRANSFER'
                            ? 'text-indigo-600'
                            : isPositive
                            ? 'text-emerald-600'
                            : isNegative
                            ? 'text-rose-600'
                            : 'text-slate-700'
                        }`}>
                          {act.type === 'TRANSFER' ? '⇄ ' : isPositive ? '+' : ''}
                          {act.quantity} {act.unit}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
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

        {/* D. Low Stock Warning Box & Smart Replenishment (1 Column) */}
        <div className="lg:col-span-1">
          <Card noPadding className="h-full flex flex-col border-amber-200/80 bg-gradient-to-b from-amber-50/30 to-white">
            <div className="p-5 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Low Stock Alert</h3>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {summary.lowStockCount} Items
              </span>
            </div>

            <div className="p-4 flex-1 space-y-3">
              {lowStockItems.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <span className="text-emerald-600 font-bold block mb-1">✓ Stock Levels Healthy</span>
                  All catalog items are currently above their reorder thresholds.
                </div>
              ) : (
                lowStockItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 bg-white border border-amber-200/60 rounded-xl shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Stock: <span className="font-bold text-amber-700">{prod.quantity} {prod.unit}</span> / Min: {prod.reorderLevel}
                      </p>
                    </div>

                    <Button
                      variant="secondary"
                      size="icon-sm"
                      title="Create Restock Receipt"
                      onClick={() => onOpenReceiptModal(prod.id)}
                      className="text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200 flex-shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-amber-100/60 bg-amber-50/30 space-y-2">
              {summary.lowStockCount > 0 && onOpenReplenishmentModal && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  onClick={onOpenReplenishmentModal}
                  className="w-full justify-center bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                >
                  Generate Smart Restock PO
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full border-amber-300 text-amber-900 hover:bg-amber-100/50 justify-center text-xs"
                onClick={() => onNavigate('stock', { filter: 'LOW_STOCK' })}
              >
                Manage All Low Stock
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
