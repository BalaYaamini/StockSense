import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  SlidersHorizontal,
  Edit2,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  QrCode,
  Sparkles,
  Building2,
  DollarSign
} from 'lucide-react';
import { DataTable } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { BarcodeLabelModal } from '../components/modals/BarcodeLabelModal';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../hooks/useToast';
import { CATEGORIES } from '../data/mockData';
import { formatCurrency, formatNumber } from '../utils/formatters';

export const ProductsPage = ({
  onOpenProductModal,
  onOpenReceiptModal,
  onOpenDeliveryModal,
  onOpenAdjustmentModal,
  onOpenReplenishmentModal,
  initialFilter = 'ALL'
}) => {
  const {
    products,
    warehouses,
    activeWarehouseId,
    deleteProduct,
    summary
  } = useInventory();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [barcodeLabelProduct, setBarcodeLabelProduct] = useState(null);

  // Filtered Products List
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search query
      const matchSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.supplier && p.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchCategory =
        selectedCategory === 'ALL' || p.category === selectedCategory;

      // Status filter
      const matchStatus =
        statusFilter === 'ALL' || p.status === statusFilter;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [products, searchQuery, selectedCategory, statusFilter]);

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    const target = products.find((p) => p.id === deleteTargetId);
    deleteProduct(deleteTargetId);
    toast.success('Product Deleted', `${target?.name || 'Product'} has been removed.`);
    setDeleteTargetId(null);
  };

  const columns = [
    {
      header: 'Product Info',
      key: 'name',
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0 border border-slate-200">
            {row.category.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 leading-snug">{row.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-slate-500">{row.sku}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">{row.category}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'On-Hand Stock',
      key: 'quantity',
      render: (val, row) => (
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-extrabold text-slate-900 font-mono">
              {formatNumber(val)}
            </span>
            <span className="text-xs text-slate-500 font-medium">{row.unit}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Min Threshold: {row.reorderLevel} {row.unit}
          </p>
        </div>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <Badge variant={val} dot />
    },
    {
      header: 'Warehouse Placement',
      key: 'stockByWarehouse',
      render: (val, row) => {
        if (activeWarehouseId !== 'ALL') {
          const loc = row.stockByWarehouse?.[activeWarehouseId]?.location || 'Default';
          return (
            <div className="text-xs">
              <span className="font-semibold text-slate-700 block">{loc}</span>
              <span className="text-slate-400 text-[11px]">Primary Location</span>
            </div>
          );
        }

        const activeCount = Object.values(row.stockByWarehouse || {}).filter(
          (s) => s.quantity > 0
        ).length;

        return (
          <div className="text-xs">
            <span className="font-semibold text-slate-700 block">
              {activeCount} of {warehouses.length} Warehouses
            </span>
            <span className="text-slate-400 text-[11px]">Distributed Storage</span>
          </div>
        );
      }
    },
    {
      header: 'Unit Price',
      key: 'unitPrice',
      align: 'right',
      headerAlign: 'right',
      render: (val, row) => (
        <div className="text-right">
          <span className="font-bold text-slate-900 text-xs">
            {formatCurrency(val)}
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Total: {formatCurrency(row.totalValue)}
          </p>
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      headerAlign: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setBarcodeLabelProduct(row)}
            title="Print Barcode Tag"
            className="p-1.5 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <QrCode className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenReceiptModal(row.id)}
            title="Receive Stock"
            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <ArrowDownRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenDeliveryModal(row.id)}
            title="Dispatch Delivery"
            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenAdjustmentModal(row.id)}
            title="Adjust Stock"
            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenProductModal(row)}
            title="Edit Product"
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTargetId(row.id)}
            title="Delete Product"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory Catalog ({products.length})
          </h2>
          <p className="text-xs text-slate-500">
            Real-time physical quantities, valuations, and replenishment control
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {summary.lowStockCount > 0 && onOpenReplenishmentModal && (
            <Button
              variant="secondary"
              icon={Sparkles}
              onClick={onOpenReplenishmentModal}
              className="bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100"
            >
              Smart Replenishment ({summary.lowStockCount})
            </Button>
          )}

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => onOpenProductModal()}
            className="coral-glow"
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-card flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search by name, SKU, or supplier..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <div className="min-w-[150px]">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="IN_STOCK">In Stock ({summary.inStockCount})</option>
              <option value="LOW_STOCK">Low Stock ({summary.lowStockCount})</option>
              <option value="OUT_OF_STOCK">Out of Stock ({summary.outOfStockCount})</option>
            </Select>
          </div>

          {(searchQuery || selectedCategory !== 'ALL' || statusFilter !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setStatusFilter('ALL');
              }}
              className="text-slate-500 hover:text-slate-800 text-xs"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Table Component */}
      <DataTable
        columns={columns}
        data={filteredProducts}
        keyField="id"
        pageSize={10}
        emptyMessage="No matching products found"
        emptySubtext="Try adjusting your search query, status filters, or add a new product."
      />

      {/* Barcode Label Modal */}
      <BarcodeLabelModal
        isOpen={!!barcodeLabelProduct}
        onClose={() => setBarcodeLabelProduct(null)}
        product={barcodeLabelProduct}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? All historical references will remain in the Move History ledger, but the product will be removed from catalog views."
        confirmText="Delete Product"
        variant="danger"
      />
    </div>
  );
};
