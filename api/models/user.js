const { DataTypes } = require('sequelize');
const sequelize = require('../../db');

module.exports = sequelize.define('User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        updatedAt: false,
    }
);
