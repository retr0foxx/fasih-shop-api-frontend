const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.SEQUELIZE_DATABASE,
    process.env.SEQUELIZE_USERNAME,
    process.env.SEQUELIZE_PASSWORD,
    {
        host: process.env.SEQUELIZE_HOST,
        dialect: process.env.SEQUELIZE_DIALECT,
        logging: false,
    }
);

module.exports = sequelize;
