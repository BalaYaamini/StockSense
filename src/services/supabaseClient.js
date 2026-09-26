import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'stocksense_supabase_config_v1';

// Helper to check if a string is a real valid URL/key
const isValidConfig = (url, key) => {
  return (
    url &&
    key &&
    url.startsWith('https://') &&
    !url.includes('your-project-ref') &&
    key.length > 20 &&
    !key.includes('your-anon-public-api-key')
  );
};

export const getSupabaseConfig = () => {
  // 1. Check environment variables from .env
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // 2. Check localStorage override
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isValidConfig(parsed.url, parsed.anonKey)) {
        return {
          url: parsed.url,
          anonKey: parsed.anonKey,
          isEnabled: parsed.isEnabled !== false
        };
      }
    }
  } catch (e) {
    console.error('Failed reading supabase config from storage', e);
  }

  // Fallback to .env values
  const hasValidEnv = isValidConfig(envUrl, envKey);
  return {
    url: envUrl,
    anonKey: envKey,
    isEnabled: hasValidEnv
  };
};

export const saveSupabaseConfig = (config) => {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
    resetSupabaseClient();
  } catch (e) {
    console.error('Failed saving supabase config', e);
  }
};

let clientInstance = null;

export const getSupabaseClient = () => {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey || !config.isEnabled) {
    return null;
  }
  if (!isValidConfig(config.url, config.anonKey)) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(config.url, config.anonKey, {
      auth: { persistSession: true },
      realtime: { params: { eventsPerSecond: 10 } }
    });
  }
  return clientInstance;
};

export const resetSupabaseClient = () => {
  clientInstance = null;
};

export const testSupabaseConnection = async (url, anonKey) => {
  if (!url || !anonKey) {
    return { success: false, message: 'Supabase URL and Anon Key are required.' };
  }
  try {
    const tempClient = createClient(url, anonKey);
    const { data, error } = await tempClient.from('warehouses').select('count', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          needSchema: true,
          message: 'Connected to Supabase! (Please run supabase_schema.sql in your Supabase SQL Editor).'
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to Supabase PostgreSQL database!' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed.' };
  }
};
