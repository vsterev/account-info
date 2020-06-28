const mongoose = require('mongoose');
const config = require('./config');

module.exports = function () {
    mongoose.set('useFindAndModify', false);
    return mongoose.connect(config.dataBaseUrl,{ useNewUrlParser: true, useUnifiedTopology: true })
}