const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const routes = require('./setup-routes');

const app = express();

app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('item_images'));

app.use(cors());

// use all routes here
routes(app);

app.use((error, req, res, next) => res.status(error.status || 500).json({
        error: { 
            message: error.message
        }
    }
));

module.exports = app;