import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
import { CATEGORIES, UNITS } from '../../data/mockData';
import { Package, Plus } from 'lucide-react';

export const ProductModal = ({
  isOpen,
  onClose,
  product = null // If null, mode is Add; if object, mode is Edit
}) => {
  const { addProduct, updateProduct, warehouses } = useInventory();
  const toast = useToast();

  const isEdit = !!product;

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: CATEGORIES[0],
    unit: UNITS[0],
    unitPrice: '',
    initialQuantity: '0',
    warehouseId: warehouses[0]?.id || 'WH-001',
    location: 'Rack A-01',
    reorderLevel: '10',
    supplier: '',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || CATEGORIES[0],
        unit: product.unit || UNITS[0],
        unitPrice: product.unitPrice?.toString() || '',
        initialQuantity: product.quantity?.toString() || '0',
        warehouseId: warehouses[0]?.id || 'WH-001',
        location: 'Rack A-01',
        reorderLevel: product.reorderLevel?.toString() || '10',
        supplier: product.supplier || '',
        description: product.description || ''
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: CATEGORIES[0],
        unit: UNITS[0],
        unitPrice: '',
        initialQuantity: '0',
        warehouseId: warehouses[0]?.id || 'WH-001',
        location: 'Rack A-01',
        reorderLevel: '10',
        supplier: '',
        description: ''
      });
    }
    setErrors({});
  }, [product, isOpen, warehouses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.unit) newErrors.unit = 'Unit is required';

    if (formData.reorderLevel === '' || isNaN(Number(formData.reorderLevel)) || Number(formData.reorderLevel) < 0) {
      newErrors.reorderLevel = 'Reorder level must be 0 or higher';
    }

    if (!isEdit) {
      if (formData.initialQuantity === '' || isNaN(Number(formData.initialQuantity)) || Number(formData.initialQuantity) < 0) {
        newErrors.initialQuantity = 'Initial quantity must be 0 or higher';
      }
    }

    if (formData.unitPrice !== '' && (isNaN(Number(formData.unitPrice)) || Number(formData.unitPrice) < 0)) {
      newErrors.unitPrice = 'Price must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (isEdit) {
        updateProduct(product.id, {
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          category: formData.category,
          unit: formData.unit,
          unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : 0,
          reorderLevel: parseInt(formData.reorderLevel, 10),
          supplier: formData.supplier.trim(),
          description: formData.description.trim()
        });
        toast.success('Product Updated', `${formData.name} has been updated successfully.`);
      } else {
        const newProd = addProduct({
          name: formData.name.trim(),
          sku: formData.sku.trim(),
          category: formData.category,
          unit: formData.unit,
          unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : 0,
          initialQuantity: parseInt(formData.initialQuantity, 10) || 0,
          warehouseId: formData.warehouseId,
          location: formData.location.trim() || 'Rack A-01',
          reorderLevel: parseInt(formData.reorderLevel, 10) || 10,
          supplier: formData.supplier.trim(),
          description: formData.description.trim()
        });
        toast.success('Product Added', `${newProd.name} added with SKU ${newProd.sku}`);
      }
      onClose();
    } catch (err) {
      toast.error('Operation Failed', err.message || 'Unable to save product.');
    }
  };

  const selectedWarehouse = warehouses.find(w => w.id === formData.warehouseId);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Add New Product'}
      subtitle={isEdit ? `Updating product details for SKU ${product?.sku}` : 'Register a new stock item into your inventory'}
      icon={Package}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Name and SKU */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Product Name"
              name="name"
              placeholder="e.g. High Tensile Steel Rods"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
          </div>
          <div>
            <Input
              label="SKU / Barcode"
              name="sku"
              placeholder="Auto or e.g. RAW-STL-01"
              value={formData.sku}
              onChange={handleChange}
              helperText={!isEdit ? 'Leave blank to auto-generate' : ''}
            />
          </div>
        </div>

        {/* Row 2: Category and Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORIES}
              required
            />
          </div>
          <div>
            <Select
              label="Unit of Measure"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              options={UNITS}
              required
            />
          </div>
          <div>
            <Input
              label="Unit Price ($)"
              name="unitPrice"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.unitPrice}
              onChange={handleChange}
              error={errors.unitPrice}
            />
          </div>
        </div>

        {/* Row 3: Initial Stock & Location (Only for Add mode) */}
        {!isEdit && (
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                Initial Stock Placement
              </span>
              <span className="text-[11px] text-slate-500">Will be logged in Move History</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Input
                  label="Initial Quantity"
                  name="initialQuantity"
                  type="number"
                  min="0"
                  value={formData.initialQuantity}
                  onChange={handleChange}
                  error={errors.initialQuantity}
                  required
                />
              </div>
              <div>
                <Select
                  label="Primary Warehouse"
                  name="warehouseId"
                  value={formData.warehouseId}
                  onChange={handleChange}
                  options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                />
              </div>
              <div>
                <Input
                  label="Rack / Bin Location"
                  name="location"
                  placeholder="e.g. Rack A-01"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Row 4: Reorder Level & Supplier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Reorder Alert Threshold"
              name="reorderLevel"
              type="number"
              min="0"
              placeholder="10"
              value={formData.reorderLevel}
              onChange={handleChange}
              error={errors.reorderLevel}
              helperText="Status marks as Low Stock below this quantity"
              required
            />
          </div>
          <div>
            <Input
              label="Preferred Supplier"
              name="supplier"
              placeholder="e.g. Acme Industrial Supply"
              value={formData.supplier}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Row 5: Description */}
        <div>
          <Input
            label="Product Notes / Description"
            name="description"
            placeholder="Specifications, handling instructions, or dimensions..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={isEdit ? null : Plus}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
