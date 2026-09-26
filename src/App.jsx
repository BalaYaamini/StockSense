import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { InventoryProvider } from './context/InventoryContext';
import { ToastProvider } from './context/ToastContext';
import { RoleProvider } from './context/RoleContext';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <RoleProvider>
          <InventoryProvider>
            <MainLayout />
          </InventoryProvider>
        </RoleProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
