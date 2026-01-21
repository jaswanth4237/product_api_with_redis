const { Sequelize } = require('sequelize');
const config = require('./index');

const sequelize = new Sequelize(config.db.url, {
    dialect: 'postgres',
    logging: false,
});

module.exports = sequelize;
