# 💰 Income-Expense Tracker App

A simple and elegant web-based application for tracking your income and expenses, with support for user preferences, charts, and custom filters — built using modern technologies.

---

## 📦 Tech Stack

- ⚡️ [Vite](https://vitejs.dev/) – lightning-fast frontend tooling
- 🧠 [TypeScript](https://www.typescriptlang.org/)
- ⚛️ [React](https://react.dev/)
- 🎨 [shadcn/ui](https://ui.shadcn.com/) – reusable and accessible UI components
- 🌀 [Tailwind CSS](https://tailwindcss.com/) – utility-first styling

---

## 🛠 Features

- 🚀 Login system with predefined users (dummy auth)
- 💼 Dashboard showing total income, expense, and balance
- 📊 Category-wise pie charts and line/bar charts for transactions
- 📅 Filter transactions by a custom date range (min: 1 week, max: 1 year)
- ✏️ Edit & delete existing transactions
- 🌐 User preferences: set language, currency, and more
- 🔐 Secure logout option
- ✨ Responsive design and smooth, modern UI
- 📤 Export filtered transactions to CSV
- 🌗 Light and dark mode support

---

## 🧑‍💻 How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/abhishekra07/income-expense-tracker.git
cd income-expense-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm run dev
```

Visit `http://localhost:8080` in your browser to use the app.

---

## 📁 Project Structure

```
src/
├─ assets/          # Icons and images
├─ components/      # Reusable components (Header, Modals, etc.)
├─ lib/             # Utility functions and types
├─ pages/           # App pages (Dashboard, Login, Profile, etc.)
├─ styles/          # Tailwind config and global styles
├─ App.tsx          # Main app component
├─ main.tsx         # Entry point
```

---

## 🧾 License

This project is for demo and educational purposes. You may reuse or adapt the code freely.
