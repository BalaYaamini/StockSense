import React, { useState } from 'react';
import {
  PackageCheck,
  ArrowDownRight,
  ArrowUpRight,
  ScanLine,
  SlidersHorizontal,
  CheckCircle2,
  MapPin,
  Clock,
  Plus,
  Minus,
  Search,
  CheckSquare,
  Square,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../hooks/useToast';
import { formatDate, formatNumber } from '../utils/formatters';

export const WarehouseStaffPage = ({
  onOpenScanner,
  onOpenReceiptModal,
  onOpenDeliveryModal
}) => {
  const {
    products,
    warehouses,
    deliveries,
    receipts,
    validateDelivery,
    validateReceipt,
    addAdjustment,
    activeWarehouseId
  } = useInventory();
  const toast = useToast();

  const [activeStaffTab, setActiveStaffTab] = useState('picking'); // 'picking', 'receiving', 'counting'
  const [checkedItems, setCheckedItems] = useState({});

  // Rapid Counting State
  const [countingProductId, setCountingProductId] = useState(products[0]?.id || '');
  const [countingWarehouseId, setCountingWarehouseId] = useState(activeWarehouseId !== 'ALL' ? activeWarehouseId : warehouses[0]?.id || 'WH-001');
  const [manualCount, setManualCount] = useState(0);

  // Filtered Pending Tasks for Staff
  const pendingDeliveries = deliveries.filter(d => d.status === 'WAITING' || d.status === 'DRAFT');
  const pendingReceipts = receipts.filter(r => r.status === 'READY' || r.status === 'DRAFT');

  const handleToggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConfirmPick = (deliveryId) => {
    const res = validateDelivery(deliveryId);
    if (res.success) {
      toast.success('Order Picked & Dispatched', res.message);
      setCheckedItems(prev => {
        const next = { ...prev };
        delete next[deliveryId];
        return next;
      });
    } else {
      toast.error('Dispatch Blocked', res.message);
    }
  };

  const handleConfirmReceive = (receiptId) => {
    const res = validateReceipt(receiptId);
    if (res.success) {
      toast.success('Goods Shelved', res.message);
    } else {
      toast.error('Receiving Failed', res.message);
    }
  };

  // Quick Counting handlers
  const selectedCountProd = products.find(p => p.id === countingProductId);
  const curSystemStock = selectedCountProd?.stockByWarehouse?.[countingWarehouseId]?.quantity || 0;

  const handleApplyCount = () => {
    if (!selectedCountProd) return;
    const res = addAdjustment({
      productId: countingProductId,
      warehouseId: countingWarehouseId,
      countedQuantity: manualCount,
      reason: 'Floor Staff Rapid Cycle Count',
      user: 'Dave Miller (Warehouse Staff)'
    });

    if (res.success) {
      toast.success('Count Updated', res.message);
    } else {
      toast.error('Count Failed', res.message);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Staff Welcome & Camera Barcode Action */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-sage-400 flex-shrink-0">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-sage-300">
              Warehouse Floor Operations
            </span>
            <h2 className="text-xl font-black tracking-tight">Staff Workstation</h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Optimized touch interface for order picking, dock receiving, and aisle cycle counts.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          icon={ScanLine}
          onClick={onOpenScanner}
          className="w-full sm:w-auto bg-sage-500 hover:bg-sage-600 sage-glow font-bold text-sm shadow-lg"
        >
          Open Camera Scanner
        </Button>
      </div>

      {/* Touch-Friendly Segmented Workstation Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-200/80 dark:bg-[#1a1a1a] p-1.5 rounded-2xl border border-slate-300/60 dark:border-[#2a2a2a]">
        <button
          onClick={() => setActiveStaffTab('picking')}
          className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeStaffTab === 'picking'
              ? 'bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-blue-600" />
          <span>Picking Queue</span>
          {pendingDeliveries.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">
              {pendingDeliveries.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStaffTab('receiving')}
          className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeStaffTab === 'receiving'
              ? 'bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowDownRight className="w-4 h-4 text-emerald-600" />
          <span>Receiving Dock</span>
          {pendingReceipts.length > 0 && (
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
              {pendingReceipts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveStaffTab('counting')}
          className={`py-3 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeStaffTab === 'counting'
              ? 'bg-white dark:bg-[#2a2a2a] text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-600" />
          <span>Rapid Shelf Count</span>
        </button>
      </div>

      {/* 1. PICKING QUEUE */}
      {activeStaffTab === 'picking' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Pending Pick Lists ({pendingDeliveries.length})
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Tap to check off items while walking shelves</span>
          </div>

          {pendingDeliveries.length === 0 ? (
            <Card className="text-center py-16">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">All Orders Picked & Dispatched</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No pending outbound fulfillment orders in queue.</p>
            </Card>
          ) : (
            pendingDeliveries.map((del) => {
              const isChecked = !!checkedItems[del.id];
              const prod = products.find(p => p.id === del.productId);
              const shelfLocation = prod?.stockByWarehouse?.[del.warehouseId]?.location || 'Rack A-01';

              return (
                <div
                  key={del.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-[#121212] ${
                    isChecked
                      ? 'border-blue-400 ring-2 ring-blue-500/10 shadow-md'
                      : 'border-slate-200/80 dark:border-[#2a2a2a] shadow-card hover:border-slate-300 dark:hover:border-[#3a3a3a]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Checkbox & Item Details */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        onClick={() => handleToggleCheck(del.id)}
                        className="mt-0.5 text-blue-600 hover:scale-110 transition-transform flex-shrink-0"
                      >
                        {isChecked ? (
                          <CheckSquare className="w-6 h-6 fill-blue-50 text-blue-600" />
                        ) : (
                          <Square className="w-6 h-6 text-slate-300 dark:text-slate-600 hover:text-slate-400" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                            {del.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Customer: {del.customer}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                          {del.productName}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono">{del.sku}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="flex items-center gap-1 font-semibold text-sage-600 bg-sage-50 px-2 py-0.5 rounded-md">
                            <MapPin className="w-3.5 h-3.5" />
                            Location: {shelfLocation}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span>Facility: {del.warehouseName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Confirm Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#2a2a2a]">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Pick Qty</span>
                        <span className="text-xl font-black text-blue-700 font-mono">
                          {del.quantity} {del.unit}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        icon={CheckCircle2}
                        onClick={() => handleConfirmPick(del.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Mark Picked
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. RECEIVING DOCK */}
      {activeStaffTab === 'receiving' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Inbound Receiving Dock ({pendingReceipts.length})
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">Verify packages and shelve into assigned bays</span>
          </div>

          {pendingReceipts.length === 0 ? (
            <Card className="text-center py-16">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">Receiving Dock Clear</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No incoming supplier shipments awaiting check-in.</p>
            </Card>
          ) : (
            pendingReceipts.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] bg-white dark:bg-[#121212] shadow-card hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {rec.id}
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Supplier: {rec.supplier}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-1">
                    {rec.productName}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{rec.sku}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <MapPin className="w-3.5 h-3.5" />
                      Target Bay: {rec.location || 'Receiving Bay'}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span>Facility: {rec.warehouseName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#2a2a2a]">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Received Qty</span>
                    <span className="text-xl font-black text-emerald-700 font-mono">
                      +{rec.quantity} {rec.unit}
                    </span>
                  </div>

                  <Button
                    variant="success"
                    size="md"
                    icon={CheckCircle2}
                    onClick={() => handleConfirmReceive(rec.id)}
                    className="shadow-sm"
                  >
                    Verify & Shelve
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. RAPID SHELF COUNTER */}
      {activeStaffTab === 'counting' && (
        <Card className="max-w-xl mx-auto border-amber-200">
          <div className="text-center pb-4 border-b border-slate-100 dark:border-[#2a2a2a]">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Aisle Shelf Counter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Quickly recount stock on shelves and update discrepancy</p>
          </div>

          <div className="space-y-4 pt-4">
            {/* Product & Warehouse Selector */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Select Product on Shelf:
                </label>
                <select
                  value={countingProductId}
                  onChange={(e) => {
                    setCountingProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    setManualCount(prod?.stockByWarehouse?.[countingWarehouseId]?.quantity || 0);
                  }}
                  className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#121212] dark:text-white"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Warehouse Facility:
                </label>
                <select
                  value={countingWarehouseId}
                  onChange={(e) => {
                    setCountingWarehouseId(e.target.value);
                    setManualCount(selectedCountProd?.stockByWarehouse?.[e.target.value]?.quantity || 0);
                  }}
                  className="w-full text-sm font-semibold p-2.5 rounded-xl border border-slate-200 dark:border-[#2a2a2a] bg-white dark:bg-[#121212] dark:text-white"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Current Recorded Stock Banner */}
            <div className="p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-2xl border border-slate-200 dark:border-[#2a2a2a] text-center">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Current System Record
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-white font-mono">
                {curSystemStock} {selectedCountProd?.unit}
              </span>
            </div>

            {/* Large Touch Counter */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block text-center">
                Actual Physical Shelf Count:
              </span>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setManualCount(prev => Math.max(0, prev - 1))}
                  className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#2a2a2a] hover:bg-slate-200 dark:hover:bg-[#3a3a3a] active:scale-95 text-slate-800 dark:text-white font-bold flex items-center justify-center text-xl transition-all shadow-xs"
                >
                  <Minus className="w-6 h-6" />
                </button>

                <input
                  type="number"
                  min="0"
                  value={manualCount}
                  onChange={(e) => setManualCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  className="w-32 h-14 text-center font-mono font-black text-3xl rounded-2xl border-2 border-amber-300 focus:outline-none focus:border-amber-500 bg-white dark:bg-[#121212] dark:text-white shadow-inner"
                />

                <button
                  type="button"
                  onClick={() => setManualCount(prev => prev + 1)}
                  className="w-14 h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold flex items-center justify-center text-xl transition-all shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Discrepancy Note */}
            <div className={`p-3 rounded-xl border text-center font-bold text-xs ${
              manualCount === curSystemStock
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : manualCount > curSystemStock
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {manualCount === curSystemStock
                ? '✓ Count matches system on-hand record perfectly'
                : `Discrepancy: ${manualCount > curSystemStock ? '+' : ''}${manualCount - curSystemStock} ${selectedCountProd?.unit}`}
            </div>

            {/* Submit */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleApplyCount}
              className="w-full justify-center bg-amber-500 hover:bg-amber-600 font-bold"
            >
              Update Physical Count
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
