const sequelize = require('../../db');
require('dotenv').config();

module.exports = async () => await sequelize.sync({ alter: process.env.MODE === 'dev' });
