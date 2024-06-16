const sequelize = require('../../db');
const { DataTypes } = require('sequelize');

module.exports = sequelize.define('Item', 
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        itemName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: '',
        },
        itemImage: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'NO_IMAGE.png',
        }
    }
);