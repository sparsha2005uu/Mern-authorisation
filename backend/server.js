// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const User = require('./models/User');

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
// 🔐 SIGNUP ROUTE
// =============================
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🟢 Received signup data:', req.body);

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        let user = await User.findOne({ email });
        if (user) {
            console.log('⚠️ User already exists:', email);
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ email, password: hashedPassword });
        await user.save();

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('✅ User registered:', email);
        res.status(201).json({ msg: 'User registered successfully!', token });

    } catch (err) {
        console.error('❌ Registration Error:', err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// =============================
// 🔑 LOGIN ROUTE
// =============================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🟡 Login attempt:', email);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('✅ Login successful:', email);
        res.json({ msg: 'Login successful!', token });

    } catch (err) {
        console.error('❌ Login Error:', err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// =============================
// 🛡️ PROTECTED ROUTE (HOME)
// =============================
app.get('/api/auth/home', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ msg: `Welcome ${user.email}`, user });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// =============================
// 🔍 JWT VERIFY MIDDLEWARE
// =============================
function verifyToken(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
}

// =============================
// 🚀 START SERVER
// =============================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));