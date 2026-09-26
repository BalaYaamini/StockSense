import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
import { Warehouse, Plus } from 'lucide-react';

export const WarehouseModal = ({
  isOpen,
  onClose,
  warehouse = null
}) => {
  const { addWarehouse, updateWarehouse } = useInventory();
  const toast = useToast();
  const isEdit = !!warehouse;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    locations: 'Rack A-01, Rack A-02, Rack B-01, Staging Bay'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || '',
        code: warehouse.code || '',
        address: warehouse.address || '',
        locations: warehouse.locations ? warehouse.locations.join(', ') : ''
      });
    } else {
      setFormData({
        name: '',
        code: '',
        address: '',
        locations: 'Rack A-01, Rack A-02, Rack B-01, Staging Bay'
      });
    }
    setErrors({});
  }, [warehouse, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Warehouse name is required';
    if (!formData.code.trim()) newErrors.code = 'Warehouse code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const locationList = formData.locations
        .split(',')
        .map(l => l.trim())
        .filter(Boolean);

      if (isEdit) {
        updateWarehouse(warehouse.id, {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          address: formData.address.trim(),
          locations: locationList.length > 0 ? locationList : ['Rack A-01', 'Staging Bay']
        });
        toast.success('Warehouse Updated', `${formData.name} was updated successfully.`);
      } else {
        const created = addWarehouse({
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          address: formData.address.trim(),
          locations: locationList.length > 0 ? locationList : ['Rack A-01', 'Staging Bay']
        });
        toast.success('Warehouse Created', `${created.name} (${created.code}) created successfully.`);
      }

      onClose();
    } catch (err) {
      toast.error('Failed to save warehouse', err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Warehouse' : 'Add New Warehouse'}
      subtitle={isEdit ? 'Update warehouse facility details and locations' : 'Register a new storage location or distribution facility'}
      icon={Warehouse}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Warehouse Name"
              name="name"
              placeholder="e.g. South Regional Hub"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
          </div>
          <div>
            <Input
              label="Code"
              name="code"
              placeholder="e.g. WH-SOUTH"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              required
            />
          </div>
        </div>

        <div>
          <Input
            label="Street Address / Facility Location"
            name="address"
            placeholder="e.g. 742 Evergreen Logistics Blvd, Austin, TX"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div>
          <Input
            label="Storage Racks & Locations (Comma-separated)"
            name="locations"
            placeholder="Rack A-01, Rack A-02, Bulk Floor, Cold Bay"
            value={formData.locations}
            onChange={handleChange}
            helperText="Define storage zones, shelving rows, and staging areas."
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={isEdit ? null : Plus}>
            {isEdit ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
