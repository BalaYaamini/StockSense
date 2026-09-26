import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useInventory } from '../../hooks/useInventory';
import { useToast } from '../../hooks/useToast';
import {
  ScanLine,
  Camera,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  ArrowLeftRight,
  Sparkles
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { formatNumber } from '../../utils/formatters';

export const BarcodeScannerModal = ({
  isOpen,
  onClose,
  onActionTrigger
}) => {
  const { products, warehouses } = useInventory();
  const toast = useToast();

  const [cameraError, setCameraError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [scannedWarehouse, setScannedWarehouse] = useState(null);

  const html5QrCodeRef = useRef(null);
  const isCameraActiveRef = useRef(false);
  const scannerContainerId = 'stocksense-qr-reader';

  // Fully destroy and clean up any existing scanner instance
  const destroyScanner = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        const state = html5QrCodeRef.current.getState();
        if (state === 2) { // SCANNING state
          await html5QrCodeRef.current.stop();
        }
      } catch (e) {
        // ignore
      }
      try {
        html5QrCodeRef.current.clear();
      } catch (e) {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    isCameraActiveRef.current = false;
    setIsCameraActive(false);
  }, []);

  // Handle SKU or Barcode match
  const handleBarcodeDetected = useCallback((code) => {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();
    setScannedCode(cleanCode);

    const matchedProd = products.find(
      p => p.sku.toUpperCase() === cleanCode || p.id.toUpperCase() === cleanCode || p.name.toUpperCase().includes(cleanCode)
    );

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
  }, [products, warehouses, toast]);

  // Stop Camera Feed
  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current && isCameraActiveRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Error stopping camera', err);
      }
      isCameraActiveRef.current = false;
      setIsCameraActive(false);
    }
  }, []);

  // Start Camera with fallback: try back camera first, then any camera
  const startCamera = useCallback(async () => {
    if (isCameraActiveRef.current) return;
    setIsStarting(true);
    setCameraError(null);

    // Clean up any previous instance first
    await destroyScanner();

    const scannerConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0
    };

    const onScanSuccess = (decodedText) => {
      handleBarcodeDetected(decodedText);
      stopCamera();
    };

    const onScanFailure = () => {
      // ignore frame parse errors
    };

    try {
      // Try back camera first
      const scanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        scannerConfig,
        onScanSuccess,
        onScanFailure
      );

      isCameraActiveRef.current = true;
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Back camera failed, trying any available camera...', err);

      try {
        // Fallback: try any available camera
        const scanner = html5QrCodeRef.current || new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = scanner;

        await scanner.start(
          true,  // true = use any available camera
          scannerConfig,
          onScanSuccess,
          onScanFailure
        );

        isCameraActiveRef.current = true;
        setIsCameraActive(true);
      } catch (err2) {
        console.error('All cameras failed', err2);

        let errorMsg = 'Camera access not permitted or device has no camera.';
        if (err2.toString().includes('NotAllowedError')) {
          errorMsg = 'Camera permission was denied. Please allow camera access in your browser settings and try again.';
        } else if (err2.toString().includes('NotFoundError')) {
          errorMsg = 'No camera found on this device. Use the Barcode Simulator below.';
        } else if (err2.toString().includes('NotReadableError')) {
          errorMsg = 'Camera is already in use by another application. Close other apps using the camera and try again.';
        } else if (err2.toString().includes('HTTP') || err2.toString().includes('HTTPS')) {
          errorMsg = 'Camera requires HTTPS. Please use HTTPS or run on localhost.';
        }

        setCameraError(errorMsg);
        isCameraActiveRef.current = false;
        setIsCameraActive(false);
        html5QrCodeRef.current = null;
      }
    } finally {
      setIsStarting(false);
    }
  }, [handleBarcodeDetected, stopCamera, destroyScanner]);

  // Handle modal open/close
  useEffect(() => {
    if (isOpen) {
      // Reset state on open, user clicks to start camera
      setScannedCode('');
      setScannedProduct(null);
      setScannedWarehouse(null);
      setCameraError(null);
      setIsCameraActive(false);
      isCameraActiveRef.current = false;
    } else {
      // Clean up on close
      destroyScanner();
      setScannedCode('');
      setScannedProduct(null);
      setScannedWarehouse(null);
      setCameraError(null);
    }
  }, [isOpen, destroyScanner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      destroyScanner();
    };
  }, [destroyScanner]);

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

          {!isCameraActive && !cameraError && !isStarting && (
            <div className="flex flex-col items-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-sage-400">
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
                className="bg-sage-500 hover:bg-sage-600"
              >
                Enable Camera
              </Button>
            </div>
          )}

          {isStarting && (
            <div className="flex flex-col items-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-sage-400 animate-pulse">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-100">Starting Camera...</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Allow camera access when prompted by your browser.
                </p>
              </div>
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
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-xs text-rose-300 flex items-center gap-2 max-w-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                <span>{cameraError}</span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={Camera}
                onClick={startCamera}
                className="bg-slate-800 text-slate-200 border-slate-700 text-xs"
              >
                Retry Camera
              </Button>
            </div>
          )}
        </div>

        {/* 1-Click Barcode Test Simulator (Crucial for Demoing!) */}
        <div className="p-4 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] rounded-2xl space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sage-500" />
              <span>1-Click Barcode Simulator (Test Without Webcam)</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Click any chip to simulate scan</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {products.map((p) => (
              <button
                key={p.id}
                onClick={() => handleBarcodeDetected(p.sku)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                  scannedCode === p.sku
                    ? 'bg-sage-500 text-white shadow-xs'
                    : 'bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-200 hover:border-sage-300 hover:bg-sage-50/50 dark:hover:bg-[#2a2a2a]'
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
                    : 'bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#2a2a2a] text-slate-700 dark:text-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-[#2a2a2a]'
                }`}
              >
                🏢 {w.code}
              </button>
            ))}
          </div>
        </div>

        {/* Scanned Result Card & Action Trigger */}
        {scannedProduct && (
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3 animate-fade-in">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                  ✓ Scanned Match
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {scannedProduct.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  SKU: {scannedProduct.sku} • {scannedProduct.category}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Total On-Hand:</span>
                <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {formatNumber(scannedProduct.totalCompanyQuantity)} {scannedProduct.unit}
                </span>
              </div>
            </div>

            {/* Warehouse Locations Breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 text-xs">
              {warehouses.map(w => (
                <div key={w.id} className="p-2 bg-white dark:bg-[#1a1a1a] rounded-lg border border-emerald-100 dark:border-emerald-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">{w.code}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
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
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-[#2a2a2a]">
          <Button variant="secondary" onClick={onClose}>
            Close Scanner
          </Button>
        </div>
      </div>
    </Modal>
  );
};
