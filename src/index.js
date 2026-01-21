const app = require('./app');
const config = require('./config');
const sequelize = require('./config/db');
const Product = require('./models/Product');

async function start() {
    try {
        // Sync database
        await sequelize.authenticate();
        console.log('Database connection established.');

        await sequelize.sync({ force: false }); // Use { force: true } if you want to reset DB on every start

        // Seed data if empty
        const count = await Product.count();
        if (count === 0) {
            console.log('Seeding initial products...');
            await Product.bulkCreate([
                {
                    name: 'Wireless Mouse',
                    description: 'High-precision wireless optical mouse',
                    price: 25.99,
                    stock_quantity: 150
                },
                {
                    name: 'Mechanical Keyboard',
                    description: 'RGB backlit mechanical keyboard with blue switches',
                    price: 89.99,
                    stock_quantity: 45
                },
                {
                    name: 'Gaming Monitor',
                    description: '27-inch 144Hz 1ms gaming monitor',
                    price: 299.99,
                    stock_quantity: 20
                },
                {
                    name: 'USB-C Hub',
                    description: '7-in-1 USB-C hub with HDMI and Power Delivery',
                    price: 45.50,
                    stock_quantity: 80
                }
            ]);
            console.log('Seeding complete.');
        }

        app.listen(config.port, () => {
            console.log(`Server is running on port ${config.port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
