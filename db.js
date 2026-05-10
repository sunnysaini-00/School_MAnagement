const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

});

const checkConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log("Database connection established successfully.");
    connection.release();
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
};

checkConnection();

module.exports = db;