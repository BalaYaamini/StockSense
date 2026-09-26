import React from 'react';
<<<<<<< HEAD
import { AuthProvider } from './context/AuthContext';
=======
import { ThemeProvider } from './context/ThemeContext';
>>>>>>> followup-changes
import { InventoryProvider } from './context/InventoryContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
<<<<<<< HEAD
    <ToastProvider>
      <AuthProvider>
        <InventoryProvider>
          <MainLayout />
        </InventoryProvider>
      </AuthProvider>
    </ToastProvider>
=======
    <ThemeProvider>
      <ToastProvider>
        <RoleProvider>
          <InventoryProvider>
            <MainLayout />
          </InventoryProvider>
        </RoleProvider>
      </ToastProvider>
    </ThemeProvider>
>>>>>>> followup-changes
  );
}

export default App;
