/**
 * ID generator utilities for realistic sequential / prefixed identifiers
 */

export function generateId(prefix, existingList = []) {
  const year = new Date().getFullYear();
  const count = existingList.length + 1;
  const padded = String(count).padStart(3, '0');
  const randomSuffix = Math.floor(100 + Math.random() * 900); // 3-digit random to prevent collision
  
  if (['REC', 'DEL', 'TRF', 'ADJ', 'MOV'].includes(prefix)) {
    return `${prefix}-${year}-${padded}`;
  }
  
  if (prefix === 'PRD' || prefix === 'SKU') {
    return `${prefix}-${padded}${randomSuffix}`;
  }
  
  if (prefix === 'WH') {
    return `WH-${padded}`;
  }
  
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}
