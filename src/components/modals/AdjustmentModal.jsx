import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
import { SlidersHorizontal, TrendingUp, TrendingDown, Check } from 'lucide-react';

const REASONS = [
  'Cycle Count Discrepancy',
  'Damaged Goods / Forklift Mishap',
  'Lost or Unaccounted Stock',
  'Found Extra Inventory',
  'Expired / Quality Rejection',
  'Initial Physical Audit',
  'Supplier Packaging Defect'
];

export const AdjustmentModal = ({
  isOpen,
  onClose,
  preselectedProductId = null
}) => {
  const { products, warehouses, addAdjustment } = useInventory();
  const toast = useToast();

  const [formData, setFormData] = useState({
    productId: '',
    warehouseId: warehouses[0]?.id || 'WH-001',
    countedQuantity: '',
    reason: REASONS[0],
    user: 'Alex Morgan (Inventory Mgr)'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initialProdId = preselectedProductId || (products[0] ? products[0].id : '');
      const whId = warehouses[0]?.id || 'WH-001';
      const prod = products.find(p => p.id === initialProdId);
      const curSystemQty = prod?.stockByWarehouse?.[whId]?.quantity || 0;

      setFormData({
        productId: initialProdId,
        warehouseId: whId,
        countedQuantity: curSystemQty.toString(),
        reason: REASONS[0],
        user: 'Alex Morgan (Inventory Mgr)'
      });
      setErrors({});
    }
  }, [isOpen, preselectedProductId, products, warehouses]);

  const selectedProduct = products.find(p => p.id === formData.productId);
  const selectedWarehouse = warehouses.find(w => w.id === formData.warehouseId);

  const systemQuantity = selectedProduct?.stockByWarehouse?.[formData.warehouseId]?.quantity || 0;
  const countedQuantity = formData.countedQuantity !== '' ? Number(formData.countedQuantity) : NaN;
  const diff = !isNaN(countedQuantity) ? countedQuantity - systemQuantity : 0;

  const handleProductOrWarehouseChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      const prod = products.find(p => p.id === (field === 'productId' ? value : next.productId));
      const targetWhId = field === 'warehouseId' ? value : next.warehouseId;
      const sysQty = prod?.stockByWarehouse?.[targetWhId]?.quantity || 0;
      next.countedQuantity = sysQty.toString();
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'productId' || name === 'warehouseId') {
      handleProductOrWarehouseChange(name, value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.productId) newErrors.productId = 'Product is required';
    if (!formData.warehouseId) newErrors.warehouseId = 'Warehouse is required';
    if (formData.countedQuantity === '' || isNaN(Number(formData.countedQuantity)) || Number(formData.countedQuantity) < 0) {
      newErrors.countedQuantity = 'Physical count must be 0 or higher';
    }
    if (!formData.reason) newErrors.reason = 'Reason is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = addAdjustment({
        productId: formData.productId,
        warehouseId: formData.warehouseId,
        countedQuantity: parseInt(formData.countedQuantity, 10),
        reason: formData.reason,
        user: formData.user.trim() || 'Inventory Staff'
      });

      if (res.success) {
        toast.success('Inventory Adjusted', res.message);
        onClose();
      } else {
        toast.error('Adjustment Failed', res.message);
      }
    } catch (err) {
      toast.error('Adjustment Error', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Adjustment / Count"
      subtitle="Reconcile recorded system stock with actual physical warehouse count"
      icon={SlidersHorizontal}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product & Warehouse */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Select Product"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              error={errors.productId}
              required
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Select
              label="Count Location / Warehouse"
              name="warehouseId"
              value={formData.warehouseId}
              onChange={handleChange}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              error={errors.warehouseId}
              required
            />
          </div>
        </div>

        {/* System Stock vs Counted Stock */}
        <div className="p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="p-3 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-lg text-center">
              <span className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block mb-1">
                System On-Hand Stock
              </span>
              <span className="text-2xl font-black text-slate-800 dark:text-white">
                {systemQuantity} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{selectedProduct?.unit}</span>
              </span>
            </div>

            <div>
              <Input
                label={`Physical Count (${selectedProduct?.unit || 'Units'})`}
                name="countedQuantity"
                type="number"
                min="0"
                value={formData.countedQuantity}
                onChange={handleChange}
                error={errors.countedQuantity}
                required
              />
            </div>
          </div>

          {/* Calculated Adjustment Diff banner */}
          <div className={`p-3 rounded-lg border flex items-center justify-between text-xs font-semibold ${
            diff > 0
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : diff < 0
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-slate-100 dark:bg-[#1a1a1a] border-slate-200 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-200'
          }`}>
            <span className="flex items-center gap-1.5">
              {diff > 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : diff < 0 ? (
                <TrendingDown className="w-4 h-4 text-rose-600" />
              ) : null}
              {diff === 0 ? 'No discrepancy detected' : 'Calculated Stock Adjustment:'}
            </span>
            <span className="text-sm font-bold">
              {diff > 0 ? `+${diff}` : diff} {selectedProduct?.unit || 'Units'}
            </span>
          </div>
        </div>

        {/* Reason and User */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Adjustment Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              options={REASONS}
              error={errors.reason}
              required
            />
          </div>
          <div>
            <Input
              label="Auditor / Staff Name"
              name="user"
              value={formData.user}
              onChange={handleChange}
              placeholder="e.g. Alex Morgan (Inventory Mgr)"
              required
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#2a2a2a]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={Check}>
            Apply Stock Adjustment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
