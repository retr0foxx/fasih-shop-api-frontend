const fs = require('fs');
module.exports = file => fs.unlink(`./item_images/${file}`, err => console.error(err));