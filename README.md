# E-Commerce Web Application (ApexStore)

A production-ready, full-stack e-commerce web application engineered with a decoupled architecture: **React 19 (Vite)** on the frontend, a **Node.js & Express** RESTful API on the backend, and **Supabase (PostgreSQL)** for database persistence and authentication.

---

## 🔗 Live Links & Repository

- **Live Application:** [https://ecommerce-web-app-liard-beta.vercel.app](https://ecommerce-web-app-liard-beta.vercel.app)
- **Backend API Health Check:** [https://ecommerce-web-app-api.onrender.com/api/health](https://ecommerce-web-app-api.onrender.com/api/health)
- **Source Code Repository:** [https://github.com/sunshriya-jeer/ecommerce-web-app](https://github.com/sunshriya-jeer/ecommerce-web-app)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Local Setup & Installation (Windows Command Prompt)](#local-setup--installation-windows-command-prompt)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Setup & Seeding](#database-setup--seeding)
- [Role-Based Access Control & Admin Setup](#role-based-access-control--admin-setup)
- [API Reference](#api-reference)
- [Security Architecture](#security-architecture)
- [Screenshots](#screenshots)

---

## Overview

ApexStore is a full-featured e-commerce platform built to demonstrate modern full-stack web engineering practices. It delivers an end-to-end user experience—from catalog discovery, search filtering, and responsive shopping cart management to secure multi-field checkout, server-side price validation, stock handling, and visual order tracking. The application also provides an administrative operations dashboard for product catalog management and order lifecycle tracking.

---

## Key Features

### 🛍️ Storefront & Customer Experience
- **Interactive Product Catalog**: Instant search by title/description, category filtering, and sorting by price or recency.
- **Product Details View**: High-resolution imagery, stock badge indicators, and quantity selectors clamped strictly to available inventory.
- **Persistent Shopping Cart**: Saved in browser `localStorage` across refreshes, with dynamic item quantity controls, subtotal computation, and auto-applied free shipping thresholds.
- **Secure Multi-Field Checkout**: Validates shipping details (full name, phone, email, street address, city, state, postal code), supports multiple payment methods (*Cash on Delivery* and *Demo Digital Payment*), and creates orders with order items.
- **Server-Side Price & Stock Verification**: Product prices and available inventory are computed and verified on the server from the database before order placement—client-supplied prices are never trusted.
- **Order Tracking Timeline**: Dedicated customer order history (`/my-orders`) and visual order tracking page (`/orders/:id`) showing status transitions (*Placed → Processing → Shipped → Delivered* or *Cancelled*).
- **User Profile Dashboard**: View personal account details, email address, role, and direct links to active orders.

### 🔐 Authentication & Authorization
- **Supabase Authentication**: Email and password registration, login, and JWT session persistence.
- **Protected Client Routes**: Route guards (`ProtectedRoute` and `AdminRoute`) to prevent unauthorized navigation and redirect guests to login.
- **Role-Based Access Control (RBAC)**: Backend verification ensures standard customers cannot trigger administrative operations. Users are assigned `user` role on registration by default.

### 🛠️ Administrative Operations
- **Admin Dashboard**: Overview metrics displaying total sales volume, order counts, product inventory count, and registered accounts.
- **Product Inventory Management**: List, create, edit, and delete products with form validation and stock tracking.
- **Order Status Processing**: Review customer orders, inspect recipient delivery information, and transition order statuses via dropdown controls.

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend** | React 19, Vite, React Router DOM v7 | Modern single-page application with component-driven UI and client-side routing |
| **Icons & Styling** | Lucide React, Modern CSS3 | Lightweight icon set and custom, responsive mobile-first styling |
| **HTTP Client** | Axios | Configured API client with authorization header interceptors and base URL routing |
| **Backend API** | Node.js (ES Modules), Express 4.21 | RESTful API server handling business logic, validation, and database operations |
| **Middleware & Tools** | CORS, Dotenv | Cross-origin resource sharing configuration and environment variable loading |
| **Database & Auth** | Supabase (PostgreSQL), Supabase Auth | Relational PostgreSQL database, Row Level Security (RLS), and identity management |
| **Deployment** | Vercel (Frontend), Render (Backend) | Continuous cloud deployment with custom environments and HTTPS |

---

## System Architecture

```text
┌────────────────────────────────────────────────────────┐
│                   Vercel Frontend                      │
│            React 19 SPA + Vite + React Router          │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       1. Auth (Anon Key)       2. API Requests (Bearer JWT)
                │                        │
                ▼                        ▼
┌────────────────────────┐      ┌────────────────────────┐
│     Supabase Auth      │      │     Render Backend     │
│ User Login / Sessions  │      │   Node.js + Express    │
└────────────────────────┘      └───────────┬────────────┘
                                            │
                                  3. Server-side Queries
                                  (Service-Role Secret Key)
                                            │
                                            ▼
                                ┌────────────────────────┐
                                │  Supabase PostgreSQL   │
                                │   Database with RLS    │
                                └────────────────────────┘
```

1. **Authentication Flow**: The frontend communicates with Supabase Auth using the publishable anonymous key for user registration and sign-in. The issued JWT token is saved in browser storage.
2. **Client-to-Backend Requests**: Authenticated API calls (such as checkout, order history, profile retrieval, and admin actions) send the JWT in the `Authorization: Bearer <token>` header to the Express backend.
3. **Backend-to-Database Operations**: Express middleware verifies the token and retrieves the authenticated user's ID and role. Database operations are performed using the Supabase client initialized with the server-side service-role secret key, keeping private administrative privileges strictly on the server.

---

## Project Structure

```text
ecommerce-web-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Supabase client initialization (supabase.js)
│   │   ├── controllers/     # authController, productController, orderController, userController
│   │   ├── middleware/      # auth.js (token verification & admin check), errorHandler.js
│   │   ├── routes/          # authRoutes, productRoutes, orderRoutes, userRoutes
│   │   ├── services/        # seed.js (sample product catalog population)
│   │   └── server.js        # Express app entry point, CORS configuration, health check
│   ├── .env.example         # Template for backend environment variables
│   └── package.json         # Backend dependencies and scripts
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProductCard, ProtectedRoute, AdminRoute
│   │   ├── context/         # AuthContext (Supabase sessions), CartContext (localStorage cart)
│   │   ├── pages/           # Home, Shop, ProductDetails, Cart, Checkout,
│   │   │                    # Login, Register, Profile, MyOrders, OrderDetails, NotFound
│   │   │   └── admin/       # AdminDashboard, AdminProducts, AdminAddProduct, AdminEditProduct, AdminOrders
│   │   ├── services/        # api.js (Axios instance), supabase.js (Client initialization)
│   │   ├── App.jsx          # Route definitions and context providers
│   │   ├── index.css        # Responsive stylesheets and layout variables
│   │   └── main.jsx         # React application entry point
│   ├── .env.example         # Template for frontend environment variables
│   └── package.json         # Frontend dependencies and build scripts
├── database/
│   └── schema.sql           # PostgreSQL schema (profiles, products, orders, order_items), RLS policies, triggers
├── .gitignore               # Ignored dependencies, build outputs, and local environment files
└── README.md                # Project documentation
```

---

## Local Setup & Installation (Windows Command Prompt)

Follow these steps to run the application locally on Windows using `cmd.exe`:

### Prerequisites
- [Node.js (v18 or higher)](https://nodejs.org/) installed.
- [Git](https://git-scm.com/) installed.
- A free [Supabase](https://supabase.com) account and project.

### 1. Clone the Repository
```cmd
git clone https://github.com/sunshriya-jeer/ecommerce-web-app.git
cd ecommerce-web-app
```

### 2. Configure and Install Backend Dependencies
Open Windows Command Prompt:
```cmd
cd backend
copy .env.example .env
npm install
```
Edit `backend\.env` with your preferred text editor (e.g., `notepad .env`) to supply your Supabase project URL and service-role secret key.

### 3. Configure and Install Frontend Dependencies
From the repository root (or navigate up one directory with `cd ..`):
```cmd
cd frontend
copy .env.example .env
npm install
```
Edit `frontend\.env` using your text editor (e.g., `notepad .env`) to supply your Supabase project URL and anonymous publishable key.

---

## Environment Variables

> **Security Notice**: Only environment variable names are listed below. Never put actual secret keys, passwords, or tokens in source control.

### Backend (`backend/.env`)

| Variable Name | Description | Example / Default |
|---|---|---|
| `PORT` | Port for the Express server to listen on | `5000` |
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project-id.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Private Supabase service-role secret key for backend database queries | `your-supabase-service-role-key-here` |
| `FRONTEND_URL` | Allowed origin for Cross-Origin Resource Sharing (CORS) | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable Name | Description | Example / Default |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://your-project-id.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY`| Supabase public anonymous key for client authentication | `your-supabase-anon-key-here` |
| `VITE_API_URL` | Base URL pointing to the Express backend API | `http://localhost:5000/api` |

---

## Running the Application

### 1. Start the Backend Server
In your first Windows Command Prompt window:
```cmd
cd backend
npm run dev
```
- The backend server will start at `http://localhost:5000`.
- Health check status: `http://localhost:5000/api/health`.

### 2. Start the Frontend Development Server
In a second Windows Command Prompt window:
```cmd
cd frontend
npm run dev
```
- The Vite frontend will start at `http://localhost:5173`.
- Open `http://localhost:5173` in your web browser.

---

## Database Setup & Seeding

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Navigate to the **SQL Editor** on the left navigation bar.
3. Open [`database/schema.sql`](database/schema.sql) from this repository, copy its entire content, paste it into the Supabase SQL editor, and click **Run**.
   - This sets up the `profiles`, `products`, `orders`, and `order_items` tables.
   - It creates automated user profile triggers and configures Row Level Security (RLS) policies.
4. To populate the store with initial catalog products:
   ```cmd
   cd backend
   npm run seed
   ```

---

## Role-Based Access Control & Admin Setup

By design, all new user accounts registered via the frontend default to the `user` role to prevent privilege escalation.

To grant an account administrative permissions:
1. Register a new user account through the web UI at `http://localhost:5173/register` (e.g., `admin@example.com`).
2. Go to your **Supabase Dashboard → Table Editor → profiles**.
3. Locate your user record and change the `role` column value from `'user'` to `'admin'`.
   *(Or run this query in the Supabase SQL Editor:)*
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@example.com';
   ```
4. Log out and log back in on the website. The **Admin** portal button will appear in the navigation bar, granting access to `/admin`.

---

## API Reference

### Health Check
- `GET /api/health` — Returns backend operational status and timestamp.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Create a new user account and associated profile record.
- `POST /api/auth/login` — Authenticate credentials and return a user session with JWT.
- `GET /api/auth/me` — Return the currently authenticated profile *(Bearer token required)*.

### Products (`/api/products`)
- `GET /api/products` — Retrieve all active products with optional filters (`?category=...&search=...&sort=...`).
- `GET /api/products/:id` — Retrieve product details by ID.
- `POST /api/products` — Create a new product *(Admin role required)*.
- `PUT /api/products/:id` — Update existing product details *(Admin role required)*.
- `DELETE /api/products/:id` — Remove a product from the catalog *(Admin role required)*.

### Orders (`/api/orders`)
- `POST /api/orders` — Place order with server-side price validation, stock reduction, and order items insertion *(Authenticated)*.
- `GET /api/orders/my-orders` — Retrieve order history for the logged-in user *(Authenticated)*.
- `GET /api/orders/:id` — Retrieve specific order details and tracking milestones *(Order owner or Admin)*.
- `GET /api/orders` — Retrieve all customer orders *(Admin role required)*.
- `PUT /api/orders/:id/status` — Transition order status (`Placed`, `Processing`, `Shipped`, `Delivered`, `Cancelled`) *(Admin role required)*.

### Users (`/api/users`)
- `GET /api/users` — List all registered users *(Admin role required)*.
- `GET /api/users/:id` — View specific user profile *(Account owner or Admin)*.

---

## Security Architecture

- **Private Secret Key Isolation**: The backend uses `SUPABASE_SERVICE_ROLE_KEY` to perform administrative database tasks. This key is never included in frontend builds or client-side bundles.
- **Client Public Key Scope**: The frontend uses `VITE_SUPABASE_PUBLISHABLE_KEY` solely for authentication and public queries. All privileged writes route through the Express backend.
- **Server-Side Trust Model**: Checkout calculations strictly verify product pricing and inventory availability against the database at the time of purchase. Client-supplied price values in the request payload are ignored.
- **Row Level Security (RLS)**: PostgreSQL tables are configured with RLS policies in `database/schema.sql` to restrict unauthorized direct table access.
- **Environment Isolation**: `.env` files are explicitly excluded via `.gitignore` to prevent credential exposure in version control.

---

## Screenshots

> *Add application screenshots and demo GIFs here to showcase key storefront and admin views.*

| Storefront & Catalog | Shopping Cart & Checkout |
| :---: | :---: |
| *(Add Storefront Screenshot)* | *(Add Checkout Screenshot)* |

| Order Tracking Timeline | Admin Operations Dashboard |
| :---: | :---: |
| *(Add Order Tracking Screenshot)* | *(Add Admin Dashboard Screenshot)* |

---

## License

This project is open-source and available under the [MIT License](LICENSE).
