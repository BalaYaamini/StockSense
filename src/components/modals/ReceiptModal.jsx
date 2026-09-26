import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
import { ArrowDownRight, CheckCircle2 } from 'lucide-react';

export const ReceiptModal = ({
  isOpen,
  onClose,
  preselectedProductId = null
}) => {
  const { products, warehouses, addReceipt, validateReceipt } = useInventory();
  const toast = useToast();

  const [formData, setFormData] = useState({
    productId: '',
    supplier: '',
    quantity: '10',
    warehouseId: warehouses[0]?.id || 'WH-001',
    location: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
    validateImmediately: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const initialProdId = preselectedProductId || (products[0] ? products[0].id : '');
      const selectedProd = products.find(p => p.id === initialProdId);
      const whId = warehouses[0]?.id || 'WH-001';

      setFormData({
        productId: initialProdId,
        supplier: selectedProd?.supplier || '',
        quantity: '10',
        warehouseId: whId,
        location: selectedProd?.stockByWarehouse?.[whId]?.location || 'Receiving Bay',
        scheduledDate: new Date().toISOString().split('T')[0],
        notes: '',
        validateImmediately: true
      });
      setErrors({});
    }
  }, [isOpen, preselectedProductId, products, warehouses]);

  const selectedProduct = products.find(p => p.id === formData.productId);
  const selectedWarehouse = warehouses.find(w => w.id === formData.warehouseId);

  const handleProductChange = (e) => {
    const pId = e.target.value;
    const prod = products.find(p => p.id === pId);
    setFormData(prev => ({
      ...prev,
      productId: pId,
      supplier: prod?.supplier || prev.supplier,
      location: prod?.stockByWarehouse?.[prev.warehouseId]?.location || prev.location
    }));
  };

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
    if (!formData.supplier.trim()) newErrors.supplier = 'Supplier name is required';
    if (!formData.quantity || isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.warehouseId) newErrors.warehouseId = 'Warehouse is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const qty = parseInt(formData.quantity, 10);
      const receipt = addReceipt({
        productId: formData.productId,
        supplier: formData.supplier.trim(),
        quantity: qty,
        warehouseId: formData.warehouseId,
        location: formData.location.trim() || 'Receiving Bay',
        scheduledDate: formData.scheduledDate,
        notes: formData.notes.trim(),
        status: formData.validateImmediately ? 'READY' : 'DRAFT'
      });

      if (formData.validateImmediately) {
        const res = validateReceipt(receipt.id);
        if (res.success) {
          toast.success('Stock Received & Validated', res.message);
        } else {
          toast.warning('Receipt Created as Pending', res.message);
        }
      } else {
        toast.info('Receipt Created', `Receipt ${receipt.id} saved in Drafts.`);
      }

      onClose();
    } catch (err) {
      toast.error('Failed to create receipt', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Goods Receipt"
      subtitle="Receive inbound inventory from suppliers and increase stock levels"
      icon={ArrowDownRight}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Selector */}
        <div>
          <Select
            label="Product to Receive"
            name="productId"
            value={formData.productId}
            onChange={handleProductChange}
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

        {/* Supplier & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Supplier / Vendor"
              name="supplier"
              placeholder="e.g. Acme Steel & Forgings"
              value={formData.supplier}
              onChange={handleChange}
              error={errors.supplier}
              required
            />
          </div>
          <div>
            <Input
              label={`Received Quantity (${selectedProduct?.unit || 'Units'})`}
              name="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              error={errors.quantity}
              required
            />
          </div>
        </div>

        {/* Warehouse & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Select
              label="Destination Warehouse"
              name="warehouseId"
              value={formData.warehouseId}
              onChange={handleChange}
              options={warehouses.map(w => ({ value: w.id, label: w.name }))}
              required
            />
          </div>
          <div>
            <Input
              label="Shelving Rack / Bay"
              name="location"
              placeholder="e.g. Rack A-01"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Scheduled Date & Reference */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Scheduled / Receipt Date"
              name="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Input
              label="PO / Invoice Reference"
              name="notes"
              placeholder="e.g. PO-88214"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Immediate validation checkbox */}
        <div className="p-3.5 bg-sage-50/50 dark:bg-[#1a1a1a] rounded-xl border border-sage-100 dark:border-[#2a2a2a] flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              name="validateImmediately"
              checked={formData.validateImmediately}
              onChange={handleChange}
              className="w-4 h-4 text-sage-600 rounded border-slate-300 focus:ring-sage-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Validate & increase inventory immediately
            </span>
          </label>
          <span className="text-[11px] font-medium text-sage-700 bg-sage-100/60 px-2 py-0.5 rounded-full">
            Recommended
          </span>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-[#2a2a2a]">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={CheckCircle2}>
            {formData.validateImmediately ? 'Receive & Update Stock' : 'Save as Pending'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
