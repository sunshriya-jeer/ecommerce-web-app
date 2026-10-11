 HEAD
# E-Commerce Web Application (ApexStore)

An internship-ready, full-stack e-commerce web application engineered with a decoupled architecture: **React 19 (Vite)** on the frontend, **Node.js & Express** RESTful API on the backend, and **Supabase PostgreSQL** with Row Level Security (RLS) for data persistence and authentication.

---

## Overview

ApexStore is built as a portfolio-grade engineering project demonstrating modern full-stack web development practices. It implements real-world user and administrative journeys including catalog filtering, stock limits, localStorage cart persistence, simulated payment checkout, transactional order processing, step-by-step order tracking, and a protected administrative operations center.

---

## Features

### Customer & Storefront Experience
- **Responsive Storefront**: Clean, modern UI with hero highlights, category spotlights, and value propositions.
- **Product Catalog**: Live search filtering by title/keyword, category pills, and dynamic price/recency sorting.
- **Product Details**: High-resolution image view, category crumbs, real-time stock availability, and quantity selectors clamped to remaining stock.
- **Persistent Shopping Cart**: Maintained in `localStorage` across page reloads. Supports quantity modification, auto-calculated subtotal, free shipping thresholds, and instant item removal.
- **Checkout & Stock Verification**: Multi-field address validation, choice of payment methods (*Cash on Delivery* or *Demo Digital Payment*), and automatic stock decrement upon order confirmation.
- **Milestone Order Tracking**: Visual progress bar tracking order lifecycle (*Placed → Processing → Shipped → Delivered* or *Cancelled*).
- **Customer Account**: Profile dashboard displaying authentication details, security roles, and order history.

### Security & Authentication
- **Supabase Authentication**: Email and password registration and login with session token persistence.
- **Role-Based Access Control (RBAC)**: Enforced both on the database (PostgreSQL Row Level Security) and backend middleware (`authenticateUser`, `requireAdmin`).
- **Privilege Separation**: Customers are strictly defaulted to the `user` role upon registration; admin privilege escalation via client request is prohibited.
- **Client Route Guards**: `ProtectedRoute` and `AdminRoute` preventing unauthorized route access with automatic redirects.

### Administrative Management Panel
- **Executive Dashboard**: KPI metrics for total sales volume, order counts, product inventory count, and registered accounts.
- **Inventory Management**: View, add, edit, and delete catalog items with form validation and stock monitoring.
- **Order Processing Workflow**: Review customer orders, inspect delivery information, and transition order statuses via dropdown controls.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, React Router 7, Axios, Lucide React, Modern CSS3 |
| **Backend** | Node.js, Express.js (ES Modules), CORS, Dotenv, Supabase JS Client |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS) |
| **Tooling** | Git, npm, Vite Build |

---

## Project Structure

```text
ecommerce-web-app/
│
├── frontend/                     # React + Vite client
│   ├── src/
│   │   ├── components/           # Navbar, Footer, ProductCard, RouteGuards
│   │   ├── context/              # AuthContext, CartContext
│   │   ├── pages/                # Home, Shop, ProductDetails, Cart, Checkout,
│   │   │                         # Login, Register, Profile, MyOrders, OrderDetails, NotFound
│   │   │   └── admin/            # AdminDashboard, AdminProducts, AdminAddProduct, AdminEditProduct, AdminOrders
│   │   ├── services/             # Centralized api.js (Axios) & supabase.js
│   │   ├── App.jsx               # Routes and providers
│   │   ├── index.css             # Unified modern styles and media queries
│   │   └── main.jsx
│   ├── .env.example              # Frontend environment template
│   └── package.json
│
├── backend/                      # Node.js + Express API server
│   ├── src/
│   │   ├── config/               # Supabase Admin client setup
│   │   ├── controllers/          # authController, productController, orderController, userController
│   │   ├── middleware/           # auth.js (JWT & Admin check), errorHandler.js
│   │   ├── routes/               # Express route declarations
│   │   ├── services/             # seed.js (Catalog population script)
│   │   └── server.js             # Express app entry point & CORS configuration
│   ├── .env.example              # Backend environment template
│   └── package.json
│
├── database/
│   └── schema.sql                # Complete PostgreSQL schema, RLS policies, and triggers
│
├── .gitignore                    # Secrets, build artifacts, and node_modules ignored
└── README.md
```

---

## Installation

Ensure you have [Node.js (v18+)](https://nodejs.org/) installed.

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

---

## Environment Variables

### Backend Configuration (`backend/.env`)
Copy `backend/.env.example` to `backend/.env`:
```env
PORT=5000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
FRONTEND_URL=http://localhost:5173
```
> **Security Note:** `SUPABASE_SERVICE_ROLE_KEY` is kept exclusively on the server and is never sent to the browser.

### Frontend Configuration (`frontend/.env`)
Copy `frontend/.env.example` to `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key-here
VITE_API_URL=http://localhost:5000/api
```

---

## Supabase & Database Setup

1. Create a free account at [Supabase](https://supabase.com) and create a new project.
2. Under **Project Settings → API**, copy your **Project URL**, **anon public key**, and **service_role secret key**.
3. Open the **SQL Editor** in your Supabase dashboard.
4. Copy the entire contents of [`database/schema.sql`](file:///c:/ecommerce-web-app/database/schema.sql) and click **Run**.
   - This creates `profiles`, `products`, `orders`, and `order_items`.
   - It sets up foreign keys, cascades, indexes, and automated profile triggers.
   - It enables and configures **Row Level Security (RLS)**.

---

## Seeding Products

To populate the store with initial catalog items (Electronics, Accessories, Clothing, Home, Books):

```bash
cd backend
npm run seed
```

This runs `src/services/seed.js` using your Supabase credentials.

---

## Admin Setup: Promoting a User

To ensure privilege security, users cannot choose the `admin` role during sign-up. To create an admin:

1. Register an account through the application UI at `http://localhost:5173/register` (e.g. `admin@apexstore.com`).
2. Go to your **Supabase Dashboard → Table Editor → profiles**.
3. Locate your user record and change the `role` column value from `'user'` to `'admin'`.
4. Alternatively, execute this query in the **SQL Editor**:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@apexstore.com';
   ```
5. Log out and log back in on the frontend. The `Admin` button will appear in the navigation bar, granting access to `/admin`.

---

## Running the Application

### Start the Backend Server
```bash
cd backend
npm run dev
```
The API server starts at: `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`).

### Start the Frontend Client
```bash
cd frontend
npm run dev
```
The Vite client starts at: `http://localhost:5173`.

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Create user account and profile record
- `POST /api/auth/login` - Authenticate credentials and return JWT session
- `GET /api/auth/me` - Retrieve current verified user profile *(Bearer Token required)*

### Products (`/api/products`)
- `GET /api/products` - List products with query filters (`?category=...&search=...&sort=...`)
- `GET /api/products/:id` - Fetch product details by ID
- `POST /api/products` - Add new product *(Admin required)*
- `PUT /api/products/:id` - Update existing product *(Admin required)*
- `DELETE /api/products/:id` - Delete product *(Admin required)*

### Orders (`/api/orders`)
- `POST /api/orders` - Place order, verify stock, insert items, decrement inventory *(Authenticated)*
- `GET /api/orders/my-orders` - Fetch all orders for current user *(Authenticated)*
- `GET /api/orders/:id` - View order details & tracking *(Order owner or Admin)*
- `GET /api/orders` - List all orders with filters *(Admin required)*
- `PUT /api/orders/:id/status` - Update order stage *(Admin required)*

### Users (`/api/users`)
- `GET /api/users` - Directory of registered users *(Admin required)*
- `GET /api/users/:id` - User profile lookup *(Self or Admin)*

---

## Testing & Verification

1. **Build Verification**:
   - Run `npm run build` in `frontend/` to confirm asset bundling and bundling integrity.
2. **End-to-End User Flow**:
   - Register a new customer → Browse shop → Filter categories → Add item to cart.
   - Adjust quantities in cart → Proceed to checkout → Enter delivery info → Submit order.
   - Confirm cart clears → Review order tracking timeline.
3. **End-to-End Admin Flow**:
   - Sign in as promoted admin → Access `/admin`.
   - Inspect KPIs → Add new product → Verify it appears in shop.
   - Go to `/admin/orders` → Update order status from `Placed` to `Shipped` → Check reflected status on order tracking.

---

## Future Enhancements
- Integration of a real production payment gateway (e.g. Stripe webhook fulfillment).
- Customer product reviews and star ratings.
- User wishlist and bookmarking.
- Automated email order notifications (e.g. Resend / SendGrid).

---

## Screenshots Placeholder
> *Screenshots of Storefront, Cart, Checkout, Order Tracking, and Admin Dashboard can be placed in this section
# ecommerce-web-app
Full-stack E-Commerce Web Application with product management, Supabase authentication, role-based Admin/User access, shopping cart, checkout, and order tracking using React, Node.js, Express, and PostgreSQL   origin/main
