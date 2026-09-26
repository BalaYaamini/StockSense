# StockSense — Modular Inventory Management System (IMS)

StockSense is a modern, high-performance, modular Inventory Management System built for businesses with complex multi-warehouse logistics, incoming receipts, outgoing delivery dispatching, internal transfers, physical cycle count auditing, barcode/QR scanning, automated replenishment batches, and role-based staff operations.

---

## 🚀 Key Features

### 1. 📊 Executive Dashboard
- **Dynamic Inventory KPI Cards**: Real-time calculation of Total Catalog Products, On-Hand Stock, Low Stock items, Out of Stock items, and total valuation.
- **Operations Overview**: High-level status for pending and late Receipts & Deliveries.
- **Live Stock Activity Feed**: Real-time audit stream of all recent warehouse movements.
- **Low Stock Attention Hub**: Instant 1-click reorder action & smart batch restock generator.

### 2. 📦 Products & Catalog Management
- Multi-warehouse inventory breakdown with primary shelf and rack locations.
- Live status indicators (`In Stock`, `Low Stock`, `Out of Stock`).
- Full-text search and filtering by Category, Warehouse facility, and Stock Status.
- **Printable Barcode & Bin Tags**: 1-Click industrial Code128 and QR label generator for any product or warehouse rack.

### 3. 📷 Realtime Barcode & QR Scanner (Phase 2)
- **Camera Viewfinder**: Live optical scanning using `html5-qrcode`.
- **1-Click Barcode Test Simulator**: Rapid demo chip simulator allowing instant testing of all product SKUs and warehouse codes without requiring a physical camera or printed sheets!
- **Context Actions**: Once scanned, presents instant 1-touch actions (`Receive +Stock`, `Dispatch -Stock`, `Adjust Count`, `Transfer`).

### 4. 👔👷 Role-Based Experience (Phase 2)
- **1-Click Role Switcher** (Manager ↔ Staff):
  - **👔 Inventory Manager Mode (Alex Morgan)**: Executive analytics, catalog management, pricing/valuations, cloud PostgreSQL config, and batch PO generator.
  - **👷 Warehouse Staff Mode (Dave Miller)**: Mobile & tablet touch-friendly floor workstation:
    - **Picking & Dispatch Queue**: Step-by-step checklist with rack location guidance (`Rack A-01`, `Bay 102`) and 1-tap `Mark Picked`.
    - **Inbound Receiving Dock**: Fast verify & shelve workflow.
    - **Rapid Aisle Shelf Counter**: Touch `+` / `-` quantity counting pad for walk-around aisle audits.

### 5. ✨ Smart Replenishment & Batch Purchase Order Generator (Phase 2)
- Automatically isolates all `LOW_STOCK` and `OUT_OF_STOCK` items.
- Computes suggested purchase quantities:
  $$\text{Suggested PO Quantity} = \max(5, (\text{Reorder Level} \times 2) - \text{Current Stock})$$
- 1-Click "Generate Batch PO" creates pending receipts for the entire catalog in one click.

### 6. ⚡ Core Operations Workflow
- **Inbound Receipts**: Validating incoming shipments automatically increases inventory and writes to the Move History ledger.
- **Outbound Deliveries**: Validates available stock before allowing dispatch and prevents over-dispatching.
- **Internal Transfers**: Relocates stock while guaranteeing total company inventory remains constant.
- **Physical Adjustments**: Reconciles system stock with counted physical inventory.

### 7. 📜 Move History & Ledger
- Chronological, immutable inventory ledger recording all movements.
- Advanced filtering and instant **CSV Ledger Export** for auditing.

### 8. 🗄️ Supabase PostgreSQL Integration (Phase 2)
- Complete PostgreSQL schema ready in [`supabase_schema.sql`](file:///c:/Users/R.%20CHITRA%20DEVI/OneDrive/Desktop/StockSense/supabase_schema.sql).
- In-app Dual-Mode database connector: seamlessly switch between local offline sandbox and live Supabase Cloud PostgreSQL with connection testing.

---

## 🏃‍♂️ How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```

3. Open your browser at **`http://localhost:3000`**

4. **To Build for Production:**
   ```bash
   npm run build
   ```
