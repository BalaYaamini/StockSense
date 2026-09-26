import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { InventoryProvider } from './context/InventoryContext';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <InventoryProvider>
            <MainLayout />
          </InventoryProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
