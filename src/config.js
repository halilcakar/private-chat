require('dotenv').config();

const host = process.env.HOST;
const PORT = process.env.PORT || 3000;
const SOCKET_PORT = process.env.SOCKET_PORT || 8080;


module.exports = {
    host,
    PORT,
    SOCKET_PORT
}