const development = require("./index.dev");
const production = require("./index.prod");

const env = process.env.APP_ENV || 'development';

const config = {
    development,
    production
};

module.exports = config[env];
