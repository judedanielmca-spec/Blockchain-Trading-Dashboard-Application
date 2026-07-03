# NexusTrade 📈
### Mock Cryptocurrency Portfolio & Trading Dashboard

NexusTrade is a premium, state-of-the-art cryptocurrency trading simulator and dashboard application. Users can register accounts (pre-seeded with $100,000 USD virtual cash), view simulated cryptocurrency price fluctuations, manage a personalized watchlist, execute buy and sell trades, track portfolio allocations, and view transaction history in real-time.

---

## 🚀 Key Features

*   **User Registration & Secure Auth**: Seamless JWT-based authentication with bcrypt password hashing.
*   **Dynamic Market Feed**: Periodic simulation (updated every minute via cron job) of market price changes, highs/lows, and price trends.
*   **Virtual Portfolio & Performance Tracker**: Detailed breakdowns of asset allocation percentages, current valuations, average buy prices, and net ROI using recharts graphs.
*   **Watchlist Management**: Add and remove favorite tokens directly from the market table.
*   **Simulated Trading System**: Buy and sell limits checked against virtual balances and portfolio holdings.
*   **Transaction Logs**: Interactive transaction history with filtering options (All, Buys, Sells).

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)
*   **Styling**: Premium Glassmorphism UI built with vanilla CSS variables and CSS modules
*   **Charts**: [Recharts](https://recharts.org/) for rendering the portfolio allocation pie chart and historical performance charts
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Routing**: [React Router v7](https://reactrouter.com/)

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
*   **Database**: [MongoDB Memory Server](https://github.com/nodenetwork/mongodb-memory-server) (runs completely in-memory, requiring **zero** local database installation/configuration)
*   **ODM**: [Mongoose](https://mongoosejs.com/)
*   **Authentication**: JSON Web Tokens (JWT) & `bcryptjs`
*   **Job Scheduler**: [Node-cron](https://github.com/node-cron/node-cron) for periodic market price updates

---

## 📂 Project Structure

```text
├── backend/                  # Node.js + Express API server
│   ├── controllers/          # Business logic handlers
│   ├── jobs/                 # Cron jobs for mock price simulation
│   ├── middleware/           # JWT authentication middleware
│   ├── models/               # Mongoose schemas (User, Coin, Portfolio, etc.)
│   ├── routes/               # API endpoint definitions
│   └── server.js             # Main server entrypoint
├── frontend/                 # Vite + React Single Page App
│   ├── src/
│   │   ├── components/       # Global layouts (Sidebar, TopNav, AppLayout)
│   │   ├── contexts/         # React Contexts (AuthContext, MarketContext)
│   │   ├── pages/            # Application pages (Dashboard, Trade, Watchlist, etc.)
│   │   ├── services/         # Axios API connection configuration
│   │   └── styles/           # Theme variables and root resets
│   ├── index.html            # SPA main HTML page
│   └── vite.config.js        # Vite configurations
├── package.json              # Monorepo/Root configuration with concurrently script
└── README.md                 # Project documentation
```

---

## ⚙️ Quick Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16+ recommended) installed.

### Step 1: Install Dependencies
From the project root directory, run the following command to install root dependencies (which handles concurrent startup) as well as the individual frontend and backend dependencies:

```bash
# Install root dependencies
npm install

# Install backend dependencies
npm run install --prefix backend

# Install frontend dependencies
npm run install --prefix frontend
```

### Step 2: Set Environment Variables
Create a `.env` file in the `backend/` directory and configure your JWT secret (a default is pre-configured):

```ini
PORT=5000
JWT_SECRET=super_secret_jwt_key_crypto_dashboard_2026
```

### Step 3: Run the Application
Start both the backend server and frontend application concurrently using a single command from the project root:

```bash
npm run dev
```

*   **Frontend Access**: Open `http://localhost:5173` in your browser.
*   **Backend Server**: Runs on `http://localhost:5000`.

---

## 💡 Notes & Simulation Details
*   Since the database uses an **In-Memory MongoDB Server**, data resets whenever the backend server restarts. This is ideal for testing and demonstration purposes.
*   When the server boots up, it automatically seeds the database with initial tokens (Bitcoin, Ethereum, Solana, Cardano, XRP, Polkadot, Chainlink, and Dogecoin).
*   A backend job updates market prices every minute, introducing slight random fluctuations to simulate active trading.
