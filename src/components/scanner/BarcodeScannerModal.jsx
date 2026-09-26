import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
import {
  ScanLine,
  Camera,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  ArrowLeftRight,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { formatNumber, formatCurrency } from '../../utils/formatters';

export const BarcodeScannerModal = ({
  isOpen,
  onClose,
  onActionTrigger
}) => {
  const { products, warehouses } = useInventory();
  const toast = useToast();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [scannedCode, setScannedCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scannedWarehouse, setScannedWarehouse] = useState(null);

  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'stocksense-qr-reader';

  // Handle SKU or Barcode match
  const handleBarcodeDetected = (code) => {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();
    setScannedCode(cleanCode);

    // 1. Look for matching product SKU or ID
    const matchedProd = products.find(
      p => p.sku.toUpperCase() === cleanCode || p.id.toUpperCase() === cleanCode || p.name.toUpperCase().includes(cleanCode)
    );

    // 2. Look for matching Warehouse Code
    const matchedWh = warehouses.find(
      w => w.code.toUpperCase() === cleanCode || w.id.toUpperCase() === cleanCode
    );

    if (matchedProd) {
      setScannedProduct(matchedProd);
      setScannedWarehouse(null);
      toast.success('Barcode Matched', `Identified product: ${matchedProd.name} (${matchedProd.sku})`);
    } else if (matchedWh) {
      setScannedWarehouse(matchedWh);
      setScannedProduct(null);
      toast.info('Location Scanned', `Identified facility: ${matchedWh.name}`);
    } else {
      setScannedProduct(null);
      setScannedWarehouse(null);
      toast.warning('Unknown Code', `No catalog item matches barcode: "${cleanCode}"`);
    }
  };

  // Start Camera Feed
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          handleBarcodeDetected(decodedText);
          stopCamera();
        },
        () => {
          // ignore parsing frame errors
        }
      );
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera start error', err);
      setCameraError('Camera access not permitted or device has no camera. Use the Barcode Simulator below.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera Feed
  const stopCamera = async () => {
    if (html5QrCodeRef.current && isCameraActive) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Error stopping camera', err);
      }
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setScannedCode('');
      setScannedProduct(null);
      setScannedWarehouse(null);
      setCameraError(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleManualAction = (actionType) => {
    if (!scannedProduct && !scannedWarehouse) return;
    onClose();
    if (onActionTrigger) {
      onActionTrigger(actionType, scannedProduct || scannedWarehouse);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Barcode & QR Code Scanner"
      subtitle="Scan product SKUs, packaging labels, and warehouse bin tags in real-time"
      icon={ScanLine}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Scanner Viewport / Camera Box */}
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center min-h-[260px] text-white p-4">
          <div id={scannerContainerId} className="w-full max-w-sm overflow-hidden rounded-xl" />

          {!isCameraActive && (
            <div className="flex flex-col items-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-coral-400">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-100">Live Camera Scanner</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Point your camera at any 1D Barcode (Code128/EAN) or 2D QR Code.
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Camera}
                onClick={startCamera}
                className="coral-glow"
              >
                Enable Camera Scanner
              </Button>
            </div>
          )}

          {isCameraActive && (
            <div className="absolute top-3 right-3 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={stopCamera}
                className="bg-slate-800/90 text-slate-200 border-slate-700 text-xs"
              >
                Stop Camera
              </Button>
            </div>
          )}

          {cameraError && (
            <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2 max-w-md mt-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{cameraError}</span>
            </div>
          )}
        </div>

        {/* 1-Click Barcode Test Simulator (Crucial for Demoing!) */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-coral-500" />
              <span>1-Click Barcode Simulator (Test Without Webcam)</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500">Click any chip to simulate scan</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {products.slice(0, 6).map((p) => (
              <button
                key={p.id}
                onClick={() => handleBarcodeDetected(p.sku)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  scannedCode === p.sku
                    ? 'bg-coral-500 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-coral-300 hover:bg-coral-50/50'
                }`}
              >
                🏷 {p.sku} ({p.name.split(' ')[0]})
              </button>
            ))}
            {warehouses.map((w) => (
              <button
                key={w.id}
                onClick={() => handleBarcodeDetected(w.code)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  scannedCode === w.code
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                }`}
              >
                🏢 {w.code}
              </button>
            ))}
          </div>
        </div>

        {/* Scanned Result Card & Action Trigger */}
        {scannedProduct && (
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded-full">
                  ✓ Scanned Match
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  {scannedProduct.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  SKU: {scannedProduct.sku} • {scannedProduct.category}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 block">Total On-Hand:</span>
                <span className="text-lg font-black text-slate-900 font-mono">
                  {formatNumber(scannedProduct.totalCompanyQuantity)} {scannedProduct.unit}
                </span>
              </div>
            </div>

            {/* Warehouse Locations Breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 text-xs">
              {warehouses.map(w => (
                <div key={w.id} className="p-2 bg-white rounded-lg border border-emerald-100">
                  <span className="text-slate-500 block text-[10px]">{w.code}:</span>
                  <span className="font-bold text-slate-900">
                    {scannedProduct.stockByWarehouse?.[w.id]?.quantity || 0} {scannedProduct.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <Button
                variant="success"
                size="sm"
                icon={ArrowDownRight}
                onClick={() => handleManualAction('RECEIPT')}
              >
                Receive +Stock
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={ArrowUpRight}
                onClick={() => handleManualAction('DELIVERY')}
              >
                Dispatch -Stock
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={SlidersHorizontal}
                onClick={() => handleManualAction('ADJUSTMENT')}
              >
                Adjust Count
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowLeftRight}
                onClick={() => handleManualAction('TRANSFER')}
              >
                Transfer
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            Close Scanner
          </Button>
        </div>
      </div>
    </Modal>
  );
};
