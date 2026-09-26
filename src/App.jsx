import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <InventoryProvider>
          <MainLayout />
        </InventoryProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
