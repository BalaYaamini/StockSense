import React from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { ToastProvider } from './context/ToastContext';
import { RoleProvider } from './context/RoleContext';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <ToastProvider>
      <RoleProvider>
        <InventoryProvider>
          <MainLayout />
        </InventoryProvider>
      </RoleProvider>
    </ToastProvider>
  );
}

export default App;
