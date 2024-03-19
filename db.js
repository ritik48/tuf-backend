import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();
// configDotenv();

export const connectDB = async () => {
    const pool = mysql
        .createPool({
            host: process.env.MYSQL_HOST,
            password: process.env.MYSQL_PASSWORD,
            user: process.env.MYSQL_USER,
            database: process.env.MYSQL_DB,
        })
        .promise();

    await pool.query(`CREATE TABLE IF NOT EXISTS code (
        id integer PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) NOT NULL,
        language VARCHAR(255) NOT NULL,
        input TEXT NOT NULL,
        output TEXT NOT NULL,
        source_code TEXT NOT NULL,
        created TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    return pool;
};
