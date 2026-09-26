import { getSupabaseClient } from './supabaseClient';
import {
  INITIAL_WAREHOUSES,
  INITIAL_PRODUCTS,
  INITIAL_RECEIPTS,
  INITIAL_DELIVERIES,
  INITIAL_TRANSFERS,
  INITIAL_ADJUSTMENTS,
  INITIAL_MOVE_HISTORY
} from '../data/mockData';

export const inventoryService = {
  // 1. Fetch entire dataset from Supabase
  async fetchAll() {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    try {
      // Parallel fetch from all tables
      const [
        whRes,
        prodRes,
        stockRes,
        recRes,
        delRes,
        trfRes,
        adjRes,
        movRes
      ] = await Promise.all([
        supabase.from('warehouses').select('*'),
        supabase.from('products').select('*'),
        supabase.from('product_stock').select('*'),
        supabase.from('receipts').select('*').order('created_at', { ascending: false }),
        supabase.from('deliveries').select('*').order('created_at', { ascending: false }),
        supabase.from('transfers').select('*').order('date', { ascending: false }),
        supabase.from('adjustments').select('*').order('date', { ascending: false }),
        supabase.from('move_history').select('*').order('date', { ascending: false })
      ]);

      if (whRes.error || prodRes.error) {
        console.warn('Supabase fetch error:', whRes.error || prodRes.error);
        return null;
      }

      // If database is completely fresh and empty, auto-seed it
      if (whRes.data.length === 0 && prodRes.data.length === 0) {
        console.log('Fresh Supabase DB detected. Seeding initial dataset...');
        await this.seedInitialDatabase();
        return await this.fetchAll();
      }

      // Map warehouses
      const warehouses = whRes.data.map(w => ({
        id: w.id,
        name: w.name,
        code: w.code,
        address: w.address,
        isPrimary: w.is_primary,
        locations: Array.isArray(w.locations) ? w.locations : JSON.parse(w.locations || '[]')
      }));

      // Map product stock by warehouse
      const stockMap = {};
      (stockRes.data || []).forEach(st => {
        if (!stockMap[st.product_id]) {
          stockMap[st.product_id] = {};
        }
        stockMap[st.product_id][st.warehouse_id] = {
          quantity: st.quantity,
          location: st.location || 'Rack A-01'
        };
      });

      // Map products
      const products = prodRes.data.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unit: p.unit,
        unitPrice: Number(p.unit_price) || 0,
        reorderLevel: Number(p.reorder_level) || 10,
        description: p.description || '',
        supplier: p.supplier || '',
        stockByWarehouse: stockMap[p.id] || {}
      }));

      // Map receipts
      const receipts = (recRes.data || []).map(r => ({
        id: r.id,
        supplier: r.supplier,
        productId: r.product_id,
        productName: r.product_name,
        sku: r.sku,
        quantity: r.quantity,
        unit: r.unit,
        warehouseId: r.warehouse_id,
        warehouseName: r.warehouse_name,
        location: r.location,
        status: r.status,
        scheduledDate: r.scheduled_date,
        completedDate: r.completed_date,
        notes: r.notes
      }));

      // Map deliveries
      const deliveries = (delRes.data || []).map(d => ({
        id: d.id,
        customer: d.customer,
        productId: d.product_id,
        productName: d.product_name,
        sku: d.sku,
        quantity: d.quantity,
        unit: d.unit,
        warehouseId: d.warehouse_id,
        warehouseName: d.warehouse_name,
        status: d.status,
        scheduledDate: d.scheduled_date,
        completedDate: d.completed_date,
        notes: d.notes
      }));

      // Map transfers
      const transfers = (trfRes.data || []).map(t => ({
        id: t.id,
        productId: t.product_id,
        productName: t.product_name,
        sku: t.sku,
        quantity: t.quantity,
        unit: t.unit,
        sourceWarehouseId: t.source_warehouse_id,
        sourceWarehouseName: t.source_warehouse_name,
        destWarehouseId: t.dest_warehouse_id,
        destWarehouseName: t.dest_warehouse_name,
        status: t.status,
        date: t.date,
        notes: t.notes
      }));

      // Map adjustments
      const adjustments = (adjRes.data || []).map(a => ({
        id: a.id,
        productId: a.product_id,
        productName: a.product_name,
        sku: a.sku,
        warehouseId: a.warehouse_id,
        warehouseName: a.warehouse_name,
        systemQuantity: a.system_quantity,
        countedQuantity: a.counted_quantity,
        difference: a.difference,
        unit: a.unit,
        reason: a.reason,
        date: a.date,
        user: a.operator
      }));

      // Map move history
      const moveHistory = (movRes.data || []).map(m => ({
        id: m.id,
        date: m.date,
        type: m.type,
        productId: m.product_id,
        productName: m.product_name,
        sku: m.sku,
        quantity: m.quantity,
        unit: m.unit,
        source: m.source,
        destination: m.destination,
        user: m.operator,
        referenceId: m.reference_id,
        notes: m.notes
      }));

      return {
        warehouses,
        products,
        receipts,
        deliveries,
        transfers,
        adjustments,
        moveHistory
      };
    } catch (err) {
      console.error('Error in inventoryService.fetchAll', err);
      return null;
    }
  },

  // 2. Initial Seeding helper for new Supabase projects
  async seedInitialDatabase() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      // 1. Warehouses
      const whInserts = INITIAL_WAREHOUSES.map(w => ({
        id: w.id,
        name: w.name,
        code: w.code,
        address: w.address,
        is_primary: w.isPrimary,
        locations: w.locations
      }));
      await supabase.from('warehouses').upsert(whInserts);

      // 2. Products & Stock
      const prodInserts = INITIAL_PRODUCTS.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unit: p.unit,
        unit_price: p.unitPrice,
        reorder_level: p.reorderLevel,
        description: p.description,
        supplier: p.supplier
      }));
      await supabase.from('products').upsert(prodInserts);

      const stockInserts = [];
      INITIAL_PRODUCTS.forEach(p => {
        Object.entries(p.stockByWarehouse || {}).forEach(([whId, item]) => {
          stockInserts.push({
            product_id: p.id,
            warehouse_id: whId,
            quantity: item.quantity,
            location: item.location
          });
        });
      });
      await supabase.from('product_stock').upsert(stockInserts);

      // 3. Receipts
      const recInserts = INITIAL_RECEIPTS.map(r => ({
        id: r.id,
        supplier: r.supplier,
        product_id: r.productId,
        product_name: r.productName,
        sku: r.sku,
        quantity: r.quantity,
        unit: r.unit,
        warehouse_id: r.warehouseId,
        warehouse_name: r.warehouseName,
        location: r.location,
        status: r.status,
        scheduled_date: r.scheduledDate,
        completed_date: r.completedDate,
        notes: r.notes
      }));
      await supabase.from('receipts').upsert(recInserts);

      // 4. Deliveries
      const delInserts = INITIAL_DELIVERIES.map(d => ({
        id: d.id,
        customer: d.customer,
        product_id: d.productId,
        product_name: d.productName,
        sku: d.sku,
        quantity: d.quantity,
        unit: d.unit,
        warehouse_id: d.warehouseId,
        warehouse_name: d.warehouseName,
        status: d.status,
        scheduled_date: d.scheduledDate,
        completed_date: d.completedDate,
        notes: d.notes
      }));
      await supabase.from('deliveries').upsert(delInserts);

      // 5. Transfers
      const trfInserts = INITIAL_TRANSFERS.map(t => ({
        id: t.id,
        product_id: t.productId,
        product_name: t.productName,
        sku: t.sku,
        quantity: t.quantity,
        unit: t.unit,
        source_warehouse_id: t.sourceWarehouseId,
        source_warehouse_name: t.sourceWarehouseName,
        dest_warehouse_id: t.destWarehouseId,
        dest_warehouse_name: t.destWarehouseName,
        status: t.status,
        date: t.date,
        notes: t.notes
      }));
      await supabase.from('transfers').upsert(trfInserts);

      // 6. Adjustments
      const adjInserts = INITIAL_ADJUSTMENTS.map(a => ({
        id: a.id,
        product_id: a.productId,
        product_name: a.productName,
        sku: a.sku,
        warehouse_id: a.warehouseId,
        warehouse_name: a.warehouseName,
        system_quantity: a.systemQuantity,
        counted_quantity: a.countedQuantity,
        difference: a.difference,
        unit: a.unit,
        reason: a.reason,
        date: a.date,
        operator: a.user
      }));
      await supabase.from('adjustments').upsert(adjInserts);

      // 7. Move History
      const movInserts = INITIAL_MOVE_HISTORY.map(m => ({
        id: m.id,
        date: m.date,
        type: m.type,
        product_id: m.productId,
        product_name: m.productName,
        sku: m.sku,
        quantity: m.quantity,
        unit: m.unit,
        source: m.source,
        destination: m.destination,
        operator: m.user,
        reference_id: m.referenceId,
        notes: m.notes
      }));
      await supabase.from('move_history').upsert(movInserts);

      console.log('Supabase Initial Seeding complete!');
    } catch (e) {
      console.error('Error during initial seeding', e);
    }
  },

  // 3. Mutators
  async saveProduct(product) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        unit: product.unit,
        unit_price: product.unitPrice,
        reorder_level: product.reorderLevel,
        description: product.description,
        supplier: product.supplier
      });

      // Update product_stock entries
      if (product.stockByWarehouse) {
        const stockItems = Object.entries(product.stockByWarehouse).map(([whId, item]) => ({
          product_id: product.id,
          warehouse_id: whId,
          quantity: item.quantity,
          location: item.location
        }));
        await supabase.from('product_stock').upsert(stockItems);
      }
    } catch (e) {
      console.error('Supabase saveProduct error', e);
    }
  },

  async updateProductStock(productId, warehouseId, quantity, location) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('product_stock').upsert({
        product_id: productId,
        warehouse_id: warehouseId,
        quantity: quantity,
        location: location || 'Rack A-01'
      });
    } catch (e) {
      console.error('Supabase updateProductStock error', e);
    }
  },

  async deleteProduct(productId) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('products').delete().eq('id', productId);
    } catch (e) {
      console.error('Supabase deleteProduct error', e);
    }
  },

  async saveReceipt(receipt) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('receipts').upsert({
        id: receipt.id,
        supplier: receipt.supplier,
        product_id: receipt.productId,
        product_name: receipt.productName,
        sku: receipt.sku,
        quantity: receipt.quantity,
        unit: receipt.unit,
        warehouse_id: receipt.warehouseId,
        warehouse_name: receipt.warehouseName,
        location: receipt.location,
        status: receipt.status,
        scheduled_date: receipt.scheduledDate,
        completed_date: receipt.completedDate,
        notes: receipt.notes
      });
    } catch (e) {
      console.error('Supabase saveReceipt error', e);
    }
  },

  async saveDelivery(delivery) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('deliveries').upsert({
        id: delivery.id,
        customer: delivery.customer,
        product_id: delivery.productId,
        product_name: delivery.productName,
        sku: delivery.sku,
        quantity: delivery.quantity,
        unit: delivery.unit,
        warehouse_id: delivery.warehouseId,
        warehouse_name: delivery.warehouseName,
        status: delivery.status,
        scheduled_date: delivery.scheduledDate,
        completed_date: delivery.completedDate,
        notes: delivery.notes
      });
    } catch (e) {
      console.error('Supabase saveDelivery error', e);
    }
  },

  async saveTransfer(transfer) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('transfers').upsert({
        id: transfer.id,
        product_id: transfer.productId,
        product_name: transfer.productName,
        sku: transfer.sku,
        quantity: transfer.quantity,
        unit: transfer.unit,
        source_warehouse_id: transfer.sourceWarehouseId,
        source_warehouse_name: transfer.sourceWarehouseName,
        dest_warehouse_id: transfer.destWarehouseId,
        dest_warehouse_name: transfer.destWarehouseName,
        status: transfer.status,
        date: transfer.date,
        notes: transfer.notes
      });
    } catch (e) {
      console.error('Supabase saveTransfer error', e);
    }
  },

  async saveAdjustment(adjustment) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('adjustments').upsert({
        id: adjustment.id,
        product_id: adjustment.productId,
        product_name: adjustment.productName,
        sku: adjustment.sku,
        warehouse_id: adjustment.warehouseId,
        warehouse_name: adjustment.warehouseName,
        system_quantity: adjustment.systemQuantity,
        counted_quantity: adjustment.countedQuantity,
        difference: adjustment.difference,
        unit: adjustment.unit,
        reason: adjustment.reason,
        date: adjustment.date,
        operator: adjustment.user
      });
    } catch (e) {
      console.error('Supabase saveAdjustment error', e);
    }
  },

  async saveMoveHistory(move) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('move_history').upsert({
        id: move.id,
        date: move.date,
        type: move.type,
        product_id: move.productId,
        product_name: move.productName,
        sku: move.sku,
        quantity: move.quantity,
        unit: move.unit,
        source: move.source,
        destination: move.destination,
        operator: move.user,
        reference_id: move.referenceId,
        notes: move.notes
      });
    } catch (e) {
      console.error('Supabase saveMoveHistory error', e);
    }
  },

  async saveWarehouse(warehouse) {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    try {
      await supabase.from('warehouses').upsert({
        id: warehouse.id,
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address,
        is_primary: warehouse.isPrimary,
        locations: warehouse.locations
      });
    } catch (e) {
      console.error('Supabase saveWarehouse error', e);
    }
  }
};
