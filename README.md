# FINTRACK – Smart Personal Finance & Credit Card Management System

## What is this Project?
This project is a web-based personal finance assistant that helps users manage money efficiently. It helps users:
- Track their income and expenses
- Manage their credit/debit cards
- Monitor credit card dues
- Get a clear view of their financial status

## Problem It Solves
Many people:
- Don’t track daily expenses
- Forget credit card due dates
- Use multiple payment methods without clarity
- End up overspending or paying late fees

This project solves these problems by providing one simple, unified system.

## How the System Works (Flow)
1. **User registers / logs in**
2. **User enters data:**
   - Income
   - Expenses
   - Card details
3. **User adds dues:**
   - Credit card dues (amount + due date)
4. **System stores everything** securely in a database.
5. **Dashboard shows:**
   - Total income
   - Total expenses
   - Cards
   - Upcoming dues

## Main Features
1. **User Authentication:** Secure login & registration. Passwords are protected.
2. **Transaction Management:** Add income or expense, categorize (Food, Rent, Fuel, etc.), and edit or delete transactions.
3. **Card Manager:** Add cards safely (only last 4 digits) and view all cards in one place.
4. **Credit Card Dues:** Add due amount and due date, track upcoming dues, and mark them as paid/unpaid.
5. **Dashboard:** Shows financial summary and helps the user understand their spending.

## How It Is Built (Technical)
- **Frontend:** HTML, CSS, JavaScript (React, Vite)
- **Backend:** Python (Flask)
- **Database:** SQLite (PostgreSQL for cloud)
- **Concept Used:** Object-Oriented Programming

---

## Project Structure

```text
smartwalletmanagermain/
├── backend/                # Python Flask REST API
│   ├── routes/             # API Endpoints (Auth, Cards, Transactions, etc.)
│   ├── models.py           # SQLAlchemy Database Models
│   ├── app.py              # Flask Application Entry Point
│   └── .env                # Backend Environment Variables
└── frontend/               # React TypeScript Web App (Vite)
    ├── src/                # Frontend Source Code
    └── public/             # Static Assets
```

## Setup Instructions

### 1. Backend Setup

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```
2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Set up environment variables**:
   Create a `.env` file in the `backend/` folder based on `.env.example`.
5. **Run the server**:
   ```bash
   python app.py
   ```
   The backend will run on `http://localhost:5000`.

### 2. Frontend Setup

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the development server**:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:8080`.

## Mobile Usage

To use FinTrack as a mobile website during development:
1. Ensure your laptop and mobile device are on the same Wi-Fi network.
2. Run the frontend using: `npm run dev -- --host`
3. Access the application on your mobile browser using your laptop's IP address (e.g., `http://192.168.1.10:8080`).
4. Update the `VITE_API_URL` in your frontend configuration to use your laptop's IP address if accessing remotely.

## Features

- **Dashboard**: Monthly financial summary (Income, Expenses, Net Balance).
- **Transactions**: Log and filter your daily income and expenses.
- **Cards**: Manage your credit and debit cards in one place.
- **Dues**: Track credit card payment dates and mark them as paid.
- **Responsive Design**: Optimized UI for both desktop and mobile viewing.
