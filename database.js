const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Database (PostgreSQL)
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

// Define Models

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING, // Will store the hash
        allowNull: false
    }
});

const Category = sequelize.define('Category', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

const Item = sequelize.define('Item', {
    name_en: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name_ar: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.STRING, // Using string to accommodate symbols or currency codes initially, or strictly number if preferred. JS uses float.
        // Current site uses "$4.00" and "100,000 L.L". Storing as string is safer for mixed currencies unless we normalize.
        allowNull: false
    },
    image_url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    is_featured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

// Relationships
Category.hasMany(Item);
Item.belongsTo(Category);

// Sync Function
const syncDatabase = async () => {
    try {
        await sequelize.sync();
        console.log('Database synced successfully.');
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

module.exports = {
    sequelize,
    User,
    Category,
    Item,
    syncDatabase
};
