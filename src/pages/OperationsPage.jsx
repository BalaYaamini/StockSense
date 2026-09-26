import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Tabs } from '../components/common/Tabs';
import { DataTable } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../hooks/useToast';
import { formatDate, formatDateTime, formatNumber } from '../utils/formatters';

export const OperationsPage = ({
  initialTab = 'receipts',
  onOpenReceiptModal,
  onOpenDeliveryModal,
  onOpenTransferModal,
  onOpenAdjustmentModal
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const {
    receipts,
    deliveries,
    transfers,
    adjustments,
    validateReceipt,
    cancelReceipt,
    validateDelivery,
    cancelDelivery,
    summary
  } = useInventory();
  const toast = useToast();

  const handleValidateReceipt = (id) => {
    const res = validateReceipt(id);
    if (res.success) {
      toast.success('Stock Received', res.message);
    } else {
      toast.error('Validation Failed', res.message);
    }
  };

  const handleCancelReceipt = (id) => {
    if (window.confirm('Are you sure you want to cancel this pending receipt?')) {
      cancelReceipt(id);
      toast.info('Receipt Cancelled', 'Receipt was marked as cancelled.');
    }
  };

  const handleValidateDelivery = (id) => {
    const res = validateDelivery(id);
    if (res.success) {
      toast.success('Delivery Dispatched', res.message);
    } else {
      toast.error('Dispatch Blocked', res.message);
    }
  };

  const handleCancelDelivery = (id) => {
    if (window.confirm('Are you sure you want to cancel this pending delivery?')) {
      cancelDelivery(id);
      toast.info('Delivery Cancelled', 'Delivery order was cancelled.');
    }
  };

  const TABS_CONFIG = [
    {
      id: 'receipts',
      label: 'Receipts',
      icon: ArrowDownRight,
      count: summary.receiptsStats.pending > 0 ? summary.receiptsStats.pending : undefined
    },
    {
      id: 'deliveries',
      label: 'Deliveries',
      icon: ArrowUpRight,
      count: summary.deliveriesStats.pending > 0 ? summary.deliveriesStats.pending : undefined
    },
    {
      id: 'transfers',
      label: 'Internal Transfers',
      icon: ArrowLeftRight,
      count: summary.transfersStats.inTransit > 0 ? summary.transfersStats.inTransit : undefined
    },
    {
      id: 'adjustments',
      label: 'Stock Adjustments',
      icon: SlidersHorizontal
    }
  ];

  // Columns for RECEIPTS
  const receiptColumns = [
    {
      header: 'Receipt ID',
      key: 'id',
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">{val}</span>
          {row.notes && <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{row.notes}</p>}
        </div>
      )
    },
    {
      header: 'Supplier',
      key: 'supplier',
      render: (val) => <span className="font-semibold text-slate-800 text-xs">{val}</span>
    },
    {
      header: 'Product',
      key: 'productName',
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{val}</p>
          <span className="font-mono text-[11px] text-slate-400">{row.sku}</span>
        </div>
      )
    },
    {
      header: 'Quantity',
      key: 'quantity',
      render: (val, row) => (
        <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs">
          +{formatNumber(val)} {row.unit}
        </span>
      )
    },
    {
      header: 'Destination',
      key: 'warehouseName',
      render: (val, row) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800 block">{val}</span>
          <span className="text-[11px] text-slate-400">{row.location || 'Receiving Bay'}</span>
        </div>
      )
    },
    {
      header: 'Scheduled Date',
      key: 'scheduledDate',
      render: (val) => (
        <span className="text-xs text-slate-600 font-medium">
          {formatDate(val)}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <Badge variant={val} dot />
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      headerAlign: 'right',
      render: (_, row) => {
        if (row.status === 'DONE') {
          return (
            <span className="text-[11px] text-slate-400 italic">
              Completed {row.completedDate ? formatDate(row.completedDate) : ''}
            </span>
          );
        }
        if (row.status === 'CANCELLED') {
          return <span className="text-[11px] text-rose-400 italic">Cancelled</span>;
        }

        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="success"
              size="sm"
              icon={CheckCircle2}
              onClick={() => handleValidateReceipt(row.id)}
              className="py-1 px-2.5 text-xs shadow-xs"
            >
              Validate
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleCancelReceipt(row.id)}
              className="text-slate-400 hover:text-rose-600"
              title="Cancel Receipt"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  // Columns for DELIVERIES
  const deliveryColumns = [
    {
      header: 'Delivery ID',
      key: 'id',
      render: (val, row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 text-xs">{val}</span>
          {row.notes && <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{row.notes}</p>}
        </div>
      )
    },
    {
      header: 'Customer',
      key: 'customer',
      render: (val) => <span className="font-semibold text-slate-800 text-xs">{val}</span>
    },
    {
      header: 'Product',
      key: 'productName',
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{val}</p>
          <span className="font-mono text-[11px] text-slate-400">{row.sku}</span>
        </div>
      )
    },
    {
      header: 'Quantity',
      key: 'quantity',
      render: (val, row) => (
        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md text-xs">
          -{formatNumber(val)} {row.unit}
        </span>
      )
    },
    {
      header: 'Source Warehouse',
      key: 'warehouseName',
      render: (val) => <span className="text-xs font-medium text-slate-800">{val}</span>
    },
    {
      header: 'Scheduled Date',
      key: 'scheduledDate',
      render: (val) => (
        <span className="text-xs text-slate-600 font-medium">
          {formatDate(val)}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <Badge variant={val} dot />
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      headerAlign: 'right',
      render: (_, row) => {
        if (row.status === 'DONE') {
          return (
            <span className="text-[11px] text-slate-400 italic">
              Dispatched {row.completedDate ? formatDate(row.completedDate) : ''}
            </span>
          );
        }
        if (row.status === 'CANCELLED') {
          return <span className="text-[11px] text-rose-400 italic">Cancelled</span>;
        }

        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={() => handleValidateDelivery(row.id)}
              className="py-1 px-2.5 text-xs shadow-xs"
            >
              Validate
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => handleCancelDelivery(row.id)}
              className="text-slate-400 hover:text-rose-600"
              title="Cancel Delivery"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        );
      }
    }
  ];

  // Columns for INTERNAL TRANSFERS
  const transferColumns = [
    {
      header: 'Transfer ID',
      key: 'id',
      render: (val) => <span className="font-mono font-bold text-slate-900 text-xs">{val}</span>
    },
    {
      header: 'Product',
      key: 'productName',
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{val}</p>
          <span className="font-mono text-[11px] text-slate-400">{row.sku}</span>
        </div>
      )
    },
    {
      header: 'Quantity',
      key: 'quantity',
      render: (val, row) => (
        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-xs">
          ⇄ {formatNumber(val)} {row.unit}
        </span>
      )
    },
    {
      header: 'Source (From)',
      key: 'sourceWarehouseName',
      render: (val) => <span className="text-xs font-semibold text-slate-700">{val}</span>
    },
    {
      header: 'Destination (To)',
      key: 'destWarehouseName',
      render: (val) => <span className="text-xs font-semibold text-slate-900">{val}</span>
    },
    {
      header: 'Date',
      key: 'date',
      render: (val) => <span className="text-xs text-slate-500">{formatDate(val)}</span>
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <Badge variant={val} dot />
    }
  ];

  // Columns for ADJUSTMENTS
  const adjustmentColumns = [
    {
      header: 'Adjustment ID',
      key: 'id',
      render: (val) => <span className="font-mono font-bold text-slate-900 text-xs">{val}</span>
    },
    {
      header: 'Product',
      key: 'productName',
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{val}</p>
          <span className="font-mono text-[11px] text-slate-400">{row.sku}</span>
        </div>
      )
    },
    {
      header: 'Warehouse',
      key: 'warehouseName',
      render: (val) => <span className="text-xs font-medium text-slate-800">{val}</span>
    },
    {
      header: 'System → Counted',
      key: 'countedQuantity',
      render: (val, row) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.systemQuantity} → <strong className="text-slate-900 font-bold">{val}</strong> {row.unit}
        </span>
      )
    },
    {
      header: 'Net Difference',
      key: 'difference',
      render: (val, row) => (
        <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md ${
          val > 0
            ? 'text-emerald-700 bg-emerald-50'
            : val < 0
            ? 'text-rose-700 bg-rose-50'
            : 'text-slate-600 bg-slate-100'
        }`}>
          {val > 0 ? `+${val}` : val} {row.unit}
        </span>
      )
    },
    {
      header: 'Reason',
      key: 'reason',
      render: (val) => <span className="text-xs text-slate-600">{val}</span>
    },
    {
      header: 'Date / Staff',
      key: 'date',
      render: (val, row) => (
        <div className="text-xs">
          <span className="text-slate-600 block">{formatDate(val)}</span>
          <span className="text-[11px] text-slate-400">{row.user}</span>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory Operations Hub
          </h2>
          <p className="text-xs text-slate-500">
            Execute receipts, outbound delivery dispatches, transfers, and inventory audits
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'receipts' && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => onOpenReceiptModal()}
              className="coral-glow"
            >
              Add Receipt
            </Button>
          )}

          {activeTab === 'deliveries' && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => onOpenDeliveryModal()}
              className="coral-glow"
            >
              Add Delivery
            </Button>
          )}

          {activeTab === 'transfers' && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => onOpenTransferModal()}
              className="coral-glow"
            >
              New Transfer
            </Button>
          )}

          {activeTab === 'adjustments' && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => onOpenAdjustmentModal()}
              className="coral-glow"
            >
              New Adjustment
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="overflow-x-auto pb-1">
        <Tabs
          tabs={TABS_CONFIG}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tab Content Tables */}
      {activeTab === 'receipts' && (
        <DataTable
          columns={receiptColumns}
          data={receipts}
          keyField="id"
          pageSize={8}
          emptyMessage="No receipts recorded"
          emptySubtext="Click 'Add Receipt' to record incoming supplier shipments."
        />
      )}

      {activeTab === 'deliveries' && (
        <DataTable
          columns={deliveryColumns}
          data={deliveries}
          keyField="id"
          pageSize={8}
          emptyMessage="No delivery orders found"
          emptySubtext="Click 'Add Delivery' to create outbound shipments."
        />
      )}

      {activeTab === 'transfers' && (
        <DataTable
          columns={transferColumns}
          data={transfers}
          keyField="id"
          pageSize={8}
          emptyMessage="No internal transfers recorded"
          emptySubtext="Transfer inventory between warehouses while keeping total company stock balanced."
        />
      )}

      {activeTab === 'adjustments' && (
        <DataTable
          columns={adjustmentColumns}
          data={adjustments}
          keyField="id"
          pageSize={8}
          emptyMessage="No stock adjustments made"
          emptySubtext="Perform cycle counts or reconcile damaged/missing inventory."
        />
      )}
    </div>
  );
};
