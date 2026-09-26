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
  ScanLine
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
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Scope Banner if filtered */}
      {activeWarehouseId !== 'ALL' && activeWarehouseObj && (
        <div className="px-3 py-2 bg-sage-50/60 dark:bg-[#1a1a1a] border border-sage-200/50 dark:border-[#2a2a2a] rounded-lg flex items-center justify-between text-xs text-sage-800 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <Warehouse className="w-3.5 h-3.5 text-sage-500 dark:text-sage-400" />
            <span>
              Filtered: <strong className="font-semibold">{activeWarehouseObj.name}</strong>
            </span>
          </div>
          <span className="text-sage-600 dark:text-sage-400">
            {activeWarehouseObj.address}
          </span>
        </div>
      )}

      {/* A. Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products"
          value={formatNumber(summary.totalProducts)}
          subtext="Active catalog items"
          icon={Package}
          variant="default"
          onClick={() => onNavigate('stock')}
        />

        <StatCard
          title="Total Stock"
          value={formatNumber(summary.totalStock)}
          subtext={`Valued at ${formatCurrency(summary.totalValue)}`}
          icon={Layers}
          variant="sage"
          onClick={() => onNavigate('stock')}
        />

        <StatCard
          title="Low Stock"
          value={formatNumber(summary.lowStockCount)}
          badgeText={summary.lowStockCount > 0 ? 'Action Needed' : 'Healthy'}
          subtext="Below reorder threshold"
          icon={AlertTriangle}
          variant={summary.lowStockCount > 0 ? 'amber' : 'default'}
          onClick={() => onNavigate('stock', { filter: 'LOW_STOCK' })}
        />

        <StatCard
          title="Out of Stock"
          value={formatNumber(summary.outOfStockCount)}
          badgeText={summary.outOfStockCount > 0 ? 'Critical' : 'None'}
          subtext="Zero physical inventory"
          icon={XCircle}
          variant={summary.outOfStockCount > 0 ? 'rose' : 'default'}
          onClick={() => onNavigate('stock', { filter: 'OUT_OF_STOCK' })}
        />
      </div>

      {/* B. Operations Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Receipts */}
        <Card className="hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg">
                <ArrowDownRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Receipts</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Inbound shipments</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => onOpenReceiptModal()}
              className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-xs"
            >
              New
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Pending</span>
              <span className="ml-1.5 font-bold text-slate-900 dark:text-white">{summary.receiptsStats.pending}</span>
            </div>
            {summary.receiptsStats.late > 0 && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Late</span>
                <span className="ml-1.5 font-bold text-rose-600">{summary.receiptsStats.late}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 dark:text-slate-400">Total</span>
              <span className="ml-1.5 font-bold text-slate-900 dark:text-white">{summary.receiptsStats.total}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {summary.receiptsStats.done} received
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

        {/* Deliveries */}
        <Card className="hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Deliveries</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Outbound dispatches</p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={Plus}
              onClick={() => onOpenDeliveryModal()}
              className="text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 text-xs"
            >
              New
            </Button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Pending</span>
              <span className="ml-1.5 font-bold text-slate-900 dark:text-white">{summary.deliveriesStats.pending}</span>
            </div>
            {summary.deliveriesStats.late > 0 && (
              <div>
                <span className="text-slate-500 dark:text-slate-400">Late</span>
                <span className="ml-1.5 font-bold text-rose-600">{summary.deliveriesStats.late}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 dark:text-slate-400">Total</span>
              <span className="ml-1.5 font-bold text-slate-900 dark:text-white">{summary.deliveriesStats.total}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {summary.deliveriesStats.done} dispatched
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
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1">Quick Actions:</span>
        <Button
          variant="secondary"
          size="sm"
          icon={ScanLine}
          onClick={onOpenScanner}
          className="text-xs"
        >
          Scanner
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeftRight}
          onClick={() => onOpenTransferModal()}
          className="text-xs"
        >
          Transfer
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={SlidersHorizontal}
          onClick={() => onOpenAdjustmentModal()}
          className="text-xs"
        >
          Adjustment
        </Button>
      </div>

      {/* Bottom Grid: Recent Activity & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Stock Activity */}
        <div className="lg:col-span-2">
          <Card noPadding className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Last 6 stock movements</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => onNavigate('move-history')}
                className="text-sage-600 hover:text-sage-700 text-xs font-semibold"
              >
                Full History
              </Button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#2a2a2a] flex-1 overflow-hidden">
              {recentActivities.length === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                  No stock movements recorded yet.
                </div>
              ) : (
                recentActivities.map((act) => {
                  const isPositive = act.quantity > 0;
                  const isNegative = act.quantity < 0;

                  return (
                    <div
                      key={act.id}
                      className="px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-[#1a1a1a] transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant={act.type} size="sm" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">
                            {act.productName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {act.source} → {act.destination}
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className={`font-mono font-semibold text-sm ${
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

        {/* Low Stock Alert */}
        <div className="lg:col-span-1">
          <Card noPadding className="h-full flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Low Stock</h3>
              </div>
              {summary.lowStockCount > 0 && (
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {summary.lowStockCount}
                </span>
              )}
            </div>

            <div className="p-3 flex-1 space-y-2">
              {lowStockItems.length === 0 ? (
                <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs">
                  <span className="text-emerald-600 font-semibold block mb-1">All stocked</span>
                  Items are above reorder levels.
                </div>
              ) : (
                lowStockItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-2.5 bg-slate-50 dark:bg-[#1a1a1a] rounded-lg flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-amber-600">{prod.quantity}</span>
                        {' / '}
                        {prod.reorderLevel} min
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

            <div className="p-3 border-t border-slate-100 dark:border-[#2a2a2a] space-y-2">
              {summary.lowStockCount > 0 && onOpenReplenishmentModal && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Sparkles}
                  onClick={onOpenReplenishmentModal}
                  className="w-full justify-center bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
                >
                  Smart Restock PO
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs"
                onClick={() => onNavigate('stock', { filter: 'LOW_STOCK' })}
              >
                View All Low Stock
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
