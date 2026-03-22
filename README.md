# smartwalletmanagermain
# SmartPersonalFinanceAndCreditCardManagementSystem

Managing personal finances has become increasingly complex due to multiple income sources, frequent digital payments, and the use of multiple credit cards. Many individuals fail to track daily expenses properly and often miss credit card due dates, resulting in late fees and poor financial planning. Existing finance applications are either too complex or lack transparency and user control.

This project aims to build a simple, secure, and user-friendly personal finance management system that allows users to track income and expenses, manage credit cards, and monitor credit card dues in one unified platform.
# FinTrack - Personal Finance Manager

FinTrack is a full-stack personal finance application that helps you track your income, expenses, cards, and dues. It is designed to work seamlessly on both desktop and mobile devices.

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
