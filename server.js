require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const { sequelize, User, Category, Item, syncDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Serve Static Files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
const requireAuth = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

// API Routes

// 1. Auth
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            req.session.userId = user.id;
            return res.json({ message: 'Login successful' });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.clearCookie('connect.sid'); // Clear session cookie
        res.json({ message: 'Logout successful' });
    });
});

app.get('/api/check-auth', (req, res) => {
    if (req.session.userId) {
        res.json({ authenticated: true });
    } else {
        res.json({ authenticated: false });
    }
});

// 2. Menu Data (Public)
app.get('/api/menu', async (req, res) => {
    try {
        const categories = await Category.findAll({
            include: [{
                model: Item,
                attributes: ['id', 'name_en', 'name_ar', 'description', 'price', 'image_url', 'is_featured']
            }]
        });
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching menu' });
    }
});

// 3. Admin CRUD (Protected)

// Categories
app.post('/api/categories', requireAuth, async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/categories/:id', requireAuth, async (req, res) => {
    try {
        await Category.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Category updated' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/categories/:id', requireAuth, async (req, res) => {
    try {
        await Category.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Items
app.post('/api/items', requireAuth, async (req, res) => {
    try {
        const item = await Item.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/items/:id', requireAuth, async (req, res) => {
    try {
        await Item.update(req.body, { where: { id: req.params.id } });
        res.json({ message: 'Item updated' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/items/:id', requireAuth, async (req, res) => {
    try {
        await Item.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Serve Admin Dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Start Server
if (require.main === module) {
    syncDatabase().then(async () => {
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    });
}

module.exports = app;
