# Expense Tracker

A simple expense-tracking app with a React frontend and an Express API. Track spending in rupees (INR), set a monthly limit, and manage deleted entries through the trash.

## Features

- Add, edit, and delete expenses
- Filter by category and date range, or search by title
- View spending summaries and category totals
- Set a monthly spending limit
- Restore deleted expenses or permanently remove them
- Persist expenses and trash as JSON files on the server

## Requirements

- Node.js and npm

## Getting Started

Install dependencies and start the backend in one terminal:

```bash
cd server
npm install
npm start
```

In a second terminal, start the frontend:

```bash
cd client
npm install
npm run dev
```

Open the local URL printed by Vite (typically `http://localhost:5173`). The frontend proxies API requests to `http://localhost:5001`. Keep both processes running while using the app.

To create a production frontend build, run `npm run build` from the `client` directory.

## Data Storage

The backend stores active expenses in `server/expenses.json` and deleted entries in `server/trash.json`. It creates these files if they do not exist. The monthly spending limit is stored in the browser's local storage.

## API

The API listens on port `5001` by default. Set the `PORT` environment variable to use a different backend port.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Check API status |
| `GET` | `/api/expenses` | List expenses |
| `GET` | `/api/expenses/:id` | Get one expense |
| `POST` | `/api/expenses` | Create an expense |
| `PUT` | `/api/expenses/:id` | Update an expense |
| `DELETE` | `/api/expenses/:id` | Move an expense to trash |
| `GET` | `/api/trash` | List deleted expenses |
| `POST` | `/api/trash/:id/restore` | Restore an expense |
| `DELETE` | `/api/trash/:id` | Permanently delete one item |
| `DELETE` | `/api/trash` | Empty the trash |