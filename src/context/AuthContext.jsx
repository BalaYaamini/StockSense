import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabaseClient } from '../services/supabaseClient';

const AUTH_STORAGE_KEY = 'stocksense_auth_user_v1';
const REGISTERED_USERS_KEY = 'stocksense_registered_users_v1';
const OTP_STORAGE_KEY = 'stocksense_active_otps_v1';

export const DEMO_ACCOUNTS = {
  MANAGER: {
    id: 'USR-001',
    name: 'Alex Morgan',
    email: 'alex.morgan@stocksense.io',
    role: 'MANAGER',
    roleTitle: 'Inventory Manager',
    avatar: 'AM',
    avatarBg: 'bg-coral-100 text-coral-700 border-coral-200'
  },
  STAFF: {
    id: 'USR-002',
    name: 'Dave Miller',
    email: 'dave.miller@stocksense.io',
    role: 'STAFF',
    roleTitle: 'Warehouse Staff',
    avatar: 'DM',
    avatarBg: 'bg-indigo-100 text-indigo-700 border-indigo-200'
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Current Authenticated User (null if logged out)
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEMO_ACCOUNTS.MANAGER; // Default logged in as Manager for seamless first load
    } catch {
      return DEMO_ACCOUNTS.MANAGER;
    }
  });

  // Local Registered Users Database
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem(REGISTERED_USERS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        ...DEMO_ACCOUNTS.MANAGER,
        password: 'password123'
      },
      {
        ...DEMO_ACCOUNTS.STAFF,
        password: 'password123'
      }
    ];
  });

  // Active OTPs state: { email: { code: '123456', expiresAt: timestamp } }
  const [activeOTPs, setActiveOTPs] = useState(() => {
    try {
      const saved = localStorage.getItem(OTP_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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

  // Login handler
  const login = async ({ email, password }) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check Supabase Auth if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password
        });
        if (data?.user && !error) {
          const userMeta = data.user.user_metadata || {};
          const loggedUser = {
            id: data.user.id,
            name: userMeta.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            role: userMeta.role || 'MANAGER',
            roleTitle: userMeta.role === 'STAFF' ? 'Warehouse Staff' : 'Inventory Manager',
            avatar: (userMeta.name || cleanEmail).slice(0, 2).toUpperCase(),
            avatarBg: userMeta.role === 'STAFF' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-coral-100 text-coral-700 border-coral-200'
          };
          setUser(loggedUser);
          return { success: true, user: loggedUser };
        }
      } catch (err) {
        console.warn('Supabase sign-in fallback to local auth', err);
      }
    }

    // 2. Check Local Registered Users
    const found = registeredUsers.find(
      u => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (found) {
      const { password: _, ...userSafe } = found;
      setUser(userSafe);
      return { success: true, user: userSafe };
    }

    // Demo password bypass for known demo accounts
    if (cleanEmail === DEMO_ACCOUNTS.MANAGER.email.toLowerCase()) {
      setUser(DEMO_ACCOUNTS.MANAGER);
      return { success: true, user: DEMO_ACCOUNTS.MANAGER };
    }
    if (cleanEmail === DEMO_ACCOUNTS.STAFF.email.toLowerCase()) {
      setUser(DEMO_ACCOUNTS.STAFF);
      return { success: true, user: DEMO_ACCOUNTS.STAFF };
    }

    return { success: false, message: 'Invalid email or password. Use demo quick-login below or check your password.' };
  };

  // Sign Up handler
  const signup = async ({ name, email, password, role = 'MANAGER' }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Check if email already exists
    const exists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    const initials = cleanName
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'US';

    const newUser = {
      id: `USR-${Date.now().toString().slice(-4)}`,
      name: cleanName,
      email: cleanEmail,
      role,
      roleTitle: role === 'STAFF' ? 'Warehouse Staff' : 'Inventory Manager',
      avatar: initials,
      avatarBg: role === 'STAFF' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-coral-100 text-coral-700 border-coral-200',
      password
    };

    // Try Supabase auth registration in background if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { name: cleanName, role }
          }
        });
      } catch (err) {
        console.warn('Supabase signup error', err);
      }
    }

    setRegisteredUsers(prev => [...prev, newUser]);
    const { password: _, ...userSafe } = newUser;
    setUser(userSafe);

    return { success: true, user: userSafe };
  };

  // OTP Password Reset: Step 1 - Generate 6-Digit OTP
  const requestPasswordResetOTP = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    const userExists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail) ||
      cleanEmail === DEMO_ACCOUNTS.MANAGER.email.toLowerCase() ||
      cleanEmail === DEMO_ACCOUNTS.STAFF.email.toLowerCase();

    if (!userExists) {
      return { success: false, message: 'No registered account found with that email address.' };
    }

    // Generate random 6-digit OTP code (e.g. 584920)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    setActiveOTPs(prev => ({
      ...prev,
      [cleanEmail]: { code: otpCode, expiresAt }
    }));

    return {
      success: true,
      otpCode,
      message: `A 6-digit verification code has been sent to ${cleanEmail}. (Code: ${otpCode})`
    };
  };

  // OTP Password Reset: Step 2 - Verify OTP & Set New Password
  const verifyOTPAndResetPassword = async ({ email, otp, newPassword }) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const storedOTP = activeOTPs[cleanEmail];
    if (!storedOTP) {
      return { success: false, message: 'No active OTP requested for this email. Please request a new code.' };
    }

    if (Date.now() > storedOTP.expiresAt) {
      return { success: false, message: 'Verification code has expired. Please request a new one.' };
    }

    if (storedOTP.code !== cleanOtp) {
      return { success: false, message: 'Invalid 6-digit code. Please verify the code.' };
    }

    // Update password in registered users list
    setRegisteredUsers(prev =>
      prev.map(u => (u.email.toLowerCase() === cleanEmail ? { ...u, password: newPassword } : u))
    );

    // Clear used OTP
    setActiveOTPs(prev => {
      const next = { ...prev };
      delete next[cleanEmail];
      return next;
    });

    return { success: true, message: 'Password reset successfully! You can now log in with your new password.' };
  };

  // 1-Click Demo Login
  const loginAsDemoUser = (roleKey) => {
    const target = DEMO_ACCOUNTS[roleKey] || DEMO_ACCOUNTS.MANAGER;
    setUser(target);
    return target;
  };

  // Logout handler
  const logout = () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.auth.signOut().catch(() => {});
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isManager: user?.role === 'MANAGER',
        isStaff: user?.role === 'STAFF',
        login,
        signup,
        logout,
        requestPasswordResetOTP,
        verifyOTPAndResetPassword,
        loginAsDemoUser
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
