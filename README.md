<div align="center">

# 💳 SBI Expense Manager

### **Bright Bento Financial Ledger — Powered by Google Sheets**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Google Sheets](https://img.shields.io/badge/Google_Sheets-API-34A853?style=for-the-badge&logo=google-sheets)](https://developers.google.com/apps-script)

> A zero-cost, self-hosted personal finance dashboard that uses **Google Sheets as a database** via **Google Apps Script**. Track expenses, credits, account balances, and payment modes — all synced live to your spreadsheet.

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Bento-grid overview with net balance, income, expenses & savings rate |
| 💸 **Expense Tracking** | Log debit entries with categories, payment modes & notes |
| 💰 **Credit Tracking** | Record income, salary, freelance & other credit entries |
| ⚖️ **Balance & Liquidity** | Per-account balances, pool-share indicators & reconciliation table |
| 💳 **Payment Modes** | Create, edit & delete Bank / UPI / Credit Card / Cash / Investment modes |
| 🔄 **Fund Transfer** | Move money between payment modes with full transaction history |
| 📈 **Charts** | Monthly trend charts and category breakdown pie charts (Recharts) |
| ☁️ **Google Sheets Sync** | All data persists to a Google Sheet via Apps Script Web App API |
| 🔌 **Offline-first** | Full localStorage fallback when offline or not connected |

---

## 📸 Pages

```
/            →  Dashboard     (Net balance, stats, recent transactions, payment modes)
/expense     →  Expenses      (Full expense log with filters & delete)
/credit      →  Credits       (Income log with categories)
/balance     →  Balance       (Payment modes management + reconciliation)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **UI Library** | React 19 |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4 |
| **Icons** | Lucide React |
| **Charts** | Recharts 2 |
| **Database** | Google Sheets (via Google Apps Script REST API) |
| **Fonts** | Plus Jakarta Sans · Space Grotesk · JetBrains Mono |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Google Account (for Google Sheets backend)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/sbi-expense.git
cd sbi-expense
npm install
```

### 2. Set Up Google Sheets Backend

> **One-time setup** — takes ~5 minutes

1. Create a new Google Sheet: [sheets.new](https://sheets.new)
2. Go to **Extensions → Apps Script**
3. Delete all default code and paste the contents of [`apps-script/Code.gs`](./apps-script/Code.gs)
4. Press `Ctrl+S` to save
5. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** ← *critical*
6. Click **Deploy** and copy the Web App URL

> ⚠️ Every time you update `Code.gs`, you must create a **New Version** in Manage Deployments for changes to go live.

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
NEXT_PUBLIC_SHEET_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Or leave blank and enter the URL in-app via the **⚙️ Settings** button.

### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
sbi-expense/
├── apps-script/
│   └── Code.gs              # Google Apps Script backend (paste into Google Sheets)
├── src/
│   ├── app/
│   │   ├── page.tsx         # Dashboard page
│   │   ├── expense/         # Expense log page
│   │   ├── credit/          # Credit log page
│   │   └── balance/         # Balance & payment modes page
│   ├── components/
│   │   ├── Navbar.tsx       # Navigation + toast notifications
│   │   ├── TransactionModal.tsx   # Add expense/credit/transfer modal
│   │   ├── AccountModal.tsx       # Create/edit payment mode modal
│   │   ├── SettingsModal.tsx      # Google Sheets URL config
│   │   ├── PaymentModeCard.tsx    # Bento card per payment mode
│   │   ├── TransactionTable.tsx   # Sortable transaction table
│   │   └── StatCard.tsx           # Bento stat summary card
│   ├── context/
│   │   └── ExpenseContext.tsx     # Global state + all CRUD operations
│   ├── services/
│   │   └── api.ts                 # Google Sheets API client
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   └── utils/
│       └── constants.ts           # Categories, formatters, defaults
└── .env.example                   # Environment variable template
```

---

## 🔌 API Reference (Apps Script)

All requests go to your deployed Web App URL.

### GET Actions

| `?action=` | Description |
|-----------|-------------|
| `getTransactions` | Fetch all transactions + accounts |
| `ping` | Health check |

### POST Actions (JSON body)

| `action` | Payload | Description |
|---------|---------|-------------|
| `addTransaction` | `{date, type, category, account, amount, note}` | Add expense or credit |
| `deleteTransaction` | `{id}` | Delete a transaction |
| `updateTransaction` | `{id, ...fields}` | Update transaction fields |
| `transfer` | `{fromAccount, toAccount, amount, date, note}` | Transfer between accounts |
| `saveAccounts` | `{accounts[], oldName?, newName?}` | Sync full accounts list |

---

## 📋 Google Sheet Schema

### `Transactions` Sheet

| Column | A | B | C | D | E | F | G | H |
|--------|---|---|---|---|---|---|---|---|
| Header | ID | Date | Type | Category | Account | Amount | Note | CreatedAt |

### `Accounts` Sheet

| Column | A | B | C | D | E |
|--------|---|---|---|---|---|
| Header | AccountName | InitialBalance | Type | AccountNumber | Color |

---

## 🏗️ Architecture

```
Browser (Next.js)
│
├── ExpenseContext (Global State)
│   ├── localStorage  ← offline fallback
│   └── Google Sheets ← via Apps Script API
│
└── Google Sheets (Database)
    ├── Transactions sheet
    └── Accounts sheet
         ↑
    Apps Script Web App (REST API layer)
```

**Key design decisions:**
- **Balance is computed client-side** from `initialBalance + credits - debits`, not stored in the sheet. This avoids write conflicts.
- **localStorage is always written first** for instant UI response, then synced to the sheet asynchronously.
- **Apps Script uses `text/plain;charset=utf-8`** as Content-Type to avoid CORS preflight on POST requests.

---

## 🔄 Redeploying Apps Script

Whenever you update `Code.gs`:

```
Apps Script Editor
  → Deploy
    → Manage deployments
      → ✏️ Edit
        → Version: "New version"
          → Deploy
```

> Without selecting "New version", the old code stays live regardless of your edits.

---

## 🧑‍💻 Development Commands

```bash
npm run dev      # Start dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint check
npx tsc --noEmit # TypeScript type check
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify and distribute.

---

<div align="center">

Made with ❤️ using **Next.js** + **Google Sheets**

**[⬆ Back to top](#-sbi-expense-manager)**

</div>
