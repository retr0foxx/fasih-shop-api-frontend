module.exports = callback => async (req, res, next) => 
    callback(req, res, next).catch(err => {
        console.error(err);
        next(err);
    });