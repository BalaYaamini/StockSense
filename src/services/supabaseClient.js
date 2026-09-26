import { createClient } from '@supabase/supabase-js';

const SUPABASE_CONFIG_KEY = 'stocksense_supabase_config_v1';

export const getSupabaseConfig = () => {
  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed reading supabase config', e);
  }
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    isEnabled: false
  };
};

export const saveSupabaseConfig = (config) => {
  try {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(config));
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
  if (!clientInstance) {
    clientInstance = createClient(config.url, config.anonKey, {
      auth: { persistSession: true }
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
    // Simple lightweight query to check connectivity
    const { data, error } = await tempClient.from('warehouses').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! (Note: Tables not created yet. Run supabase_schema.sql in SQL Editor).'
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Successfully connected to live Supabase PostgreSQL instance!' };
  } catch (err) {
    return { success: false, message: err.message || 'Connection failed.' };
  }
};
