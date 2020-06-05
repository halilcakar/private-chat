require('dotenv').config();

const APP_ENV = process.env.APP_ENV;
const host = process.env.HOST;
const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 8080;

const SSL = {
    KEY: process.env.SSL_KEY,
    CERT: process.env.SSL_CERT,
}

module.exports = {
    APP_ENV,
    host,
    PORT,
    SOCKET_PORT,
    SSL
}