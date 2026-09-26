import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
import { Sparkles, ShoppingBag, CheckCircle2, AlertTriangle, ArrowDownRight } from 'lucide-react';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export const ReplenishmentModal = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { summary, warehouses, addReceipt, validateReceipt } = useInventory();
  const toast = useToast();

  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || 'WH-001');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [autoValidate, setAutoValidate] = useState(false);
  const [itemsToOrder, setItemsToOrder] = useState([]);

  // Calculate suggested order items on modal open
  useEffect(() => {
    if (isOpen) {
      const urgentItems = [...summary.lowStockItems, ...summary.outOfStockItems];

      const initialList = urgentItems.map((prod) => {
        // Suggested PO formula: (Reorder Level * 2) - current quantity (minimum 5)
        const suggestedQty = Math.max(5, (prod.reorderLevel * 2) - prod.quantity);
        return {
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          category: prod.category,
          unit: prod.unit,
          unitPrice: prod.unitPrice || 0,
          currentStock: prod.quantity,
          reorderLevel: prod.reorderLevel,
          supplier: prod.supplier || 'Standard Supplier',
          orderQuantity: suggestedQty,
          selected: true
        };
      });

      setItemsToOrder(initialList);
      setSelectedWarehouseId(warehouses[0]?.id || 'WH-001');
      setAutoValidate(false);
    }
  }, [isOpen, summary.lowStockItems, summary.outOfStockItems, warehouses]);

  const handleToggleItem = (productId) => {
    setItemsToOrder(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleQuantityChange = (productId, qty) => {
    const parsed = parseInt(qty, 10);
    setItemsToOrder(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, orderQuantity: isNaN(parsed) || parsed < 1 ? 1 : parsed }
          : item
      )
    );
  };

  const selectedCount = itemsToOrder.filter(i => i.selected).length;
  const totalCost = itemsToOrder
    .filter(i => i.selected)
    .reduce((sum, i) => sum + (i.orderQuantity * i.unitPrice), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const activeItems = itemsToOrder.filter(i => i.selected);

    if (activeItems.length === 0) {
      toast.warning('No Items Selected', 'Please check at least one product to generate PO batch.');
      return;
    }

    try {
      const batchRef = `BATCH-PO-${Date.now().toString().slice(-4)}`;
      let validatedCount = 0;

      activeItems.forEach(item => {
        const receipt = addReceipt({
          productId: item.productId,
          supplier: item.supplier,
          quantity: item.orderQuantity,
          warehouseId: selectedWarehouseId,
          location: 'Receiving Bay',
          scheduledDate: scheduledDate,
          notes: `${batchRef}: Automated replenishment batch order.`,
          status: autoValidate ? 'READY' : 'DRAFT'
        });

        if (autoValidate) {
          validateReceipt(receipt.id);
          validatedCount++;
        }
      });

      if (autoValidate) {
        toast.success(
          'Replenishment Batch Received',
          `Restocked ${validatedCount} items into ${warehouses.find(w => w.id === selectedWarehouseId)?.name}.`
        );
      } else {
        toast.success(
          'Replenishment Batch Created',
          `Created ${activeItems.length} draft purchase receipts under ${batchRef}.`
        );
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error('Batch Generation Failed', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Replenishment & PO Generator"
      subtitle="Automated batch purchase orders for all low stock and out of stock items"
      icon={Sparkles}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Top Controls: Target Warehouse & Delivery Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200/80 dark:border-[#2a2a2a] rounded-2xl">
          <div>
            <Select
              label="Receiving Warehouse"
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              required
            />
          </div>
          <div>
            <Input
              label="Expected Delivery Date"
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Suggested Order Items List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider px-1">
            <span>Critical Stock Items ({itemsToOrder.length})</span>
            <span className="text-sage-600 font-semibold">{selectedCount} Selected for Restock</span>
          </div>

          <div className="max-h-72 overflow-y-auto border border-slate-200 dark:border-[#2a2a2a] rounded-2xl divide-y divide-slate-100 dark:divide-[#2a2a2a] bg-white dark:bg-[#121212]">
            {itemsToOrder.length === 0 ? (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <span className="font-bold block text-slate-800 dark:text-slate-200">All Stock Levels Healthy</span>
                No items are currently below their reorder threshold.
              </div>
            ) : (
              itemsToOrder.map((item) => (
                <div
                  key={item.productId}
                  className={`p-3.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                    item.selected ? 'bg-sage-50/20 dark:bg-[#1a1a1a]' : 'opacity-60 bg-slate-50/50 dark:bg-[#1a1a1a]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => handleToggleItem(item.productId)}
                      className="w-4 h-4 text-sage-600 rounded border-slate-300 focus:ring-sage-500 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{item.productName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {item.sku} • On-Hand: <span className="font-bold text-rose-600">{item.currentStock} {item.unit}</span> (Min: {item.reorderLevel})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Unit Cost:</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{formatCurrency(item.unitPrice)}</span>
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.orderQuantity}
                        onChange={(e) => handleQuantityChange(item.productId, e.target.value)}
                        disabled={!item.selected}
                        className="w-full text-center font-mono font-bold text-xs bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-lg py-1 px-2 focus:ring-1 focus:ring-sage-500 focus:outline-none disabled:bg-slate-100 dark:disabled:bg-[#1a1a1a]"
                        title="Order Quantity"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Batch Summary & Auto-Validate toggle */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={autoValidate}
              onChange={(e) => setAutoValidate(e.target.checked)}
              className="w-4 h-4 text-sage-600 rounded border-slate-300 focus:ring-sage-500 cursor-pointer"
            />
            <span>Instantly receive & increase physical inventory</span>
          </label>

          <div className="text-right flex items-baseline gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Est. Batch Total:</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
              {formatCurrency(totalCost)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#2a2a2a]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={ShoppingBag}
            disabled={selectedCount === 0}
            className="sage-glow"
          >
            Generate Batch PO ({selectedCount} Items)
          </Button>
        </div>
      </form>
    </Modal>
  );
};
