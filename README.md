# 🍽️ BabaSai Restaurant — Full-Stack MEAN Application

> Authentic Indian Cuisine | Surat, Gujarat, India | 📞 6355653553

A complete, production-ready restaurant management system built exclusively with the **MEAN Stack**:
- **M** — MongoDB (Mongoose)
- **E** — Express.js
- **A** — Angular 17 (Standalone Components + Signals)
- **N** — Node.js

---

## 📁 Project Structure

```
babasai/
├── backend/                    ← Node.js + Express API
│   ├── config/
│   │   └── db.js               ← MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── reviewController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js             ← JWT + role-based auth
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── MenuItem.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── menu.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── reviews.js
│   │   └── admin.js
│   ├── uploads/                ← uploaded menu images
│   ├── .env
│   ├── server.js
│   ├── seed.js                 ← seed script
│   └── package.json
│
└── frontend/                   ← Angular 17 SPA
    ├── src/
    │   ├── app/
    │   │   ├── core/
    │   │   │   ├── guards/     ← auth, admin, guest guards
    │   │   │   ├── interceptors/  ← JWT interceptor
    │   │   │   └── services/   ← all API services
    │   │   ├── layout/
    │   │   │   ├── main-layout/
    │   │   │   └── admin-layout/
    │   │   ├── models/         ← TypeScript interfaces
    │   │   ├── pages/
    │   │   │   ├── home/
    │   │   │   ├── menu/
    │   │   │   ├── cart/
    │   │   │   ├── orders/
    │   │   │   ├── reviews/
    │   │   │   ├── auth/
    │   │   │   │   ├── login/
    │   │   │   │   └── register/
    │   │   │   └── admin/
    │   │   │       ├── dashboard/
    │   │   │       ├── manage-menu/
    │   │   │       ├── manage-orders/
    │   │   │       ├── manage-users/
    │   │   │       └── manage-reviews/
    │   │   └── shared/
    │   │       ├── navbar/
    │   │       ├── footer/
    │   │       └── toast/
    │   ├── index.html
    │   ├── main.ts
    │   └── styles.css          ← Tailwind CSS
    ├── angular.json
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure the following are installed:

| Tool       | Version    | Check command       |
|------------|------------|---------------------|
| Node.js    | ≥ 18.x     | `node -v`           |
| npm        | ≥ 9.x      | `npm -v`            |
| MongoDB    | ≥ 6.x      | `mongod --version`  |
| Angular CLI| ≥ 17.x     | `ng version`        |

Install Angular CLI globally if needed:
```bash
npm install -g @angular/cli
```

---

## 🚀 Setup & Run Instructions

### Step 1 — Start MongoDB

```bash
# macOS / Linux
mongod

# Windows
net start MongoDB

# Or using Homebrew (macOS)
brew services start mongodb-community
```

### Step 2 — Setup Backend

```bash
cd babasai/backend

# Install dependencies
npm install

# The .env file is already configured with defaults:
# MONGO_URI=mongodb://localhost:27017/babasai_restaurant
# JWT_SECRET=babasai_super_secret_jwt_key_2024
# PORT=5000

# Seed the database with sample data + admin account
npm run seed

# Start the backend server
npm run dev
```

✅ Backend will run at: **http://localhost:5000**

### Step 3 — Setup Frontend

```bash
cd babasai/frontend

# Install dependencies
npm install

# Start the Angular dev server
ng serve
# OR
npm start
```

✅ Frontend will run at: **http://localhost:4200**

---

## 🔑 Demo Credentials

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@babasai.com        | admin123   |
| User  | rahul@example.com        | user123    |
| User  | priya@example.com        | user123    |

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint             | Access  | Description        |
|--------|---------------------|---------|-------------------|
| POST   | /api/auth/register  | Public  | Register user     |
| POST   | /api/auth/login     | Public  | Login user        |
| GET    | /api/auth/me        | Private | Get current user  |

### Menu
| Method | Endpoint            | Access  | Description             |
|--------|---------------------|---------|------------------------|
| GET    | /api/menu           | Public  | Get all items (filter)  |
| GET    | /api/menu/categories| Public  | Get categories          |
| GET    | /api/menu/:id       | Public  | Get single item         |
| POST   | /api/menu           | Admin   | Create menu item        |
| PUT    | /api/menu/:id       | Admin   | Update menu item        |
| DELETE | /api/menu/:id       | Admin   | Delete menu item        |

### Cart
| Method | Endpoint                    | Access  | Description       |
|--------|-----------------------------|---------|-------------------|
| GET    | /api/cart                   | Private | Get user cart     |
| POST   | /api/cart/add               | Private | Add item to cart  |
| PUT    | /api/cart/update            | Private | Update quantity   |
| DELETE | /api/cart/remove/:itemId    | Private | Remove item       |
| DELETE | /api/cart/clear             | Private | Clear cart        |

### Orders
| Method | Endpoint            | Access  | Description          |
|--------|---------------------|---------|---------------------|
| POST   | /api/orders/place   | Private | Place order from cart|
| GET    | /api/orders         | Private | Get user orders      |
| GET    | /api/orders/:id     | Private | Get single order     |

### Reviews
| Method | Endpoint            | Access  | Description       |
|--------|---------------------|---------|-------------------|
| GET    | /api/reviews        | Public  | Get all reviews   |
| POST   | /api/reviews        | Private | Submit review     |
| DELETE | /api/reviews/:id    | Admin   | Delete review     |

### Admin
| Method | Endpoint                        | Access | Description          |
|--------|---------------------------------|--------|---------------------|
| GET    | /api/admin/stats                | Admin  | Dashboard stats      |
| GET    | /api/admin/users                | Admin  | Get all users        |
| DELETE | /api/admin/users/:id            | Admin  | Delete user          |
| GET    | /api/admin/orders               | Admin  | Get all orders       |
| PUT    | /api/admin/orders/:id/status    | Admin  | Update order status  |
| GET    | /api/admin/reviews              | Admin  | Get all reviews      |

---

## ✨ Features Summary

### User Side
- ✅ Register & Login with validation + error messages
- ✅ Browse dynamic menu from MongoDB
- ✅ Filter by category, price range, search by name
- ✅ Add to Cart / Update quantity / Remove items
- ✅ Place order from cart
- ✅ View order history with real-time status timeline
- ✅ Submit reviews with 1–5 star rating
- ✅ Responsive, modern UI with Tailwind CSS

### Admin Side
- ✅ Admin login with role-based routing
- ✅ Dashboard: Total users, orders, revenue, pending orders
- ✅ Manage Menu: Add / Edit / Delete items with image URL
- ✅ Manage Orders: View all, filter by status, update status
- ✅ Manage Users: View all, delete users
- ✅ Manage Reviews: View all, delete reviews

---

## 🛠️ Tech Stack Summary

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Angular 17, Standalone Components   |
| Styling     | Tailwind CSS 3, Custom animations   |
| State       | Angular Signals                     |
| Forms       | Angular Reactive Forms              |
| HTTP        | Angular HttpClient + Interceptors   |
| Routing     | Angular Router + Guards             |
| Backend     | Node.js 18+, Express.js 4           |
| Auth        | JWT (jsonwebtoken) + bcryptjs       |
| Database    | MongoDB + Mongoose ODM              |
| File Upload | Multer                              |

---

## 📞 Restaurant Info

- **Name:** BabaSai Restaurant
- **Address:** Surat, Gujarat, India
- **Phone:** 6355653553
- **Email:** info@babasai.com
- **Hours:** 10:00 AM – 11:00 PM

---

## 🐛 Troubleshooting

**MongoDB not connecting?**
```bash
# Check if MongoDB is running
sudo systemctl status mongod
# Start it if not running
sudo systemctl start mongod
```

**Port already in use?**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
# Kill process on port 4200
lsof -ti:4200 | xargs kill -9
```

**Angular compilation errors?**
```bash
# Clear cache and reinstall
rm -rf node_modules .angular
npm install
ng serve
```

**CORS errors in browser?**
- Ensure the backend is running on port 5000
- Ensure the frontend is running on port 4200
- CORS is already configured in `server.js` for `http://localhost:4200`






...Hero section +
...Footer
...Adress
...Map (baba sai)
...Follow us (x)
...Meet our team
...Stats Banner
...Reply email(admin)
...Delivery to section 
...Total revenues (admin )
...Image URL (admin)
...Card image