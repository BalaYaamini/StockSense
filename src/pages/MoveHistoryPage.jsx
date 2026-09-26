import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { DataTable } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useInventory } from '../hooks/useInventory';
import { useToast } from '../hooks/useToast';
import { formatDateTime, formatNumber } from '../utils/formatters';

export const MoveHistoryPage = () => {
  const { moveHistory, products } = useInventory();
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedProductId, setSelectedProductId] = useState('ALL');

  // Filtered Move History list (Chronological, newest first)
  const filteredMoves = useMemo(() => {
    return moveHistory.filter((move) => {
      // Search
      const matchSearch =
        searchQuery.trim() === '' ||
        move.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        move.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        move.referenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        move.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        move.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (move.user && move.user.toLowerCase().includes(searchQuery.toLowerCase()));

      // Type filter
      const matchType =
        selectedType === 'ALL' || move.type === selectedType;

      // Product filter
      const matchProduct =
        selectedProductId === 'ALL' || move.productId === selectedProductId;

      return matchSearch && matchType && matchProduct;
    });
  }, [moveHistory, searchQuery, selectedType, selectedProductId]);

  const handleExportCSV = () => {
    try {
      const headers = ['Date', 'Type', 'Product', 'SKU', 'Quantity', 'Unit', 'Source', 'Destination', 'Reference ID', 'User', 'Notes'];
      const rows = filteredMoves.map(m => [
        m.date,
        m.type,
        `"${m.productName}"`,
        m.sku,
        m.quantity,
        m.unit,
        `"${m.source}"`,
        `"${m.destination}"`,
        m.referenceId,
        `"${m.user || ''}"`,
        `"${m.notes || ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `stocksense_ledger_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Ledger Exported', `Downloaded ${filteredMoves.length} movements to CSV.`);
    } catch (err) {
      toast.error('Export Failed', err.message);
    }
  };

  const columns = [
    {
      header: 'Timestamp',
      key: 'date',
      render: (val) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200 block">{formatDateTime(val)}</span>
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">Ledger Entry</span>
        </div>
      )
    },
    {
      header: 'Operation Type',
      key: 'type',
      render: (val) => <Badge variant={val} />
    },
    {
      header: 'Product & SKU',
      key: 'productName',
      render: (val, row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white text-xs">{val}</p>
          <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500">{row.sku}</span>
        </div>
      )
    },
    {
      header: 'Movement Qty',
      key: 'quantity',
      render: (val, row) => {
        const isPos = val > 0;
        const isNeg = val < 0;

        return (
          <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg inline-block ${
            row.type === 'TRANSFER'
              ? 'text-indigo-700 bg-indigo-50 border border-indigo-200/60'
              : isPos
              ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
              : isNeg
              ? 'text-rose-700 bg-rose-50 border border-rose-200/60'
              : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-[#1a1a1a]'
          }`}>
            {row.type === 'TRANSFER' ? '⇄ ' : isPos ? '+' : ''}
            {formatNumber(val)} {row.unit}
          </span>
        );
      }
    },
    {
      header: 'Source → Destination',
      key: 'source',
      render: (val, row) => (
        <div className="text-xs min-w-[200px]">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold">From:</span>
            <span className="font-medium truncate">{val}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold mt-0.5">
            <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold">To:</span>
            <span className="truncate">{row.destination}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Operator / Staff',
      key: 'user',
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {val || 'System'}
        </span>
      )
    },
    {
      header: 'Ref ID',
      key: 'referenceId',
      align: 'right',
      headerAlign: 'right',
      render: (val, row) => (
        <div className="text-right text-xs">
          <span className="font-mono font-bold text-slate-800 dark:text-white">{val}</span>
          {row.notes && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[140px] ml-auto">{row.notes}</p>}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Inventory Ledger & Move History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable audit trail of all receipts, deliveries, internal transfers, and physical counts
          </p>
        </div>

        <Button
          variant="secondary"
          icon={FileSpreadsheet}
          onClick={handleExportCSV}
          className="self-start sm:self-auto text-slate-700 dark:text-slate-300 bg-white dark:bg-[#121212] hover:bg-slate-50 dark:hover:bg-[#1a1a1a] border-slate-200 dark:border-[#2a2a2a]"
        >
          Export CSV Ledger
        </Button>
      </div>

      {/* Filter Controls */}
      <div className="p-4 bg-white dark:bg-[#121212] rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] shadow-card flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <Input
            placeholder="Search by product, SKU, Ref ID, location, or staff..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Movement Type Filter */}
          <div className="min-w-[150px]">
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="ALL">All Types</option>
              <option value="RECEIPT">Receipts (+)</option>
              <option value="DELIVERY">Deliveries (-)</option>
              <option value="TRANSFER">Transfers (⇄)</option>
              <option value="ADJUSTMENT">Adjustments</option>
              <option value="INITIAL">Initial Stock</option>
            </Select>
          </div>

          {/* Product Filter */}
          <div className="min-w-[180px]">
            <Select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="ALL">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </Select>
          </div>

          {(searchQuery || selectedType !== 'ALL' || selectedProductId !== 'ALL') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
                setSelectedProductId('ALL');
              }}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Ledger Table */}
      <DataTable
        columns={columns}
        data={filteredMoves}
        keyField="id"
        pageSize={12}
        emptyMessage="No movement entries found"
        emptySubtext="Stock movements will automatically appear here as operations are processed."
      />
    </div>
  );
};
