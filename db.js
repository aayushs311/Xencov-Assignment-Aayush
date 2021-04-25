const Client = require('pg').Pool;

const connectDB = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'aayush',
    port: 5432
});

module.exports = connectDB;