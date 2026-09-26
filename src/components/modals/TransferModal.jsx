import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
import { ArrowLeftRight, AlertCircle, Check } from 'lucide-react';

export const TransferModal = ({
  isOpen,
  onClose,
  preselectedProductId = null
}) => {
  const { products, warehouses, addTransfer } = useInventory();
  const toast = useToast();

  const [formData, setFormData] = useState({
    productId: '',
    sourceWarehouseId: warehouses[0]?.id || 'WH-001',
    destWarehouseId: warehouses[1]?.id || 'WH-002',
    quantity: '10',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initialProdId = preselectedProductId || (products[0] ? products[0].id : '');
      const srcId = warehouses[0]?.id || 'WH-001';
      const destId = warehouses[1]?.id || warehouses[0]?.id || 'WH-002';

      setFormData({
        productId: initialProdId,
        sourceWarehouseId: srcId,
        destWarehouseId: destId !== srcId ? destId : (warehouses.find(w => w.id !== srcId)?.id || ''),
        quantity: '10',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen, preselectedProductId, products, warehouses]);

  const selectedProduct = products.find(p => p.id === formData.productId);
  const sourceWh = warehouses.find(w => w.id === formData.sourceWarehouseId);
  const destWh = warehouses.find(w => w.id === formData.destWarehouseId);

  const sourceAvailable = selectedProduct?.stockByWarehouse?.[formData.sourceWarehouseId]?.quantity || 0;
  const destCurrent = selectedProduct?.stockByWarehouse?.[formData.destWarehouseId]?.quantity || 0;
  const transferQty = parseInt(formData.quantity, 10) || 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.productId) newErrors.productId = 'Product is required';
    if (!formData.sourceWarehouseId) newErrors.sourceWarehouseId = 'Source warehouse is required';
    if (!formData.destWarehouseId) newErrors.destWarehouseId = 'Destination warehouse is required';
    if (formData.sourceWarehouseId === formData.destWarehouseId) {
      newErrors.destWarehouseId = 'Destination must be different from source warehouse';
    }
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Transfer quantity must be at least 1';
    } else if (transferQty > sourceAvailable) {
      newErrors.quantity = `Cannot transfer more than available in source (${sourceAvailable} ${selectedProduct?.unit || 'units'})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = addTransfer({
        productId: formData.productId,
        sourceWarehouseId: formData.sourceWarehouseId,
        destWarehouseId: formData.destWarehouseId,
        quantity: transferQty,
        notes: formData.notes.trim()
      });

      if (res.success) {
        toast.success('Internal Transfer Completed', res.message);
        onClose();
      } else {
        toast.error('Transfer Failed', res.message);
      }
    } catch (err) {
      toast.error('Transfer Error', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Internal Stock Transfer"
      subtitle="Relocate inventory between warehouses without altering total company stock"
      icon={ArrowLeftRight}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Selector */}
        <div>
          <Select
            label="Product to Transfer"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            error={errors.productId}
            required
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Total Company Stock: {p.totalCompanyQuantity} {p.unit}
              </option>
            ))}
          </Select>
        </div>

        {/* Source and Destination Warehouses */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-xl">
            <Select
              label="Source Warehouse (From)"
              name="sourceWarehouseId"
              value={formData.sourceWarehouseId}
              onChange={handleChange}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              error={errors.sourceWarehouseId}
              required
            />
            <div className="mt-2 text-xs flex justify-between text-slate-600 dark:text-slate-300 font-medium">
              <span>Available at Source:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {sourceAvailable} {selectedProduct?.unit || 'Units'}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-xl">
            <Select
              label="Destination Warehouse (To)"
              name="destWarehouseId"
              value={formData.destWarehouseId}
              onChange={handleChange}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              error={errors.destWarehouseId}
              required
            />
            <div className="mt-2 text-xs flex justify-between text-slate-600 dark:text-slate-300 font-medium">
              <span>Current at Destination:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {destCurrent} {selectedProduct?.unit || 'Units'}
              </span>
            </div>
          </div>
        </div>

        {/* Quantity */}
        <div>
          <Input
            label={`Transfer Quantity (${selectedProduct?.unit || 'Units'})`}
            name="quantity"
            type="number"
            min="1"
            max={sourceAvailable > 0 ? sourceAvailable : undefined}
            value={formData.quantity}
            onChange={handleChange}
            error={errors.quantity}
            required
          />
        </div>

        {/* Transfer Preview Calculation Card */}
        {sourceWh && destWh && formData.sourceWarehouseId !== formData.destWarehouseId && transferQty > 0 && (
          <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs space-y-1.5 text-indigo-900">
            <div className="font-bold flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-600" />
              <span>Transfer Preview</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-indigo-200/50">
              <div>
                <span className="text-indigo-700">{sourceWh.code}: </span>
                <span className="font-semibold">{sourceAvailable} → {Math.max(0, sourceAvailable - transferQty)}</span>
              </div>
              <div>
                <span className="text-indigo-700">{destWh.code}: </span>
                <span className="font-semibold">{destCurrent} → {destCurrent + transferQty}</span>
              </div>
            </div>
            <p className="text-[11px] text-indigo-700 pt-1">
              ✓ Total company inventory remains exactly {selectedProduct?.totalCompanyQuantity} {selectedProduct?.unit}.
            </p>
          </div>
        )}

        {/* Transfer Notes */}
        <div>
          <Input
            label="Reason / Transfer Notes"
            name="notes"
            placeholder="e.g. Rebalance regional inventory for customer project"
            value={formData.notes}
            onChange={handleChange}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#2a2a2a]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Check}
            disabled={sourceAvailable <= 0 || transferQty > sourceAvailable}
          >
            Confirm & Transfer
          </Button>
        </div>
      </form>
    </Modal>
  );
};
