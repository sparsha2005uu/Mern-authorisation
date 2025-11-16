// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// =============================
// 🔐 SIGNUP ROUTE
// =============================
router.post('/signup', async (req, res) => {
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

        // 1. Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Create and Save the user
        user = new User({ email, password: hashedPassword });
        await user.save();

        // 3. Create JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('✅ User registered:', email);
        res.status(201).json({ msg: 'User registered successfully!', token });

    } catch (err) {
        // Improved logging to catch the "unknown error"
        console.error('❌ Registration Error:', err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// =============================
// 🔑 LOGIN ROUTE
// ===================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🟡 Login attempt:', email);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Compare password (note: user.password must be selectable in the model)
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log('✅ Login successful:', email);
        res.json({ msg: 'Login successful!', token });

    } catch (err) {
        // Improved logging to catch errors
        console.error('❌ Login Error:', err);
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

// =============================
// 🔍 JWT VERIFY MIDDLEWARE
// =============================
function verifyToken(req, res, next) {
    // Look for the token in the 'x-auth-token' header
    const token = req.header('x-auth-token'); 
    
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Add user info to request
        next();
    } catch (err) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
}

// =============================
// 🛡️ PROTECTED ROUTE (HOME)
// =============================
// Note: This requires the password field in the User model NOT to have select: false
router.get('/home', verifyToken, async (req, res) => {
    try {
        // Find user by ID from the JWT token and exclude the password
        const user = await User.findById(req.user.id).select('-password'); 
        res.json({ msg: `Welcome ${user.email}`, user });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error: ' + err.message });
    }
});

module.exports = router;