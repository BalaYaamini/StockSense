import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  INITIAL_WAREHOUSES,
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS,
  INITIAL_DELIVERIES,
  INITIAL_TRANSFERS,
  INITIAL_ADJUSTMENTS,
  INITIAL_MOVE_HISTORY
} from '../data/mockData';
import { generateId } from '../utils/idGenerator';
import { getSupabaseClient } from '../services/supabaseClient';
import { inventoryService } from '../services/inventoryService';

const STORAGE_KEYS = {
  WAREHOUSES: 'stocksense_warehouses_v1',
  PRODUCTS: 'stocksense_products_v1',
  RECEIPTS: 'stocksense_receipts_v1',
  DELIVERIES: 'stocksense_deliveries_v1',
  TRANSFERS: 'stocksense_transfers_v1',
  ADJUSTMENTS: 'stocksense_adjustments_v1',
  MOVE_HISTORY: 'stocksense_move_history_v1',
  ACTIVE_WAREHOUSE: 'stocksense_active_warehouse_v1',
};

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isLoadingDB, setIsLoadingDB] = useState(false);

  // 1. Initial State from localStorage or fallback mock
  const [warehouses, setWarehouses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSES);
      return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
    } catch {
      return INITIAL_WAREHOUSES;
    }
  });

  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [receipts, setReceipts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
      return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
    } catch {
      return INITIAL_RECEIPTS;
    }
  });

  const [deliveries, setDeliveries] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DELIVERIES);
      return saved ? JSON.parse(saved) : INITIAL_DELIVERIES;
    } catch {
      return INITIAL_DELIVERIES;
    }
  });

  const [transfers, setTransfers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSFERS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSFERS;
    } catch {
      return INITIAL_TRANSFERS;
    }
  });

  const [adjustments, setAdjustments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADJUSTMENTS);
      return saved ? JSON.parse(saved) : INITIAL_ADJUSTMENTS;
    } catch {
      return INITIAL_ADJUSTMENTS;
    }
  });

  const [moveHistory, setMoveHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVE_HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_MOVE_HISTORY;
    } catch {
      return INITIAL_MOVE_HISTORY;
    }
  });

  // Global warehouse filter: 'ALL' or specific warehouseId
  const [activeWarehouseId, setActiveWarehouseId] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_WAREHOUSE) || 'ALL';
    } catch {
      return 'ALL';
    }
  });

  // 2. Load from Supabase on startup if configured
  useEffect(() => {
    const initSupabaseData = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setIsSupabaseConnected(false);
        return;
      }

      setIsLoadingDB(true);
      try {
        const cloudData = await inventoryService.fetchAll();
        if (cloudData) {
          setIsSupabaseConnected(true);
          if (cloudData.warehouses.length > 0) setWarehouses(cloudData.warehouses);
          if (cloudData.products.length > 0) setProducts(cloudData.products);
          if (cloudData.receipts) setReceipts(cloudData.receipts);
          if (cloudData.deliveries) setDeliveries(cloudData.deliveries);
          if (cloudData.transfers) setTransfers(cloudData.transfers);
          if (cloudData.adjustments) setAdjustments(cloudData.adjustments);
          if (cloudData.moveHistory) setMoveHistory(cloudData.moveHistory);
        } else {
          setIsSupabaseConnected(false);
        }
      } catch (err) {
        console.warn('Supabase initial fetch failed, falling back to local data', err);
        setIsSupabaseConnected(false);
      } finally {
        setIsLoadingDB(false);
      }
    };

    initSupabaseData();
  }, []);

  // 3. Persist to localStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(warehouses));
    } catch (e) {
      console.error('Failed saving warehouses', e);
    }
  }, [warehouses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed saving products', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
    } catch (e) {
      console.error('Failed saving receipts', e);
    }
  }, [receipts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DELIVERIES, JSON.stringify(deliveries));
    } catch (e) {
      console.error('Failed saving deliveries', e);
    }
  }, [deliveries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSFERS, JSON.stringify(transfers));
    } catch (e) {
      console.error('Failed saving transfers', e);
    }
  }, [transfers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADJUSTMENTS, JSON.stringify(adjustments));
    } catch (e) {
      console.error('Failed saving adjustments', e);
    }
  }, [adjustments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVE_HISTORY, JSON.stringify(moveHistory));
    } catch (e) {
      console.error('Failed saving moveHistory', e);
    }
  }, [moveHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_WAREHOUSE, activeWarehouseId);
    } catch (e) {
      console.error('Failed saving activeWarehouseId', e);
    }
  }, [activeWarehouseId]);

  // 4. Helper calculations
  const getProductQuantity = useCallback((product, warehouseId = activeWarehouseId) => {
    if (!product || !product.stockByWarehouse) return 0;
    if (warehouseId && warehouseId !== 'ALL') {
      return product.stockByWarehouse[warehouseId]?.quantity || 0;
    }
    return Object.values(product.stockByWarehouse).reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );
  }, [activeWarehouseId]);

  const getProductStatus = useCallback((quantity, reorderLevel) => {
    if (quantity === 0) return 'OUT_OF_STOCK';
    if (quantity <= reorderLevel) return 'LOW_STOCK';
    return 'IN_STOCK';
  }, []);

  // Filtered Products with computed total quantity
  const enrichedProducts = useMemo(() => {
    return products.map((prod) => {
      const qty = getProductQuantity(prod, activeWarehouseId);
      const totalCompanyQty = getProductQuantity(prod, 'ALL');
      const status = getProductStatus(qty, prod.reorderLevel);
      return {
        ...prod,
        quantity: qty,
        totalCompanyQuantity: totalCompanyQty,
        status,
        totalValue: (qty * (prod.unitPrice || 0))
      };
    });
  }, [products, activeWarehouseId, getProductQuantity, getProductStatus]);

  // Derived Summary Metrics
  const summary = useMemo(() => {
    const totalProducts = enrichedProducts.length;
    const totalStock = enrichedProducts.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockItems = enrichedProducts.filter((p) => p.status === 'LOW_STOCK');
    const outOfStockItems = enrichedProducts.filter((p) => p.status === 'OUT_OF_STOCK');
    const inStockItems = enrichedProducts.filter((p) => p.status === 'IN_STOCK');
    const totalValue = enrichedProducts.reduce((sum, p) => sum + p.totalValue, 0);

    // Filter operations by active warehouse if selected
    const filterByWh = (whId) => activeWarehouseId === 'ALL' || whId === activeWarehouseId;

    const filteredReceipts = receipts.filter(r => filterByWh(r.warehouseId));
    const filteredDeliveries = deliveries.filter(d => filterByWh(d.warehouseId));

    const todayStr = new Date().toISOString().split('T')[0];

    const receiptsStats = {
      pending: filteredReceipts.filter(r => r.status === 'READY' || r.status === 'DRAFT').length,
      late: filteredReceipts.filter(r => (r.status === 'READY' || r.status === 'DRAFT') && r.scheduledDate && r.scheduledDate < todayStr).length,
      total: filteredReceipts.length,
      done: filteredReceipts.filter(r => r.status === 'DONE').length
    };

    const deliveriesStats = {
      pending: filteredDeliveries.filter(d => d.status === 'WAITING' || d.status === 'DRAFT').length,
      late: filteredDeliveries.filter(d => (d.status === 'WAITING' || d.status === 'DRAFT') && d.scheduledDate && d.scheduledDate < todayStr).length,
      total: filteredDeliveries.length,
      done: filteredDeliveries.filter(d => d.status === 'DONE').length
    };

    const transfersStats = {
      inTransit: transfers.filter(t => t.status === 'IN_TRANSIT').length,
      total: transfers.length
    };

    return {
      totalProducts,
      totalStock,
      lowStockCount: lowStockItems.length,
      lowStockItems,
      outOfStockCount: outOfStockItems.length,
      outOfStockItems,
      inStockCount: inStockItems.length,
      totalValue,
      receiptsStats,
      deliveriesStats,
      transfersStats
    };
  }, [enrichedProducts, receipts, deliveries, transfers, activeWarehouseId]);

  // 5. CRUD & Operations logic (Syncs to Supabase when active)

  // A. Product Management
  const addProduct = useCallback((productInput) => {
    const newId = generateId('PRD', products);
    const sku = productInput.sku ? productInput.sku.toUpperCase() : `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
    const initQty = Number(productInput.initialQuantity) || 0;
    const warehouseId = productInput.warehouseId || warehouses[0]?.id || 'WH-001';
    const location = productInput.location || 'Rack A-01';

    const stockByWarehouse = {};
    warehouses.forEach(wh => {
      stockByWarehouse[wh.id] = {
        quantity: wh.id === warehouseId ? initQty : 0,
        location: wh.id === warehouseId ? location : (wh.locations[0] || 'Default Bay')
      };
    });

    const newProduct = {
      id: newId,
      name: productInput.name,
      sku,
      category: productInput.category || 'General',
      unit: productInput.unit || 'Units',
      unitPrice: Number(productInput.unitPrice) || 0,
      reorderLevel: Number(productInput.reorderLevel) || 10,
      description: productInput.description || '',
      supplier: productInput.supplier || 'Standard Supplier',
      stockByWarehouse
    };

    setProducts((prev) => [newProduct, ...prev]);
    inventoryService.saveProduct(newProduct);

    // Record Move History if initial quantity is > 0
    if (initQty > 0) {
      const whObj = warehouses.find(w => w.id === warehouseId);
      const moveEntry = {
        id: generateId('MOV', moveHistory),
        date: new Date().toISOString(),
        type: 'INITIAL',
        productId: newId,
        productName: newProduct.name,
        sku: newProduct.sku,
        quantity: initQty,
        unit: newProduct.unit,
        source: 'Initial Setup / Opening Stock',
        destination: `${whObj?.name || 'Warehouse'} (${location})`,
        user: 'Inventory System',
        referenceId: newId,
        notes: 'Initial opening stock registration'
      };
      setMoveHistory((prev) => [moveEntry, ...prev]);
      inventoryService.saveMoveHistory(moveEntry);
    }

    return newProduct;
  }, [products, warehouses, moveHistory]);

  const updateProduct = useCallback((id, updatedFields) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod;
        const updated = {
          ...prod,
          name: updatedFields.name ?? prod.name,
          sku: updatedFields.sku ? updatedFields.sku.toUpperCase() : prod.sku,
          category: updatedFields.category ?? prod.category,
          unit: updatedFields.unit ?? prod.unit,
          unitPrice: updatedFields.unitPrice !== undefined ? Number(updatedFields.unitPrice) : prod.unitPrice,
          reorderLevel: updatedFields.reorderLevel !== undefined ? Number(updatedFields.reorderLevel) : prod.reorderLevel,
          description: updatedFields.description ?? prod.description,
          supplier: updatedFields.supplier ?? prod.supplier
        };
        inventoryService.saveProduct(updated);
        return updated;
      })
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    inventoryService.deleteProduct(id);
  }, []);

  // B. Receipts Management
  const addReceipt = useCallback((receiptInput) => {
    const newId = generateId('REC', receipts);
    const prod = products.find(p => p.id === receiptInput.productId);
    const wh = warehouses.find(w => w.id === receiptInput.warehouseId);
    const qty = Number(receiptInput.quantity) || 1;

    const newReceipt = {
      id: newId,
      supplier: receiptInput.supplier || prod?.supplier || 'Default Supplier',
      productId: receiptInput.productId,
      productName: prod ? prod.name : 'Unknown Product',
      sku: prod ? prod.sku : 'SKU-000',
      quantity: qty,
      unit: prod?.unit || 'Units',
      warehouseId: receiptInput.warehouseId,
      warehouseName: wh ? wh.name : 'Warehouse',
      location: receiptInput.location || prod?.stockByWarehouse?.[receiptInput.warehouseId]?.location || 'Receiving Bay',
      status: receiptInput.status || 'READY',
      scheduledDate: receiptInput.scheduledDate || new Date().toISOString().split('T')[0],
      completedDate: null,
      notes: receiptInput.notes || ''
    };

    setReceipts((prev) => [newReceipt, ...prev]);
    inventoryService.saveReceipt(newReceipt);
    return newReceipt;
  }, [receipts, products, warehouses]);

  const validateReceipt = useCallback((receiptId) => {
    const target = receipts.find(r => r.id === receiptId);
    if (!target) return { success: false, message: 'Receipt not found' };
    if (target.status === 'DONE') return { success: false, message: 'Receipt is already validated' };

    const qty = Number(target.quantity) || 0;
    const completedDate = new Date().toISOString();

    // 1. Update product stock in that warehouse
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== target.productId) return prod;
        const currentWhStock = prod.stockByWarehouse?.[target.warehouseId] || { quantity: 0, location: target.location || 'Bay 01' };
        const newQty = (Number(currentWhStock.quantity) || 0) + qty;
        
        inventoryService.updateProductStock(target.productId, target.warehouseId, newQty, target.location || currentWhStock.location);

        return {
          ...prod,
          stockByWarehouse: {
            ...prod.stockByWarehouse,
            [target.warehouseId]: {
              ...currentWhStock,
              quantity: newQty,
              location: target.location || currentWhStock.location
            }
          }
        };
      })
    );

    // 2. Mark receipt as DONE
    const updatedReceipt = { ...target, status: 'DONE', completedDate };
    setReceipts((prev) =>
      prev.map((r) => r.id === receiptId ? updatedReceipt : r)
    );
    inventoryService.saveReceipt(updatedReceipt);

    // 3. Create Move History entry
    const moveEntry = {
      id: generateId('MOV', moveHistory),
      date: completedDate,
      type: 'RECEIPT',
      productId: target.productId,
      productName: target.productName,
      sku: target.sku,
      quantity: qty,
      unit: target.unit,
      source: `Supplier: ${target.supplier}`,
      destination: `${target.warehouseName} (${target.location || 'Receiving'})`,
      user: 'Dave Miller (Warehouse Staff)',
      referenceId: target.id,
      notes: target.notes || 'Goods receipt verified & shelved'
    };
    setMoveHistory((prev) => [moveEntry, ...prev]);
    inventoryService.saveMoveHistory(moveEntry);

    return { success: true, message: `Successfully received +${qty} ${target.unit} of ${target.productName}` };
  }, [receipts, moveHistory]);

  const cancelReceipt = useCallback((receiptId) => {
    setReceipts(prev => prev.map(r => {
      if (r.id === receiptId) {
        const updated = { ...r, status: 'CANCELLED' };
        inventoryService.saveReceipt(updated);
        return updated;
      }
      return r;
    }));
  }, []);

  // C. Deliveries Management
  const addDelivery = useCallback((deliveryInput) => {
    const newId = generateId('DEL', deliveries);
    const prod = products.find(p => p.id === deliveryInput.productId);
    const wh = warehouses.find(w => w.id === deliveryInput.warehouseId);
    const qty = Number(deliveryInput.quantity) || 1;

    const newDelivery = {
      id: newId,
      customer: deliveryInput.customer || 'Standard Customer',
      productId: deliveryInput.productId,
      productName: prod ? prod.name : 'Unknown Product',
      sku: prod ? prod.sku : 'SKU-000',
      quantity: qty,
      unit: prod?.unit || 'Units',
      warehouseId: deliveryInput.warehouseId,
      warehouseName: wh ? wh.name : 'Warehouse',
      status: deliveryInput.status || 'WAITING',
      scheduledDate: deliveryInput.scheduledDate || new Date().toISOString().split('T')[0],
      completedDate: null,
      notes: deliveryInput.notes || ''
    };

    setDeliveries((prev) => [newDelivery, ...prev]);
    inventoryService.saveDelivery(newDelivery);
    return newDelivery;
  }, [deliveries, products, warehouses]);

  const validateDelivery = useCallback((deliveryId) => {
    const target = deliveries.find(d => d.id === deliveryId);
    if (!target) return { success: false, message: 'Delivery order not found' };
    if (target.status === 'DONE') return { success: false, message: 'Delivery is already completed' };

    const prod = products.find(p => p.id === target.productId);
    if (!prod) return { success: false, message: 'Product not found' };

    const currentQty = prod.stockByWarehouse?.[target.warehouseId]?.quantity || 0;
    const requestedQty = Number(target.quantity) || 0;

    // Business Rule: Delivery cannot exceed available stock
    if (currentQty < requestedQty) {
      return {
        success: false,
        message: `Insufficient stock in ${target.warehouseName}! Available: ${currentQty} ${target.unit}, Requested: ${requestedQty} ${target.unit}.`
      };
    }

    const completedDate = new Date().toISOString();
    const newQty = currentQty - requestedQty;

    // 1. Decrease product quantity in warehouse
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== target.productId) return p;
        const currentWhStock = p.stockByWarehouse?.[target.warehouseId];
        
        inventoryService.updateProductStock(target.productId, target.warehouseId, newQty, currentWhStock?.location);

        return {
          ...p,
          stockByWarehouse: {
            ...p.stockByWarehouse,
            [target.warehouseId]: {
              ...currentWhStock,
              quantity: newQty
            }
          }
        };
      })
    );

    // 2. Mark delivery as DONE
    const updatedDelivery = { ...target, status: 'DONE', completedDate };
    setDeliveries((prev) =>
      prev.map((d) => d.id === deliveryId ? updatedDelivery : d)
    );
    inventoryService.saveDelivery(updatedDelivery);

    // 3. Create Move History entry
    const moveEntry = {
      id: generateId('MOV', moveHistory),
      date: completedDate,
      type: 'DELIVERY',
      productId: target.productId,
      productName: target.productName,
      sku: target.sku,
      quantity: -requestedQty,
      unit: target.unit,
      source: target.warehouseName,
      destination: `Customer: ${target.customer}`,
      user: 'Sarah Jenkins (Fulfillment Staff)',
      referenceId: target.id,
      notes: target.notes || 'Order picked, packed & dispatched'
    };
    setMoveHistory((prev) => [moveEntry, ...prev]);
    inventoryService.saveMoveHistory(moveEntry);

    return { success: true, message: `Dispatched -${requestedQty} ${target.unit} of ${target.productName} to ${target.customer}` };
  }, [deliveries, products, moveHistory]);

  const cancelDelivery = useCallback((deliveryId) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId) {
        const updated = { ...d, status: 'CANCELLED' };
        inventoryService.saveDelivery(updated);
        return updated;
      }
      return d;
    }));
  }, []);

  // D. Internal Transfers Management
  const addTransfer = useCallback((transferInput) => {
    const prod = products.find(p => p.id === transferInput.productId);
    if (!prod) return { success: false, message: 'Product not found' };

    const sourceWh = warehouses.find(w => w.id === transferInput.sourceWarehouseId);
    const destWh = warehouses.find(w => w.id === transferInput.destWarehouseId);

    if (!sourceWh || !destWh) return { success: false, message: 'Invalid source or destination warehouse' };
    if (sourceWh.id === destWh.id) return { success: false, message: 'Source and destination warehouses cannot be the same' };

    const qty = Number(transferInput.quantity) || 0;
    if (qty <= 0) return { success: false, message: 'Transfer quantity must be greater than 0' };

    const sourceAvailable = prod.stockByWarehouse?.[sourceWh.id]?.quantity || 0;
    if (sourceAvailable < qty) {
      return {
        success: false,
        message: `Insufficient stock in ${sourceWh.name}! Available: ${sourceAvailable} ${prod.unit}, Transfer Requested: ${qty} ${prod.unit}.`
      };
    }

    const newId = generateId('TRF', transfers);
    const newTransfer = {
      id: newId,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: qty,
      unit: prod.unit,
      sourceWarehouseId: sourceWh.id,
      sourceWarehouseName: sourceWh.name,
      destWarehouseId: destWh.id,
      destWarehouseName: destWh.name,
      status: 'DONE',
      date: new Date().toISOString(),
      notes: transferInput.notes || 'Stock rebalancing between locations'
    };

    const newSourceQty = Math.max(0, (Number(prod.stockByWarehouse?.[sourceWh.id]?.quantity) || 0) - qty);
    const newDestQty = (Number(prod.stockByWarehouse?.[destWh.id]?.quantity) || 0) + qty;

    inventoryService.updateProductStock(prod.id, sourceWh.id, newSourceQty, prod.stockByWarehouse?.[sourceWh.id]?.location);
    inventoryService.updateProductStock(prod.id, destWh.id, newDestQty, prod.stockByWarehouse?.[destWh.id]?.location);

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== prod.id) return p;
        const sourceWhStock = p.stockByWarehouse?.[sourceWh.id] || { quantity: 0, location: sourceWh.locations[0] || 'Bay 01' };
        const destWhStock = p.stockByWarehouse?.[destWh.id] || { quantity: 0, location: destWh.locations[0] || 'Bay 01' };

        return {
          ...p,
          stockByWarehouse: {
            ...p.stockByWarehouse,
            [sourceWh.id]: { ...sourceWhStock, quantity: newSourceQty },
            [destWh.id]: { ...destWhStock, quantity: newDestQty }
          }
        };
      })
    );

    setTransfers((prev) => [newTransfer, ...prev]);
    inventoryService.saveTransfer(newTransfer);

    const moveEntry = {
      id: generateId('MOV', moveHistory),
      date: new Date().toISOString(),
      type: 'TRANSFER',
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: qty,
      unit: prod.unit,
      source: sourceWh.name,
      destination: destWh.name,
      user: 'Alex Morgan (Inventory Mgr)',
      referenceId: newId,
      notes: transferInput.notes || 'Internal stock relocation'
    };
    setMoveHistory((prev) => [moveEntry, ...prev]);
    inventoryService.saveMoveHistory(moveEntry);

    return { success: true, message: `Transferred ${qty} ${prod.unit} from ${sourceWh.name} to ${destWh.name}` };
  }, [products, warehouses, transfers, moveHistory]);

  // E. Adjustments Management
  const addAdjustment = useCallback((adjustmentInput) => {
    const prod = products.find(p => p.id === adjustmentInput.productId);
    if (!prod) return { success: false, message: 'Product not found' };

    const wh = warehouses.find(w => w.id === adjustmentInput.warehouseId);
    if (!wh) return { success: false, message: 'Warehouse not found' };

    const countedQty = Number(adjustmentInput.countedQuantity);
    if (isNaN(countedQty) || countedQty < 0) {
      return { success: false, message: 'Counted quantity must be a non-negative number' };
    }

    const currentSystemQty = prod.stockByWarehouse?.[wh.id]?.quantity || 0;
    const diff = countedQty - currentSystemQty;

    const newId = generateId('ADJ', adjustments);
    const newAdjustment = {
      id: newId,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      warehouseId: wh.id,
      warehouseName: wh.name,
      systemQuantity: currentSystemQty,
      countedQuantity: countedQty,
      difference: diff,
      unit: prod.unit,
      reason: adjustmentInput.reason || 'Cycle count physical verification',
      date: new Date().toISOString(),
      user: adjustmentInput.user || 'Alex Morgan (Inventory Mgr)'
    };

    inventoryService.updateProductStock(prod.id, wh.id, countedQty, prod.stockByWarehouse?.[wh.id]?.location);

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== prod.id) return p;
        const whStock = p.stockByWarehouse?.[wh.id] || { quantity: 0, location: wh.locations[0] || 'Bay 01' };
        return {
          ...p,
          stockByWarehouse: {
            ...p.stockByWarehouse,
            [wh.id]: { ...whStock, quantity: countedQty }
          }
        };
      })
    );

    setAdjustments((prev) => [newAdjustment, ...prev]);
    inventoryService.saveAdjustment(newAdjustment);

    const moveEntry = {
      id: generateId('MOV', moveHistory),
      date: new Date().toISOString(),
      type: 'ADJUSTMENT',
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: diff,
      unit: prod.unit,
      source: diff < 0 ? `${wh.name} (Count: ${countedQty})` : 'Inventory Surplus Audit',
      destination: diff < 0 ? 'Adjustment Write-off' : `${wh.name} (Count: ${countedQty})`,
      user: adjustmentInput.user || 'Alex Morgan (Inventory Mgr)',
      referenceId: newId,
      notes: `${adjustmentInput.reason || 'Physical Count Adjustment'} (${diff >= 0 ? '+' : ''}${diff} ${prod.unit})`
    };
    setMoveHistory((prev) => [moveEntry, ...prev]);
    inventoryService.saveMoveHistory(moveEntry);

    return {
      success: true,
      message: `Stock adjusted for ${prod.name}: ${currentSystemQty} → ${countedQty} ${prod.unit} (${diff >= 0 ? '+' : ''}${diff})`
    };
  }, [products, warehouses, adjustments, moveHistory]);

  // F. Warehouse Management
  const addWarehouse = useCallback((warehouseInput) => {
    const newId = generateId('WH', warehouses);
    const newWarehouse = {
      id: newId,
      name: warehouseInput.name,
      code: warehouseInput.code ? warehouseInput.code.toUpperCase() : `WH-${warehouses.length + 1}`,
      address: warehouseInput.address || '',
      isPrimary: warehouses.length === 0,
      locations: warehouseInput.locations && warehouseInput.locations.length > 0
        ? warehouseInput.locations
        : ['Rack A-01', 'Rack B-01', 'Staging Area']
    };

    setWarehouses((prev) => [...prev, newWarehouse]);
    inventoryService.saveWarehouse(newWarehouse);

    setProducts((prev) =>
      prev.map((prod) => ({
        ...prod,
        stockByWarehouse: {
          ...prod.stockByWarehouse,
          [newId]: {
            quantity: 0,
            location: newWarehouse.locations[0] || 'Rack A-01'
          }
        }
      }))
    );

    return newWarehouse;
  }, [warehouses]);

  const updateWarehouse = useCallback((id, updatedFields) => {
    setWarehouses((prev) =>
      prev.map((wh) => {
        if (wh.id === id) {
          const updated = { ...wh, ...updatedFields };
          inventoryService.saveWarehouse(updated);
          return updated;
        }
        return wh;
      })
    );
  }, []);

  // G. Reset Mock Data
  const resetToMockData = useCallback(() => {
    localStorage.clear();
    setWarehouses(INITIAL_WAREHOUSES);
    setProducts(INITIAL_PRODUCTS);
    setReceipts(INITIAL_RECEIPTS);
    setDeliveries(INITIAL_DELIVERIES);
    setTransfers(INITIAL_TRANSFERS);
    setAdjustments(INITIAL_ADJUSTMENTS);
    setMoveHistory(INITIAL_MOVE_HISTORY);
    setActiveWarehouseId('ALL');
  }, []);

  const value = {
    warehouses,
    products: enrichedProducts,
    rawProducts: products,
    receipts,
    deliveries,
    transfers,
    adjustments,
    moveHistory,
    activeWarehouseId,
    setActiveWarehouseId,
    summary,
    isSupabaseConnected,
    isLoadingDB,
    getProductQuantity,
    getProductStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    addReceipt,
    validateReceipt,
    cancelReceipt,
    addDelivery,
    validateDelivery,
    cancelDelivery,
    addTransfer,
    addAdjustment,
    addWarehouse,
    updateWarehouse,
    resetToMockData
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
