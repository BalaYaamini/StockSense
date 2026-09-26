import React, { useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { QrCode, Printer, Download, Package } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { formatCurrency } from '../../utils/formatters';

export const BarcodeLabelModal = ({
  isOpen,
  onClose,
  product = null
}) => {
  const toast = useToast();
  const printRef = useRef(null);

  if (!product) return null;

  const handlePrint = () => {
    window.print();
    toast.success('Label Sent to Printer', `Printing barcode tag for ${product.sku}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Printable Barcode & Bin Tag"
      subtitle={`Generate industrial barcode label for SKU ${product.sku}`}
      icon={QrCode}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Printable Label Preview Card */}
        <div
          ref={printRef}
          className="p-6 bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center text-center space-y-3 shadow-sm print:border-none print:shadow-none"
        >
          <div className="w-full flex items-center justify-between border-b pb-2 border-slate-200 text-left">
            <div>
              <span className="font-extrabold text-xs tracking-tight text-slate-900">
                Stock<span className="text-coral-500">Sense</span> IMS
              </span>
              <p className="text-[10px] text-slate-500">{product.category}</p>
            </div>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {formatCurrency(product.unitPrice)}
            </span>
          </div>

          <div>
            <h4 className="font-extrabold text-base text-slate-900 leading-tight">
              {product.name}
            </h4>
            <p className="text-xs font-mono font-bold text-slate-700 tracking-wider mt-1">
              SKU: {product.sku}
            </p>
          </div>

          {/* Realistic SVG Barcode Representation */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 w-full flex flex-col items-center">
            <svg
              className="w-full h-14"
              viewBox="0 0 200 60"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Barcode lines */}
              <rect x="10" y="5" width="3" height="40" fill="#0f172a" />
              <rect x="15" y="5" width="2" height="40" fill="#0f172a" />
              <rect x="20" y="5" width="4" height="40" fill="#0f172a" />
              <rect x="27" y="5" width="1" height="40" fill="#0f172a" />
              <rect x="31" y="5" width="3" height="40" fill="#0f172a" />
              <rect x="37" y="5" width="5" height="40" fill="#0f172a" />
              <rect x="45" y="5" width="2" height="40" fill="#0f172a" />
              <rect x="50" y="5" width="4" height="40" fill="#0f172a" />
              <rect x="57" y="5" width="2" height="40" fill="#0f172a" />
              <rect x="62" y="5" width="3" height="40" fill="#0f172a" />
              <rect x="68" y="5" width="6" height="40" fill="#0f172a" />
              <rect x="77" y="5" width="2" height="40" fill="#0f172a" />
              <rect x="82" y="5" width="4" height="40" fill="#0f172a" />
              <rect x="89" y="5" width="3" height="40" fill="#0f172a" />
              <rect x="95" y="5" width="2" height="40" fill="#0f172a" />
              <rect x="100" y="5" width="5" height="40" fill="#0f172a" />
              <rect x="108" y="5" width="2" height="40" fill="#0f172a" />
              <rect x="113" y="5" width="4" height="40" fill="#0f172a" />
              <rect x="120" y="5" width="3" height="40" fill="#0f172a" />
              <rect x="126" y="5" width="2" height="40" fill="#0f172a" />
              <rect x="131" y="5" width="5" height="40" fill="#0f172a" />
              <rect x="139" y="5" width="3" height="40" fill="#0f172a" />
              <rect x="145" y="5" width="2" height="40" fill="#0f172a" />
              <rect x="150" y="5" width="4" height="40" fill="#0f172a" />
              <rect x="157" y="5" width="3" height="40" fill="#0f172a" />
              <rect x="163" y="5" width="5" height="40" fill="#0f172a" />
              <rect x="171" y="5" width="2" height="40" fill="#0f172a" />
              <rect x="176" y="5" width="4" height="40" fill="#0f172a" />
              <rect x="183" y="5" width="3" height="40" fill="#0f172a" />
              <rect x="189" y="5" width="2" height="40" fill="#0f172a" />
              <text x="100" y="55" fontSize="10" fontFamily="monospace" textAnchor="middle" fill="#475569">
                *{product.sku}*
              </text>
            </svg>
          </div>

          <div className="w-full flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Reorder Point: {product.reorderLevel} {product.unit}</span>
            <span>Unit: {product.unit}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            Print Barcode Label
          </Button>
        </div>
      </div>
    </Modal>
  );
};
