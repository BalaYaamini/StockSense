# StockSense — Modular Inventory Management System (IMS)

StockSense is a modern, high-performance, modular Inventory Management System built for businesses with complex multi-warehouse logistics, incoming receipts, outgoing delivery dispatching, internal transfers, physical cycle count auditing, barcode/QR scanning, automated replenishment batches, and role-based staff operations.

---

## 👥 Three Target Profiles & RBAC Governance

1. **👑 Executive Administrator (Sarah Vance)**
   - **Credentials**: `admin@stocksense.io` / `adminpassword123`
   - **Capabilities**: Full system oversight, User & Manager directory governance, **Bulk Manager CSV Import**, facility configuration, and database control.
2. **👔 Inventory Manager (Alex Morgan)**
   - **Credentials**: `alex.morgan@stocksense.io` / `password123` *(or provisioned by Admin)*
   - **Capabilities**: Executive inventory dashboard, full catalog control, pricing/valuations, operations validation, smart replenishment batch generation, and audit ledger export.
3. **👷 Warehouse Staff (Dave Miller & Google Users)**
   - **Credentials**: `dave.miller@stocksense.io` / `password123` or **"Continue with Google"**
   - **Capabilities**: Touch-optimized **Warehouse Floor Workstation** (Picking Queue, Inbound Receiving Dock, Rapid Shelf Counter, Camera Barcode Scanner).

---

## 🔐 Google Authentication Business Rule
- When any user logs in using **"Continue with Google"**, the system automatically registers and onboards them as **Warehouse Staff** by default.
- **Inventory Manager** accounts cannot be self-registered via Google—they must be authorized or bulk-imported directly by the **Administrator**.

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
