const UserRouter = require('./api/routes/user');
const ItemRouter = require('./api/routes/item');

module.exports = app =>
    app.use('/users', UserRouter)
       .use('/items', ItemRouter)
