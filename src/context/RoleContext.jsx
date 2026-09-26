import React, { createContext, useContext, useState, useEffect } from 'react';

export const ROLES = {
  MANAGER: {
    id: 'MANAGER',
    name: 'Alex Morgan',
    roleTitle: 'Inventory Manager',
    badge: 'Manager View',
    avatar: 'AM',
    avatarBg: 'bg-coral-100 text-coral-700 border-coral-200'
  },
  STAFF: {
    id: 'STAFF',
    name: 'Dave Miller',
    roleTitle: 'Warehouse Staff',
    badge: 'Floor Staff View',
    avatar: 'DM',
    avatarBg: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  }
};

const RoleContext = createContext(null);

export const RoleProvider = ({ children }) => {
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('stocksense_user_role_v1');
      return saved && ROLES[saved] ? saved : 'MANAGER';
    } catch {
      return 'MANAGER';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('stocksense_user_role_v1', currentRole);
    } catch (e) {
      console.error('Failed saving role', e);
    }
  }, [currentRole]);

  const switchRole = (roleKey) => {
    if (ROLES[roleKey]) {
      setCurrentRole(roleKey);
    }
  };

  const isManager = currentRole === 'MANAGER';
  const isStaff = currentRole === 'STAFF';
  const roleInfo = ROLES[currentRole];

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        switchRole,
        isManager,
        isStaff,
        roleInfo,
        allRoles: ROLES
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
