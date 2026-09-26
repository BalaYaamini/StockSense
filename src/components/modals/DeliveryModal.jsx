import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
import { ArrowUpRight, AlertTriangle, Send } from 'lucide-react';

export const DeliveryModal = ({
  isOpen,
  onClose,
  preselectedProductId = null
}) => {
  const { products, warehouses, addDelivery, validateDelivery } = useInventory();
  const toast = useToast();

  const [formData, setFormData] = useState({
    productId: '',
    customer: '',
    quantity: '5',
    warehouseId: warehouses[0]?.id || 'WH-001',
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
    validateImmediately: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initialProdId = preselectedProductId || (products[0] ? products[0].id : '');
      const whId = warehouses[0]?.id || 'WH-001';

      setFormData({
        productId: initialProdId,
        customer: '',
        quantity: '5',
        warehouseId: whId,
        scheduledDate: new Date().toISOString().split('T')[0],
        notes: '',
        validateImmediately: true
      });
      setErrors({});
    }
  }, [isOpen, preselectedProductId, products, warehouses]);

  const selectedProduct = products.find(p => p.id === formData.productId);
  const selectedWarehouse = warehouses.find(w => w.id === formData.warehouseId);

  // Available stock in selected warehouse
  const availableStock = selectedProduct?.stockByWarehouse?.[formData.warehouseId]?.quantity || 0;
  const requestedQty = parseInt(formData.quantity, 10) || 0;
  const isInsufficient = requestedQty > availableStock;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.productId) newErrors.productId = 'Please select a product';
    if (!formData.customer.trim()) newErrors.customer = 'Customer name is required';
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.warehouseId) newErrors.warehouseId = 'Warehouse is required';

    if (formData.validateImmediately && requestedQty > availableStock) {
      newErrors.quantity = `Insufficient stock! Only ${availableStock} ${selectedProduct?.unit || 'units'} available in ${selectedWarehouse?.name}.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const delivery = addDelivery({
        productId: formData.productId,
        customer: formData.customer.trim(),
        quantity: requestedQty,
        warehouseId: formData.warehouseId,
        scheduledDate: formData.scheduledDate,
        notes: formData.notes.trim(),
        status: formData.validateImmediately ? 'WAITING' : 'DRAFT'
      });

      if (formData.validateImmediately) {
        const res = validateDelivery(delivery.id);
        if (res.success) {
          toast.success('Delivery Dispatched', res.message);
        } else {
          toast.error('Dispatch Blocked', res.message);
        }
      } else {
        toast.info('Delivery Order Created', `Order ${delivery.id} saved as Waiting.`);
      }

      onClose();
    } catch (err) {
      toast.error('Failed to create delivery', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Delivery Order"
      subtitle="Dispatch outbound stock to customers and decrease on-hand inventory"
      icon={ArrowUpRight}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Selector */}
        <div>
          <Select
            label="Product to Dispatch"
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            error={errors.productId}
            required
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Total Stock: {p.totalCompanyQuantity} {p.unit}
              </option>
            ))}
          </Select>
        </div>

        {/* Warehouse Selection with Live Stock Feedback */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Fulfillment Warehouse"
              name="warehouseId"
              value={formData.warehouseId}
              onChange={handleChange}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              required
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
              availableStock === 0
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : availableStock <= (selectedProduct?.reorderLevel || 10)
                ? 'bg-amber-50 border-amber-200 text-amber-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}>
              <span className="font-medium">Available at {selectedWarehouse?.code || 'Warehouse'}:</span>
              <span className="font-bold text-sm">
                {availableStock} {selectedProduct?.unit || 'Units'}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Customer / Client Name"
              name="customer"
              placeholder="e.g. BuildCorp Infrastructure LLC"
              value={formData.customer}
              onChange={handleChange}
              error={errors.customer}
              required
            />
          </div>
          <div>
            <Input
              label={`Dispatch Quantity (${selectedProduct?.unit || 'Units'})`}
              name="quantity"
              type="number"
              min="1"
              max={availableStock > 0 ? availableStock : undefined}
              value={formData.quantity}
              onChange={handleChange}
              error={errors.quantity}
              required
            />
          </div>
        </div>

        {isInsufficient && formData.validateImmediately && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>Warning: Quantity exceeds available stock ({availableStock} {selectedProduct?.unit}) in this warehouse.</span>
          </div>
        )}

        {/* Scheduled Date & SO Ref */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Delivery / Dispatch Date"
              name="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Input
              label="Sales Order (SO) Reference"
              name="notes"
              placeholder="e.g. SO-1094"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Immediate validation checkbox */}
        <div className="p-3.5 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#2a2a2a] flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="validateImmediately"
              checked={formData.validateImmediately}
              onChange={handleChange}
              className="w-4 h-4 text-sage-600 rounded border-slate-300 focus:ring-sage-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Validate & dispatch immediately (deduct stock)
            </span>
          </label>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#2a2a2a]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={Send}
            disabled={formData.validateImmediately && (availableStock === 0 || requestedQty > availableStock)}
          >
            {formData.validateImmediately ? 'Dispatch & Deduct Stock' : 'Create Pending Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
