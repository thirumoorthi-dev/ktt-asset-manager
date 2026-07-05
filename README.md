# KTT Asset Management System

> A full-stack web application to track company assets issued to employees.
> Built for **KT Telematic Solutions Pvt. Ltd.**

---

## Overview

The **KTT Asset Management System** helps companies track all tangible assets (laptops, mobile phones, modems, tools, etc.) issued to employees. It provides a complete lifecycle — from purchase registration, issuing, returning, to scrapping — with full audit history for every asset.

---

## Features

| Module | Description |
|---|---|
| **Dashboard** | Summary cards (employees, in-stock qty, issued qty, total valuation) + Quick Operations panel |
| **Employee Master** | Add / Edit / View all employees. Filter by Active/Inactive. Search via DataTables. |
| **Asset Master** | Add / Edit / View all assets. Filter by Category and Status. Track in-stock qty, issued units, and history. |
| **Asset Category Master** | Manage hardware types (Laptop, Mobile, Screw Driver, etc.). Accessible inline from the Add Asset form. |
| **Branch Master** | Manage company branches. Accessible inline from the Add Employee and Add Asset forms. |
| **Department Master** | Manage departments. Accessible inline from the Add Employee form. |
| **Return Reason Master** | DB-driven return reasons (Hardware Upgrade, Repair, Resignation, etc.). Managed separately and dynamically loaded in Return Asset form. |
| **Stock View** | Bird's-eye view of in-stock inventory. Summary by branch showing available qty, issued qty, and total valuation. |
| **Issue Asset** | Issue an in-stock asset unit to an active employee. Decrements available quantity. |
| **Return Asset** | Return an issued asset from an employee. Select a return branch and reason. Increments available quantity. |
| **Scrap Asset** | Mark an asset as obsolete. Scrapped assets are hidden from all active views. |
| **Asset History** | Full timeline audit trail of every Purchase, Issue, Return, and Scrap event per asset. |
| **Login / Logout** | Session-based authentication. Only authenticated users can access the application. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Web Framework** | Express.js |
| **Database** | PostgreSQL |
| **ORM** | Sequelize v6 |
| **Template Engine** | Pug (Jade v2) |
| **CSS Framework** | Bootstrap 5.3 |
| **Custom Styles** | Vanilla CSS (`public/css/style.css`) |
| **Tables** | DataTables.net (with Bootstrap 5 integration) |
| **Validation** | Yup (backend schema validation) |
| **Auth** | express-session + bcrypt |
| **Dev Server** | nodemon |

---

## Database Schema

All tables are created in the `ktt` PostgreSQL schema (not the default `public` schema).

Every table includes the following audit columns by default:

| Column | Type | Description |
|---|---|---|
| `CreatedBy` | UUID | System user ID of creator |
| `CreatedDate` | TIMESTAMP | Auto-set on creation |
| `UpdatedBy` | UUID | System user ID of last editor |
| `UpdatedDate` | TIMESTAMP | Auto-set on update |
| `IsActive` | BOOLEAN | Soft-delete flag |

### Tables

| Table | Key Columns | Notes |
|---|---|---|
| **ktt.Employees** | `EmployeeId` (PK), `EmployeeCode` (unique), `EmployeeName`, `Email`, `Phone`, `Branch`, `Department`, `IsActive` | Branch and Department are stored as plain strings (resolved from master tables) |
| **ktt.AssetCategories** | `CategoryId` (PK), `CategoryName` (unique), `Description`, `IsActive` | Drives the Category dropdown on Asset form |
| **ktt.Assets** | `AssetId` (PK), `UniqueId` (custom tag e.g. `AST-L001`), `SerialNumber` (unique), `Make`, `Model`, `Value`, `Quantity`, `Status` (`InStock`/`Issued`/`Scrapped`), `Branch`, `PurchaseDate`, `CategoryId` (FK), `CurrentEmployeeId` (FK nullable) | `Quantity` tracks available in-stock units |
| **ktt.AssetHistories** | `AssetHistoryId` (PK), `AssetId` (FK), `EmployeeId` (FK nullable), `ActionType` (`Purchase`/`Issue`/`Return`/`Scrap`), `ActionDate`, `Notes` | Immutable audit log — one row per event |
| **ktt.Branches** | `BranchId` (PK), `BranchName` (unique), `IsActive` | |
| **ktt.Departments** | `DepartmentId` (PK), `DepartmentName` (unique), `IsActive` | |
| **ktt.ReturnReasons** | `ReasonId` (PK), `ReasonName` (unique), `IsActive` | Loaded dynamically in Return Asset form |
| **ktt.Users** | `UserId` (PK), `Username` (unique), `PasswordHash`, `Role` (`admin`/`user`), `IsActive` | Login credentials |

---

## Project Structure

```
Ktt/
├── app.js                          # Express app entry point
├── db-init.js                      # Creates DB and ktt schema if not exists
├── seed.js                         # Seeds default data (branches, departments, categories, return reasons, admin user)
├── package.json
├── .env                            # Environment variables (not committed)
├── .gitignore
│
├── config/
│   └── database.js                 # Sequelize connection (ktt schema)
│
├── models/
│   ├── index.js                    # Registers all models and associations
│   ├── Asset.js
│   ├── AssetCategory.js
│   ├── AssetHistory.js
│   ├── Branch.js
│   ├── Department.js
│   ├── Employee.js
│   ├── ReturnReason.js
│   └── User.js
│
├── controllers/
│   ├── assetController.js
│   ├── authController.js
│   ├── branchController.js
│   ├── categoryController.js
│   ├── departmentController.js
│   ├── employeeController.js
│   └── returnReasonController.js
│
├── routes/
│   ├── index.js                    # Dashboard + mounts all sub-routers
│   ├── assets.js
│   ├── auth.js
│   ├── branches.js
│   ├── categories.js
│   ├── departments.js
│   ├── employees.js
│   └── returnReasons.js
│
├── middleware/
│   ├── auth.js                     # ensureAuthenticated, ensureAdmin
│   └── validation.js               # validateSchema (Yup middleware)
│
├── schemas/
│   └── index.js                    # Yup validation schemas for all forms
│
├── views/
│   ├── layout.pug                  # Main layout (navbar, footer)
│   ├── dashboard.pug
│   ├── auth/
│   │   └── login.pug
│   ├── assets/
│   │   ├── form.pug
│   │   ├── history.pug
│   │   ├── index.pug
│   │   ├── issue.pug
│   │   ├── return.pug
│   │   └── stock.pug
│   ├── branches/
│   │   └── index.pug
│   ├── categories/
│   │   └── index.pug
│   ├── departments/
│   │   └── index.pug
│   ├── employees/
│   │   ├── form.pug
│   │   └── index.pug
│   └── return-reasons/
│       └── index.pug
│
└── public/
    ├── css/
    │   └── style.css
    └── js/
        └── main.js                 # DataTable initializations + scrap modal AJAX
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm

### 1. Clone the Repository

```bash
git clone <repo-url>
cd Ktt
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=ktt_assets
DB_USER=postgres
DB_PASSWORD=your_postgres_password
SYSTEM_USER_ID=00000000-0000-0000-0000-000000000000
SESSION_SECRET=your_secret_key_here
```

> **Note:** `DB_NAME` will be created automatically by `db-init.js` if it does not exist.

### 4. Initialize Database and Seed Data

```bash
node seed.js
```

This will:
- Create the `ktt_assets` database if it does not exist
- Create the `ktt` schema
- Sync all Sequelize models (create tables)
- Seed default:
  - Branches: Chennai, Bangalore, Mumbai, Delhi, Hyderabad
  - Departments: Engineering, Sales, HR, Finance, Operations, IT Support
  - Asset Categories: Laptop, Mobile Phone, Tablet, Drill Machine, Screw Driver
  - Return Reasons: Hardware Upgrade, Technical Defect / Repair, Employee Resignation, Project Completed, Other
  - Admin user: username `admin`, password `Admin@1234`

### 5. Start the Application

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

Open **http://localhost:3000** in a browser.

### 6. Default Login

| Field | Value |
|---|---|
| Username | `admin` |
| Password | `Admin@1234` |

> To reset or create a new admin user, edit and run `seed.js`.

---

## Key Business Logic

### Quantity Tracking
- When an asset is **purchased**, a `Quantity` value is set (e.g., 9 laptops in one purchase).
- When **issued** to an employee, quantity decrements by 1. If quantity reaches 0, status changes to `Issued`.
- When **returned**, quantity increments by 1 and status reverts to `InStock`.
- The **Asset Master** shows `In Stock` quantity and `Assigned Out` count (computed from AssetHistory net of issues minus returns).

### Asset Status
| Status | Meaning |
|---|---|
| `InStock` | Units available for issue |
| `Issued` | All units currently assigned to employees (qty = 0) |
| `Scrapped` | Asset marked obsolete. Hidden from all active views. |

### Audit Trail
Every Issue, Return, and Scrap action creates a record in `AssetHistory`. The Asset History page provides a full timeline per asset.

### Inline Quick-Add
- On the **Add Employee** form: Branch and Department can be added inline via modal without leaving the page.
- On the **Add Asset** form: Asset Category and Branch can be added inline via modal.

---

## Future Enhancements

- **User management UI** — Admin screen to add/edit users and assign roles.
- **Export / Import** — CSV export of inventory and history reports.
- **Role-based access** — Restrict certain actions (e.g., scrap, edit) to admin role only.
- **Email notifications** — Notify employees on asset issue/return.

---

*Built for KT Telematic Solutions Pvt. Ltd. — Asset Management Assessment Project.*
