import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardPage } from '../../pages/DashboardPage';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { OperationsPage } from '../../pages/OperationsPage';
import { MoveHistoryPage } from '../../pages/MoveHistoryPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { WarehouseStaffPage } from '../../pages/WarehouseStaffPage';
import { UserManagementPage } from '../../pages/UserManagementPage';
import { LoginPage } from '../../pages/LoginPage';

// Modals
import { ProductModal } from '../modals/ProductModal';
import { ReceiptModal } from '../modals/ReceiptModal';
import { DeliveryModal } from '../modals/DeliveryModal';
import { TransferModal } from '../modals/TransferModal';
import { AdjustmentModal } from '../modals/AdjustmentModal';
import { ReplenishmentModal } from '../modals/ReplenishmentModal';
import { BarcodeScannerModal } from '../scanner/BarcodeScannerModal';
import { GooglePasswordSetupModal } from '../auth/GooglePasswordSetupModal';

import { useAuth } from '../../hooks/useAuth';

export const MainLayout = () => {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isStaff,
    isManager,
    googleUserForPasswordSetup,
    clearGooglePasswordSetup
  } = useAuth();

  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto redirect target users to their dedicated workspace upon login or role switch
  useEffect(() => {
    if (isStaff) {
      setActivePage('staff-workstation');
    } else if (isAdmin && activePage === 'staff-workstation') {
      setActivePage('dashboard');
    } else if (isManager && activePage === 'staff-workstation') {
      setActivePage('dashboard');
    }
  }, [isStaff, isAdmin, isManager]);

  // Navigation sub-state
  const [stockInitialFilter, setStockInitialFilter] = useState('ALL');
  const [operationsInitialTab, setOperationsInitialTab] = useState('receipts');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [receiptPreselectedProdId, setReceiptPreselectedProdId] = useState(null);

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryPreselectedProdId, setDeliveryPreselectedProdId] = useState(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferPreselectedProdId, setTransferPreselectedProdId] = useState(null);

  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentPreselectedProdId, setAdjustmentPreselectedProdId] = useState(null);

  // Phase 2 Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isReplenishmentOpen, setIsReplenishmentOpen] = useState(false);

  // If user is not authenticated, show the Login / Signup / OTP Portal
  if (!isAuthenticated) {
    return (
      <LoginPage
        onLoginSuccess={(loggedInUser) => {
          if (loggedInUser.role === 'STAFF') {
            setActivePage('staff-workstation');
          } else {
            setActivePage('dashboard');
          }
        }}
      />
    );
  }

  // Custom Navigation Handler
  const handleNavigate = (page, options = {}) => {
    setActivePage(page);
    if (page === 'stock' && options.filter) {
      setStockInitialFilter(options.filter);
    }
    if (page === 'operations' && options.tab) {
      setOperationsInitialTab(options.tab);
    }
  };

  // Modal Open Handlers
  const handleOpenProductModal = (product = null) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleOpenReceiptModal = (productId = null) => {
    setReceiptPreselectedProdId(productId);
    setIsReceiptModalOpen(true);
  };

  const handleOpenDeliveryModal = (productId = null) => {
    setDeliveryPreselectedProdId(productId);
    setIsDeliveryModalOpen(true);
  };

  const handleOpenTransferModal = (productId = null) => {
    setTransferPreselectedProdId(productId);
    setIsTransferModalOpen(true);
  };

  const handleOpenAdjustmentModal = (productId = null) => {
    setAdjustmentPreselectedProdId(productId);
    setIsAdjustmentModalOpen(true);
  };

  // Barcode Scanner Action Trigger Handler
  const handleScannerAction = (actionType, item) => {
    if (!item) return;
    if (actionType === 'RECEIPT') {
      handleOpenReceiptModal(item.id);
    } else if (actionType === 'DELIVERY') {
      handleOpenDeliveryModal(item.id);
    } else if (actionType === 'ADJUSTMENT') {
      handleOpenAdjustmentModal(item.id);
    } else if (actionType === 'TRANSFER') {
      handleOpenTransferModal(item.id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenScanner={() => setIsScannerOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          activePage={activePage}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenProductModal={() => handleOpenProductModal()}
          onOpenReceiptModal={() => handleOpenReceiptModal()}
          onOpenDeliveryModal={() => handleOpenDeliveryModal()}
          onOpenScanner={() => setIsScannerOpen(true)}
          onOpenReplenishmentModal={() => setIsReplenishmentOpen(true)}
        />

        {/* Dynamic Page Rendering */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activePage === 'dashboard' && (
            isAdmin ? (
              <AdminDashboardPage onNavigate={handleNavigate} />
            ) : (
              <DashboardPage
                onNavigate={handleNavigate}
                onOpenProductModal={handleOpenProductModal}
                onOpenReceiptModal={handleOpenReceiptModal}
                onOpenDeliveryModal={handleOpenDeliveryModal}
                onOpenTransferModal={handleOpenTransferModal}
                onOpenAdjustmentModal={handleOpenAdjustmentModal}
                onOpenReplenishmentModal={() => setIsReplenishmentOpen(true)}
                onOpenScanner={() => setIsScannerOpen(true)}
              />
            )
          )}

          {activePage === 'user-management' && <UserManagementPage />}

          {activePage === 'stock' && (
            <ProductsPage
              key={stockInitialFilter}
              initialFilter={stockInitialFilter}
              onOpenProductModal={handleOpenProductModal}
              onOpenReceiptModal={handleOpenReceiptModal}
              onOpenDeliveryModal={handleOpenDeliveryModal}
              onOpenAdjustmentModal={handleOpenAdjustmentModal}
              onOpenReplenishmentModal={() => setIsReplenishmentOpen(true)}
            />
          )}

          {activePage === 'operations' && (
            <OperationsPage
              key={operationsInitialTab}
              initialTab={operationsInitialTab}
              onOpenReceiptModal={handleOpenReceiptModal}
              onOpenDeliveryModal={handleOpenDeliveryModal}
              onOpenTransferModal={handleOpenTransferModal}
              onOpenAdjustmentModal={handleOpenAdjustmentModal}
            />
          )}

          {activePage === 'staff-workstation' && (
            <WarehouseStaffPage
              onOpenScanner={() => setIsScannerOpen(true)}
              onOpenReceiptModal={handleOpenReceiptModal}
              onOpenDeliveryModal={handleOpenDeliveryModal}
            />
          )}

          {activePage === 'move-history' && <MoveHistoryPage />}

          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Global Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        preselectedProductId={receiptPreselectedProdId}
      />

      <DeliveryModal
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        preselectedProductId={deliveryPreselectedProdId}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        preselectedProductId={transferPreselectedProdId}
      />

      <AdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        preselectedProductId={adjustmentPreselectedProdId}
      />

      {/* Phase 2 Modals */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onActionTrigger={handleScannerAction}
      />

      <ReplenishmentModal
        isOpen={isReplenishmentOpen}
        onClose={() => setIsReplenishmentOpen(false)}
        onSuccess={() => {
          setActivePage('operations');
          setOperationsInitialTab('receipts');
        }}
      />

      {/* Google OAuth Password Setup / Reset Modal */}
      <GooglePasswordSetupModal
        isOpen={!!googleUserForPasswordSetup}
        onClose={clearGooglePasswordSetup}
        googleUser={googleUserForPasswordSetup}
      />
    </div>
  );
};
