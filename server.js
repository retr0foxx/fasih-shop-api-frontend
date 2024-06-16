const http = require('http');
const sequelize = require('./db');
require('dotenv').config();

const app = require('./app');
const port = process.env.PORT || 3000;

(async () => {
    await sequelize.authenticate();
    console.log('Connection to DB successfull');
    http.createServer(app).listen(port);
    console.log(`Server live: http://localhost:${port}`);
})()
.catch(error => console.error('An error occurred:', error));
