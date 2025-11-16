// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth'); // Correctly import the router

const app = express();

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Test route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// =============================
// 🔐 ROUTE CONNECTION
// =============================
// All routes in authRoutes (signup, login) will be prepended with /api/auth
app.use('/api/auth', authRoutes);

// =============================
// 🚀 START SERVER
// =============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));