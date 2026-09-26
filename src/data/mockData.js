/**
 * Initial Seed Mock Data for StockSense
 * Realistic enterprise inventory dataset
 */

export const INITIAL_WAREHOUSES = [
  {
    id: 'WH-001',
    name: 'Main Central Warehouse',
    code: 'WH-MAIN',
    address: '1040 Logistics Blvd, Dallas, TX 75261',
    isPrimary: true,
    locations: ['Rack A-01', 'Rack A-02', 'Rack B-01', 'Rack B-02', 'Bulk Storage Floor', 'Receiving Bay']
  },
  {
    id: 'WH-002',
    name: 'North Regional Hub',
    code: 'WH-NORTH',
    address: '420 Commerce Way, Chicago, IL 60607',
    isPrimary: false,
    locations: ['Rack N-101', 'Rack N-102', 'Shelf 04', 'Staging Zone']
  },
  {
    id: 'WH-003',
    name: 'East Coast Distribution',
    code: 'WH-EAST',
    address: '88 Harbor Terminal Dr, Newark, NJ 07114',
    isPrimary: false,
    locations: ['Bay 101', 'Bay 102', 'Secure Cage', 'High-Rack 03']
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'PRD-001',
    name: 'Steel Rods (12mm x 6m)',
    sku: 'RAW-STL-12MM',
    category: 'Raw Materials',
    unit: 'Pieces',
    unitPrice: 28.50,
    reorderLevel: 50,
    description: 'High tensile structural grade steel reinforcement rods.',
    supplier: 'Acme Steel & Forgings',
    stockByWarehouse: {
      'WH-001': { quantity: 95, location: 'Rack A-01' },
      'WH-002': { quantity: 45, location: 'Rack N-101' },
      'WH-003': { quantity: 20, location: 'Bay 101' }
    }
  },
  {
    id: 'PRD-002',
    name: 'Ergonomic Mesh Office Chair',
    sku: 'FUR-CHR-ERG01',
    category: 'Furniture',
    unit: 'Units',
    unitPrice: 189.00,
    reorderLevel: 20,
    description: 'Adjustable lumbar support breathable mesh chair with 3D armrests.',
    supplier: 'Apex Furniture Co.',
    stockByWarehouse: {
      'WH-001': { quantity: 28, location: 'Rack B-01' },
      'WH-002': { quantity: 12, location: 'Shelf 04' },
      'WH-003': { quantity: 0, location: 'Bay 102' }
    }
  },
  {
    id: 'PRD-003',
    name: 'Enterprise Laptop Pro 15"',
    sku: 'ELE-LPT-PRO15',
    category: 'Electronics',
    unit: 'Units',
    unitPrice: 1250.00,
    reorderLevel: 10,
    description: 'Core i7 32GB RAM 1TB SSD work laptop.',
    supplier: 'Nova Tech Hardware',
    stockByWarehouse: {
      'WH-001': { quantity: 3, location: 'Rack B-02' },
      'WH-002': { quantity: 1, location: 'Staging Zone' },
      'WH-003': { quantity: 0, location: 'Secure Cage' }
    }
  },
  {
    id: 'PRD-004',
    name: 'Corrugated Packaging Boxes (Large)',
    sku: 'PKG-BOX-LRG',
    category: 'Packaging',
    unit: 'Bundles',
    unitPrice: 14.20,
    reorderLevel: 80,
    description: 'Heavy duty double wall 50x50x40cm shipping boxes (pack of 25).',
    supplier: 'PacPro Solutions',
    stockByWarehouse: {
      'WH-001': { quantity: 180, location: 'Bulk Storage Floor' },
      'WH-002': { quantity: 60, location: 'Rack N-102' },
      'WH-003': { quantity: 40, location: 'Bay 101' }
    }
  },
  {
    id: 'PRD-005',
    name: 'Industrial M8 Hex Screws (Box of 500)',
    sku: 'HRD-SCR-M8',
    category: 'Hardware',
    unit: 'Boxes',
    unitPrice: 22.00,
    reorderLevel: 100,
    description: 'Zinc-plated grade 8.8 hex head cap screws with matching washers.',
    supplier: 'BoltFast Industrial',
    stockByWarehouse: {
      'WH-001': { quantity: 45, location: 'Rack A-02' },
      'WH-002': { quantity: 20, location: 'Shelf 04' },
      'WH-003': { quantity: 15, location: 'Bay 102' }
    }
  },
  {
    id: 'PRD-006',
    name: 'Oak Veneer Wooden Panels (4ft x 8ft)',
    sku: 'RAW-WOD-OAK04',
    category: 'Raw Materials',
    unit: 'Sheets',
    unitPrice: 42.00,
    reorderLevel: 30,
    description: 'Premium quality calibrated 18mm architectural hardwood panels.',
    supplier: 'TimberCraft Supply',
    stockByWarehouse: {
      'WH-001': { quantity: 0, location: 'Bulk Storage Floor' },
      'WH-002': { quantity: 0, location: 'Staging Zone' },
      'WH-003': { quantity: 0, location: 'Bay 101' }
    }
  },
  {
    id: 'PRD-007',
    name: 'Handheld 2D Barcode Scanner',
    sku: 'ELE-SCN-2D09',
    category: 'Electronics',
    unit: 'Units',
    unitPrice: 115.00,
    reorderLevel: 15,
    description: 'Rugged wireless QR & barcode scanner with USB base station.',
    supplier: 'Nova Tech Hardware',
    stockByWarehouse: {
      'WH-001': { quantity: 24, location: 'Rack B-02' },
      'WH-002': { quantity: 8, location: 'Shelf 04' },
      'WH-003': { quantity: 12, location: 'Secure Cage' }
    }
  },
  {
    id: 'PRD-008',
    name: 'Direct Thermal Shipping Labels (Roll of 1000)',
    sku: 'PKG-LBL-4X6',
    category: 'Packaging',
    unit: 'Rolls',
    unitPrice: 11.50,
    reorderLevel: 40,
    description: '4x6 inch standard fanfold shipping barcode labels.',
    supplier: 'PacPro Solutions',
    stockByWarehouse: {
      'WH-001': { quantity: 75, location: 'Rack A-02' },
      'WH-002': { quantity: 30, location: 'Shelf 04' },
      'WH-003': { quantity: 10, location: 'Bay 101' }
    }
  }
];

export const INITIAL_RECEIPTS = [
  {
    id: 'REC-2024-001',
    supplier: 'Acme Steel & Forgings',
    productId: 'PRD-001',
    productName: 'Steel Rods (12mm x 6m)',
    sku: 'RAW-STL-12MM',
    quantity: 50,
    unit: 'Pieces',
    warehouseId: 'WH-001',
    warehouseName: 'Main Central Warehouse',
    location: 'Rack A-01',
    status: 'READY',
    scheduledDate: '2024-10-28',
    completedDate: null,
    notes: 'PO-99420: Restock for Q4 industrial fabrication pipeline.'
  },
  {
    id: 'REC-2024-002',
    supplier: 'Nova Tech Hardware',
    productId: 'PRD-003',
    productName: 'Enterprise Laptop Pro 15"',
    sku: 'ELE-LPT-PRO15',
    quantity: 20,
    unit: 'Units',
    warehouseId: 'WH-001',
    warehouseName: 'Main Central Warehouse',
    location: 'Rack B-02',
    status: 'READY',
    scheduledDate: '2024-09-15', // Late receipt for demonstration
    completedDate: null,
    notes: 'Urgent: Backordered laptops for engineering onboarding.'
  },
  {
    id: 'REC-2024-003',
    supplier: 'PacPro Solutions',
    productId: 'PRD-004',
    productName: 'Corrugated Packaging Boxes (Large)',
    sku: 'PKG-BOX-LRG',
    quantity: 100,
    unit: 'Bundles',
    warehouseId: 'WH-001',
    warehouseName: 'Main Central Warehouse',
    location: 'Bulk Storage Floor',
    status: 'DONE',
    scheduledDate: '2024-10-20',
    completedDate: '2024-10-20T14:30:00Z',
    notes: 'Received and inspected in bulk staging.'
  },
  {
    id: 'REC-2024-004',
    supplier: 'Apex Furniture Co.',
    productId: 'PRD-002',
    productName: 'Ergonomic Mesh Office Chair',
    sku: 'FUR-CHR-ERG01',
    quantity: 15,
    unit: 'Units',
    warehouseId: 'WH-002',
    warehouseName: 'North Regional Hub',
    location: 'Shelf 04',
    status: 'DONE',
    scheduledDate: '2024-10-18',
    completedDate: '2024-10-18T10:15:00Z',
    notes: 'Standard replenishment batch.'
  }
];

export const INITIAL_DELIVERIES = [
  {
    id: 'DEL-2024-001',
    customer: 'BuildCorp Infrastructure LLC',
    productId: 'PRD-001',
    productName: 'Steel Rods (12mm x 6m)',
    sku: 'RAW-STL-12MM',
    quantity: 25,
    unit: 'Pieces',
    warehouseId: 'WH-001',
    warehouseName: 'Main Central Warehouse',
    status: 'WAITING',
    scheduledDate: '2024-10-30',
    completedDate: null,
    notes: 'SO-1082: Freight shipment to construction site #4.'
  },
  {
    id: 'DEL-2024-002',
    customer: 'Vertex Software HQ',
    productId: 'PRD-002',
    productName: 'Ergonomic Mesh Office Chair',
    sku: 'FUR-CHR-ERG01',
    quantity: 10,
    unit: 'Units',
    warehouseId: 'WH-001',
    warehouseName: 'Main Central Warehouse',
    status: 'WAITING',
    scheduledDate: '2024-09-10', // Late delivery demo
    completedDate: null,
    notes: 'Commercial fit-out contract.'
  },
  {
    id: 'DEL-2024-003',
    customer: 'Global Logistics Hub',
    productId: 'PRD-007',
    productName: 'Handheld 2D Barcode Scanner',
    sku: 'ELE-SCN-2D09',
    quantity: 6,
    unit: 'Units',
    warehouseId: 'WH-003',
    warehouseName: 'East Coast Distribution',
    status: 'DONE',
    scheduledDate: '2024-10-22',
    completedDate: '2024-10-22T16:45:00Z',
    notes: 'Express courier dispatch.'
  },
  {
    id: 'DEL-2024-004',
    customer: 'Swift Express Fulfillment',
    productId: 'PRD-008',
    productName: 'Direct Thermal Shipping Labels (Roll of 1000)',
    sku: 'PKG-LBL-4X6',
    quantity: 15,
    unit: 'Rolls',
    warehouseId: 'WH-001',
    warehouseName: 'Main Central Warehouse',
    status: 'DONE',
    scheduledDate: '2024-10-19',
    completedDate: '2024-10-19T11:20:00Z',
    notes: 'Customer pickup at dock 3.'
  }
];

export const INITIAL_TRANSFERS = [
  {
    id: 'TRF-2024-001',
    productId: 'PRD-001',
    productName: 'Steel Rods (12mm x 6m)',
    sku: 'RAW-STL-12MM',
    quantity: 15,
    unit: 'Pieces',
    sourceWarehouseId: 'WH-001',
    sourceWarehouseName: 'Main Central Warehouse',
    destWarehouseId: 'WH-002',
    destWarehouseName: 'North Regional Hub',
    status: 'IN_TRANSIT',
    date: '2024-10-24T08:30:00Z',
    notes: 'Rebalancing inventory for Midwest customer demand.'
  },
  {
    id: 'TRF-2024-002',
    productId: 'PRD-004',
    productName: 'Corrugated Packaging Boxes (Large)',
    sku: 'PKG-BOX-LRG',
    quantity: 30,
    unit: 'Bundles',
    sourceWarehouseId: 'WH-001',
    sourceWarehouseName: 'Main Central Warehouse',
    destWarehouseId: 'WH-003',
    destWarehouseName: 'East Coast Distribution',
    status: 'DONE',
    date: '2024-10-15T13:00:00Z',
    notes: 'Replenishing East Coast packaging supply.'
  }
];

export const INITIAL_ADJUSTMENTS = [
  {
    id: 'ADJ-2024-001',
    productId: 'PRD-005',
    productName: 'Industrial M8 Hex Screws (Box of 500)',
    sku: 'HRD-SCR-M8',
    warehouseId: 'WH-001',
    warehouseName: 'Main Central Warehouse',
    systemQuantity: 50,
    countedQuantity: 45,
    difference: -5,
    unit: 'Boxes',
    reason: 'Damaged during forklift maneuver',
    date: '2024-10-21T09:15:00Z',
    user: 'Dave Miller (Warehouse Staff)'
  },
  {
    id: 'ADJ-2024-002',
    productId: 'PRD-008',
    productName: 'Direct Thermal Shipping Labels (Roll of 1000)',
    sku: 'PKG-LBL-4X6',
    warehouseId: 'WH-002',
    warehouseName: 'North Regional Hub',
    systemQuantity: 28,
    countedQuantity: 30,
    difference: 2,
    unit: 'Rolls',
    reason: 'Cycle Count Discrepancy (Found extra roll)',
    date: '2024-10-17T15:20:00Z',
    user: 'Alex Morgan (Inventory Mgr)'
  }
];

export const INITIAL_MOVE_HISTORY = [
  {
    id: 'MOV-2024-001',
    date: '2024-10-24T08:30:00Z',
    type: 'TRANSFER',
    productId: 'PRD-001',
    productName: 'Steel Rods (12mm x 6m)',
    sku: 'RAW-STL-12MM',
    quantity: 15,
    unit: 'Pieces',
    source: 'Main Central Warehouse',
    destination: 'North Regional Hub',
    user: 'Alex Morgan (Inventory Mgr)',
    referenceId: 'TRF-2024-001',
    notes: 'Rebalancing inventory for Midwest customer demand.'
  },
  {
    id: 'MOV-2024-002',
    date: '2024-10-22T16:45:00Z',
    type: 'DELIVERY',
    productId: 'PRD-007',
    productName: 'Handheld 2D Barcode Scanner',
    sku: 'ELE-SCN-2D09',
    quantity: 6,
    unit: 'Units',
    source: 'East Coast Distribution',
    destination: 'Customer: Global Logistics Hub',
    user: 'Sarah Jenkins (Fulfillment Staff)',
    referenceId: 'DEL-2024-003',
    notes: 'Express courier dispatch.'
  },
  {
    id: 'MOV-2024-003',
    date: '2024-10-21T09:15:00Z',
    type: 'ADJUSTMENT',
    productId: 'PRD-005',
    productName: 'Industrial M8 Hex Screws (Box of 500)',
    sku: 'HRD-SCR-M8',
    quantity: -5,
    unit: 'Boxes',
    source: 'Main Central Warehouse (Physical Count: 45)',
    destination: 'Inventory Write-off',
    user: 'Dave Miller (Warehouse Staff)',
    referenceId: 'ADJ-2024-001',
    notes: 'Damaged during forklift maneuver'
  },
  {
    id: 'MOV-2024-004',
    date: '2024-10-20T14:30:00Z',
    type: 'RECEIPT',
    productId: 'PRD-004',
    productName: 'Corrugated Packaging Boxes (Large)',
    sku: 'PKG-BOX-LRG',
    quantity: 100,
    unit: 'Bundles',
    source: 'Supplier: PacPro Solutions',
    destination: 'Main Central Warehouse (Bulk Storage)',
    user: 'Dave Miller (Warehouse Staff)',
    referenceId: 'REC-2024-003',
    notes: 'Received and inspected in bulk staging.'
  },
  {
    id: 'MOV-2024-005',
    date: '2024-10-19T11:20:00Z',
    type: 'DELIVERY',
    productId: 'PRD-008',
    productName: 'Direct Thermal Shipping Labels (Roll of 1000)',
    sku: 'PKG-LBL-4X6',
    quantity: 15,
    unit: 'Rolls',
    source: 'Main Central Warehouse',
    destination: 'Customer: Swift Express Fulfillment',
    user: 'Sarah Jenkins (Fulfillment Staff)',
    referenceId: 'DEL-2024-004',
    notes: 'Customer pickup at dock 3.'
  },
  {
    id: 'MOV-2024-006',
    date: '2024-10-18T10:15:00Z',
    type: 'RECEIPT',
    productId: 'PRD-002',
    productName: 'Ergonomic Mesh Office Chair',
    sku: 'FUR-CHR-ERG01',
    quantity: 15,
    unit: 'Units',
    source: 'Supplier: Apex Furniture Co.',
    destination: 'North Regional Hub (Shelf 04)',
    user: 'Alex Morgan (Inventory Mgr)',
    referenceId: 'REC-2024-004',
    notes: 'Standard replenishment batch.'
  },
  {
    id: 'MOV-2024-007',
    date: '2024-10-17T15:20:00Z',
    type: 'ADJUSTMENT',
    productId: 'PRD-008',
    productName: 'Direct Thermal Shipping Labels (Roll of 1000)',
    sku: 'PKG-LBL-4X6',
    quantity: 2,
    unit: 'Rolls',
    source: 'Physical Count Surplus',
    destination: 'North Regional Hub',
    user: 'Alex Morgan (Inventory Mgr)',
    referenceId: 'ADJ-2024-002',
    notes: 'Cycle Count Discrepancy (Found extra roll)'
  },
  {
    id: 'MOV-2024-008',
    date: '2024-10-15T13:00:00Z',
    type: 'TRANSFER',
    productId: 'PRD-004',
    productName: 'Corrugated Packaging Boxes (Large)',
    sku: 'PKG-BOX-LRG',
    quantity: 30,
    unit: 'Bundles',
    source: 'Main Central Warehouse',
    destination: 'East Coast Distribution',
    user: 'Dave Miller (Warehouse Staff)',
    referenceId: 'TRF-2024-002',
    notes: 'Replenishing East Coast packaging supply.'
  }
];

export const CATEGORIES = [
  'Raw Materials',
  'Furniture',
  'Electronics',
  'Packaging',
  'Hardware',
  'Office Supplies',
  'Tools & Equipment'
];

export const UNITS = [
  'Units',
  'Pieces',
  'Boxes',
  'Bundles',
  'Rolls',
  'Sheets',
  'kg',
  'Meters',
  'Sets'
];
