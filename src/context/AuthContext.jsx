import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from '../services/supabaseClient';
import { sendOtpEmail } from '../services/emailService';

const AUTH_STORAGE_KEY = 'stocksense_auth_user_v1';
const REGISTERED_USERS_KEY = 'stocksense_registered_users_v2';
const OTP_STORAGE_KEY = 'stocksense_active_otps_v1';

export const ROLES = {
  ADMIN: {
    id: 'ADMIN',
    name: 'Sarah Vance',
    email: 'admin@stocksense.io',
    role: 'ADMIN',
    roleTitle: 'System Administrator',
    badge: '👑 Admin',
    avatar: 'SV',
    avatarBg: 'bg-rose-100 text-rose-700 border-rose-200'
  },
  MANAGER: {
    id: 'MANAGER',
    name: 'Alex Morgan',
    email: 'alex.morgan@stocksense.io',
    role: 'MANAGER',
    roleTitle: 'Inventory Manager',
    badge: '👔 Manager',
    avatar: 'AM',
    avatarBg: 'bg-coral-100 text-coral-700 border-coral-200'
  },
  STAFF: {
    id: 'STAFF',
    name: 'Dave Miller',
    email: 'dave.miller@stocksense.io',
    role: 'STAFF',
    roleTitle: 'Warehouse Staff',
    badge: '👷 Staff',
    avatar: 'DM',
    avatarBg: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  }
};

export const INITIAL_USERS = [
  {
    ...ROLES.ADMIN,
    id: 'USR-ADM-001',
    password: 'adminpassword123',
    authProvider: 'email',
    createdAt: '2024-09-01T00:00:00Z'
  },
  {
    ...ROLES.MANAGER,
    id: 'USR-MGR-001',
    password: 'password123',
    authProvider: 'email',
    createdAt: '2024-09-10T08:00:00Z'
  },
  {
    id: 'USR-MGR-002',
    name: 'Rachel Chen',
    email: 'rachel.chen@stocksense.io',
    role: 'MANAGER',
    roleTitle: 'Regional Supply Manager',
    badge: '👔 Manager',
    avatar: 'RC',
    avatarBg: 'bg-coral-100 text-coral-700 border-coral-200',
    password: 'password123',
    authProvider: 'admin_import',
    createdAt: '2024-09-15T10:30:00Z'
  },
  {
    ...ROLES.STAFF,
    id: 'USR-STF-001',
    password: 'password123',
    authProvider: 'email',
    createdAt: '2024-09-12T09:00:00Z'
  }
];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Current Authenticated User (Default Admin for effortless test access)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ROLES.ADMIN;
    } catch {
      return ROLES.ADMIN;
    }
  });

  // Registered Users Directory (Admins, Managers, Staff)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_USERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch (e) {
      console.error(e);
      return INITIAL_USERS;
    }
  });

  // Active OTPs state
  const [activeOTPs, setActiveOTPs] = useState(() => {
    try {
      const saved = localStorage.getItem(OTP_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [googleUserForPasswordSetup, setGoogleUserForPasswordSetup] = useState(null);

  // Listen to Supabase Auth state changes if connected
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const authUser = session.user;
          const userMeta = authUser.user_metadata || {};
          const isGoogle = authUser.app_metadata?.provider === 'google' || authUser.identities?.some(i => i.provider === 'google');
          
          // Google users are ALWAYS Staff by business rule
          const assignedRole = isGoogle ? 'STAFF' : (userMeta.role || 'STAFF');
          const cleanName = userMeta.full_name || userMeta.name || authUser.email.split('@')[0];
          const initials = cleanName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'GS';

          const loggedUser = {
            id: authUser.id,
            name: cleanName,
            email: authUser.email,
            role: assignedRole,
            roleTitle: assignedRole === 'ADMIN' ? 'System Administrator' : assignedRole === 'MANAGER' ? 'Inventory Manager' : 'Warehouse Staff',
            badge: assignedRole === 'ADMIN' ? '👑 Admin' : assignedRole === 'MANAGER' ? '👔 Manager' : '👷 Staff',
            avatar: initials,
            avatarBg: assignedRole === 'ADMIN' ? 'bg-rose-100 text-rose-700 border-rose-200' : assignedRole === 'MANAGER' ? 'bg-coral-100 text-coral-700 border-coral-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200',
            authProvider: isGoogle ? 'google' : 'supabase',
            createdAt: new Date().toISOString()
          };

          // Synchronize and persist into Admin user directory
          setRegisteredUsers(prev => {
            const index = prev.findIndex(u => u.email.toLowerCase() === authUser.email.toLowerCase());
            if (index >= 0) {
              const updated = [...prev];
              updated[index] = { ...updated[index], ...loggedUser };
              return updated;
            }
            return [loggedUser, ...prev];
          });

          setUser(loggedUser);

          // If this was a Google authentication, prompt for password reset/setup
          const isExpectingSetup = sessionStorage.getItem('stocksense_pending_google_pwd_setup');
          if (isGoogle || isExpectingSetup) {
            sessionStorage.removeItem('stocksense_pending_google_pwd_setup');
            setGoogleUserForPasswordSetup(loggedUser);
          }
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    } catch (e) {
      console.error(e);
    }
  }, [registeredUsers]);

  useEffect(() => {
    try {
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(activeOTPs));
    } catch (e) {
      console.error(e);
    }
  }, [activeOTPs]);

  // 1. Email & Password Login
  const login = async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check Supabase if active
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (data?.user && !error) {
          const userMeta = data.user.user_metadata || {};
          const assignedRole = userMeta.role || 'STAFF';
          const loggedUser = {
            id: data.user.id,
            name: userMeta.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: assignedRole,
            roleTitle: assignedRole === 'ADMIN' ? 'System Administrator' : assignedRole === 'MANAGER' ? 'Inventory Manager' : 'Warehouse Staff',
            badge: assignedRole === 'ADMIN' ? '👑 Admin' : assignedRole === 'MANAGER' ? '👔 Manager' : '👷 Staff',
            avatar: (userMeta.name || cleanEmail).slice(0, 2).toUpperCase(),
            avatarBg: assignedRole === 'ADMIN' ? 'bg-rose-100 text-rose-700' : assignedRole === 'MANAGER' ? 'bg-coral-100 text-coral-700' : 'bg-indigo-100 text-indigo-700',
            authProvider: 'supabase',
            createdAt: new Date().toISOString()
          };

          setRegisteredUsers(prev => {
            const index = prev.findIndex(u => u.email.toLowerCase() === cleanEmail);
            if (index >= 0) return prev;
            return [loggedUser, ...prev];
          });

          setUser(loggedUser);
          return { success: true, user: loggedUser };
        }
      } catch (err) {
        console.warn('Supabase auth fallback', err);
      }
    }

    // Check Local Registered Users
    const found = registeredUsers.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (found) {
      const { password: _, ...userSafe } = found;
      setUser(userSafe);
      return { success: true, user: userSafe };
    }

    // Demo Accounts Password Bypass
    if (cleanEmail === ROLES.ADMIN.email.toLowerCase()) {
      setUser(ROLES.ADMIN);
      return { success: true, user: ROLES.ADMIN };
    }
    if (cleanEmail === ROLES.MANAGER.email.toLowerCase()) {
      setUser(ROLES.MANAGER);
      return { success: true, user: ROLES.MANAGER };
    }
    if (cleanEmail === ROLES.STAFF.email.toLowerCase()) {
      setUser(ROLES.STAFF);
      return { success: true, user: ROLES.STAFF };
    }

    return { success: false, message: 'Invalid email or password. Use demo quick-login or check credentials.' };
  };

  // 2. Continue with Google Authentication
  // RULE: Any user authenticating via Google is automatically onboarded as WAREHOUSE STAFF by default.
  // 2. Continue with Google Authentication
  // RULE: Any user authenticating via Google is automatically onboarded as WAREHOUSE STAFF by default.
  const loginWithGoogle = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        message: 'Supabase client is not connected. Please check your .env configuration.'
      };
    }

    try {
      sessionStorage.setItem('stocksense_pending_google_pwd_setup', 'true');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Google OAuth Error:', err);
      sessionStorage.removeItem('stocksense_pending_google_pwd_setup');
      return {
        success: false,
        message: err.message || 'Google OAuth failed to initialize.'
      };
    }
  };

  // 3. User Registration (Public Signup - Creates Staff or Manager)
  const signup = async ({ name, email, password, role = 'STAFF' }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    const exists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    const initials = cleanName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'US';

    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      email: cleanEmail,
      role,
      roleTitle: role === 'ADMIN' ? 'System Administrator' : role === 'MANAGER' ? 'Inventory Manager' : 'Warehouse Staff',
      badge: role === 'ADMIN' ? '👑 Admin' : role === 'MANAGER' ? '👔 Manager' : '👷 Staff',
      avatar: initials,
      avatarBg: role === 'ADMIN' ? 'bg-rose-100 text-rose-700 border-rose-200' : role === 'MANAGER' ? 'bg-coral-100 text-coral-700 border-coral-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200',
      password,
      authProvider: 'email',
      createdAt: new Date().toISOString()
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    const { password: _, ...userSafe } = newUser;
    setUser(userSafe);

    return { success: true, user: userSafe };
  };

  // 4. Admin Feature: Import Managers (Single or Bulk CSV)
  const importManagers = (managersList) => {
    const imported = [];
    const skipped = [];

    managersList.forEach((mgr) => {
      const cleanEmail = (mgr.email || '').trim().toLowerCase();
      const cleanName = (mgr.name || '').trim();

      if (!cleanEmail || !cleanName) return;

      const exists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        skipped.push(cleanEmail);
        return;
      }

      const initials = cleanName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'MG';

      const newManager = {
        id: `USR-MGR-${Date.now().toString().slice(-4)}${Math.floor(10 + Math.random() * 90)}`,
        name: cleanName,
        email: cleanEmail,
        role: 'MANAGER',
        roleTitle: mgr.roleTitle || 'Inventory Manager',
        badge: '👔 Manager',
        avatar: initials,
        avatarBg: 'bg-coral-100 text-coral-700 border-coral-200',
        password: mgr.password || 'password123',
        authProvider: 'admin_import',
        assignedWarehouse: mgr.assignedWarehouse || 'All Warehouses',
        createdAt: new Date().toISOString()
      };

      imported.push(newManager);
    });

    if (imported.length > 0) {
      setRegisteredUsers(prev => [...imported, ...prev]);
    }

    return {
      success: true,
      importedCount: imported.length,
      skippedCount: skipped.length,
      imported
    };
  };

  // 5. Admin Feature: Add / Update / Delete Users
  const addManager = (managerData) => {
    return importManagers([managerData]);
  };

  const deleteUser = (userId) => {
    if (user?.id === userId) {
      return { success: false, message: 'You cannot delete your own currently active profile.' };
    }
    setRegisteredUsers(prev => prev.filter(u => u.id !== userId));
    return { success: true, message: 'User removed from directory.' };
  };

  const updateUserRole = (userId, newRole) => {
    setRegisteredUsers(prev =>
      prev.map(u => {
        if (u.id !== userId) return u;
        const roleTitle = newRole === 'ADMIN' ? 'System Administrator' : newRole === 'MANAGER' ? 'Inventory Manager' : 'Warehouse Staff';
        const badge = newRole === 'ADMIN' ? '👑 Admin' : newRole === 'MANAGER' ? '👔 Manager' : '👷 Staff';
        const avatarBg = newRole === 'ADMIN' ? 'bg-rose-100 text-rose-700' : newRole === 'MANAGER' ? 'bg-coral-100 text-coral-700' : 'bg-indigo-100 text-indigo-700';
        return { ...u, role: newRole, roleTitle, badge, avatarBg };
      })
    );
  };

  // 6. OTP Password Reset
  const requestPasswordResetOTP = async (email) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    const targetUser = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail) ||
      INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail) ||
      (cleanEmail === ROLES.ADMIN.email.toLowerCase() ? ROLES.ADMIN : null) ||
      (cleanEmail === ROLES.MANAGER.email.toLowerCase() ? ROLES.MANAGER : null) ||
      (cleanEmail === ROLES.STAFF.email.toLowerCase() ? ROLES.STAFF : null);

    if (!targetUser) {
      return { success: false, message: 'No registered account found with that email address.' };
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    setActiveOTPs(prev => ({
      ...prev,
      [cleanEmail]: {
        code: otpCode,
        expiresAt,
        createdAt: Date.now(),
        attempts: 0
      }
    }));

    // If Supabase is connected, attempt Supabase Auth reset trigger in parallel
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.resetPasswordForEmail(cleanEmail);
      } catch (e) {
        console.warn('Supabase resetPasswordForEmail notification:', e);
      }
    }

    // Attempt real email dispatch via Gmail SMTP / App Password
    let emailResult = { success: false, emailSent: false };
    try {
      emailResult = await sendOtpEmail({
        to: cleanEmail,
        otpCode,
        recipientName: targetUser?.name || cleanEmail.split('@')[0]
      });
    } catch (err) {
      console.warn('sendOtpEmail notice:', err);
    }

    return {
      success: true,
      otpCode,
      expiresAt,
      emailSent: emailResult.emailSent,
      emailMessage: emailResult.message,
      emailError: emailResult.error,
      message: emailResult.emailSent
        ? `A 6-digit verification code has been sent to ${cleanEmail}.`
        : `A 6-digit verification code has been generated for ${cleanEmail}. (Code: ${otpCode})`
    };
  };

  const resendPasswordResetOTP = async (email) => {
    return requestPasswordResetOTP(email);
  };

  const verifyOTPAndResetPassword = async ({ email, otp, newPassword }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    if (!cleanEmail) {
      return { success: false, message: 'Email address is required.' };
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      return { success: false, message: 'Please enter a valid 6-digit verification code.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    const storedOTP = activeOTPs[cleanEmail];
    if (!storedOTP) {
      return { success: false, message: 'No active OTP requested for this email. Please request a new code.' };
    }

    if (Date.now() > storedOTP.expiresAt) {
      return { success: false, message: 'Verification code has expired. Please request a new OTP.' };
    }

    if (storedOTP.attempts >= 5) {
      setActiveOTPs(prev => {
        const next = { ...prev };
        delete next[cleanEmail];
        return next;
      });
      return { success: false, message: 'Too many incorrect attempts. Please request a fresh OTP.' };
    }

    if (storedOTP.code !== cleanOtp) {
      setActiveOTPs(prev => ({
        ...prev,
        [cleanEmail]: {
          ...storedOTP,
          attempts: (storedOTP.attempts || 0) + 1
        }
      }));
      const remaining = 4 - (storedOTP.attempts || 0);
      return {
        success: false,
        message: `Invalid 6-digit code.${remaining > 0 ? ` (${remaining} attempts left)` : ''}`
      };
    }

    setRegisteredUsers(prev => {
      const exists = prev.some(u => u.email.toLowerCase() === cleanEmail);
      if (exists) {
        return prev.map(u => (u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u));
      } else {
        const defaultRole = Object.values(ROLES).find(r => r.email.toLowerCase() === cleanEmail) ||
          INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);
        if (defaultRole) {
          return [{
            ...defaultRole,
            id: defaultRole.id || `USR-${Date.now().toString().slice(-4)}`,
            password: newPassword,
            authProvider: 'email',
            createdAt: new Date().toISOString()
          }, ...prev];
        }
        return prev;
      }
    });

    // If currently authenticated as this user, update user state
    if (user && user.email?.toLowerCase() === cleanEmail) {
      setUser(prev => ({ ...prev, password: newPassword }));
    }

    // Attempt Supabase password update if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch (err) {
        console.warn('Supabase updateUser password notice:', err);
      }
    }

    setActiveOTPs(prev => {
      const next = { ...prev };
      delete next[cleanEmail];
      return next;
    });

    return { success: true, message: 'Password reset successfully! You can now log in with your new credentials.' };
  };

  // Direct Password Update
  const setUserPassword = (email, newPassword) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !newPassword) return { success: false, message: 'Invalid email or password.' };

    setRegisteredUsers(prev =>
      prev.map(u => (u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u))
    );
    return { success: true, message: 'Password updated successfully.' };
  };

  // 7. Fast 1-Click Demo Login Switcher
  const loginAsDemoUser = (roleKey) => {
    const target = ROLES[roleKey] || ROLES.ADMIN;
    setUser(target);
    return target;
  };

  // 8. Logout
  const logout = () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isManager = user?.role === 'MANAGER';
  const isStaff = user?.role === 'STAFF';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        isManager,
        isStaff,
        registeredUsers,
        login,
        loginWithGoogle,
        signup,
        logout,
        requestPasswordResetOTP,
        resendPasswordResetOTP,
        verifyOTPAndResetPassword,
        googleUserForPasswordSetup,
        clearGooglePasswordSetup: () => setGoogleUserForPasswordSetup(null),
        setUserPassword,
        loginAsDemoUser,
        importManagers,
        addManager,
        deleteUser,
        updateUserRole,
        allRoles: ROLES
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
