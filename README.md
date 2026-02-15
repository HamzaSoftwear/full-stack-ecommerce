🚀 Express E-commerce API

Fullstack a clean and scalable e-commerce platform built with Express 5, MongoDB, JWT-based authentication, React , Axios and React Router.
This API powers both user-facing features (product browsing, cart, checkout simulation) and admin features (product & category management, image uploads).



🧠 Project Idea

The website simulates a modern online store where:

👤 Users can:

Browse products

View product details

See “You may also like” (latest products)

Add products to cart

Proceed to a mock checkout flow (demo only)

🛠️ Admins can:

Log in securely

Create, update, and delete products

Manage product categories

Upload a main product image and multiple additional images

Control product visibility and data

🧰 Tech Stack
Backend

Node.js 20+

Express 5

MongoDB with Mongoose ODM

JWT Authentication (express-jwt, jsonwebtoken)

Password hashing with bcryptjs

File uploads using multer

Environment management via dotenv

CORS configured for frontend integration

Tooling

nodemon for development

Docker Compose for MongoDB & Mongo Express (optional)

📁 Project Layout
project-root/
│-- app.js               # Express bootstrap, middleware, routes
│-- auth/
│   └── jwt.js           # JWT authentication middleware
│-- models/              # Mongoose schemas (Product, Category, Order, User)
│-- routes/              # REST routes for each resource
│-- uploads/             # Uploaded product images
│-- docker-compose.yml   # MongoDB + Mongo Express (local dev)
└-- .env                 # Environment variables (not committed)

⚙️ Getting Started
1️⃣ Install dependencies
npm install

2️⃣ Configure environment variables

Create a .env file:

API_URL=/api/v1
PORT=5000
CONNECTION_DB=mongodb://localhost:27017/express-ecommerce
JWT_SECRET=replace-with-a-long-random-string


⚠️ Never commit real secrets to version control.

3️⃣ Start the development server
npm start

🐳 Optional: Dockerized MongoDB

You can spin up MongoDB and Mongo Express using Docker:

docker compose up -d


Example connection string:

mongodb://admin:admin@localhost:27017/?authSource=admin

🧪 Seed Default Data

To seed default categories (e.g. Shoes, Clothes, Technology):

npm run seed:categories

📜 Available Scripts
Script	Description
npm start	Run API with nodemon
npm test	Placeholder (no tests yet)
🌐 API Overview

All endpoints are prefixed with ${API_URL} (default: /api/v1).

Products
Method	Endpoint	Description
GET	/products	List products (supports filters)
GET	/products/:id	Get product details
GET	/products/latest	Fetch latest products
POST	/products	Create product (admin)
PUT	/products/:id	Update product
DELETE	/products/:id	Delete product
Categories
Method	Endpoint	Description
GET	/categories	List categories
POST	/categories	Create category
PUT	/categories/:id	Update category
DELETE	/categories/:id	Delete category
Orders
Method	Endpoint	Description
GET	/orders	List orders
POST	/orders	Create order
PUT	/orders/:id	Update order status
Users
Method	Endpoint	Description
POST	/users	Register user
POST	/users/login	Login and receive JWT
GET	/users	List users (admin)

See the routes/ directory for full request/response details.

🔐 Authentication

JWT-based authentication via middleware (auth/jwt.js)

All routes are protected except:

User registration

User login

Admin-only actions require a valid admin token

🧹 Recent Fixes & Notes
File	Issue	Resolution
routes/users.js	Mixed ES Module & CommonJS syntax	Standardized to CommonJS
app.js	Invalid wildcard OPTIONS route	Removed to fix server crash
Categories	Category ID mismatch	Frontend now sends ObjectId
🚀 Future Improvements

Product ratings & reviews

Advanced filtering
By price, rating, newest, highest rated.

Wishlist / favorites

Real payment integration (Stripe)

Order history for users

Admin dashboard analytics

Image optimization & compression

Unit & integration testing


## 🎨 Frontend Application

The frontend is a modern **React-based web application** that consumes this API and provides both **user** and **admin** interfaces.

### Frontend Features
- Product listing and filtering
- Product details page
- Shopping cart with local persistence
- Mock checkout flow with success animation
- Admin panel for managing products and categories
- Image previews and gallery support
- Protected admin routes using JWT

### Frontend Stack
- React
- React Router
- Fetch / Axios for API communication
- Context API or local state for cart management
- Modern CSS / UI components

The frontend communicates with the backend via REST APIs secured with JWT authentication.
