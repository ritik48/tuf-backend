import express from "express";
import cors from "cors";

import { connectDB } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

let pool;

app.get("/", async (req, res, next) => {
    try {
        const [row] = await pool.query("SELECT * FROM code");
        res.status(200).json({ data: row });
    } catch (error) {
        next(error);
    }
});

app.post("/new", async (req, res, next) => {
    const { username, language, input, source_code } = req.body;
    console.log(req.body);

    const query = `INSERT INTO code (username, language, input, source_code) VALUES (?, ?, ?, ?)`;
    const data = await pool.query(query, [
        username,
        language,
        input,
        source_code,
    ]);

    res.status(201).json({ message: "Data inserted successfully" });
});

app.get("/:id", async (req, res) => {
    const { id } = req.params;

    const [data] = await pool.query(`SELECT * FROM code WHERE id=?`, [id]);
    console.log(data[0]);
    res.status(200).send({ data: data[0].source_code });
});

app.use((err, req, res, next) => {
    res.status(500).json({
        status: "error",
        message: err.message,
    });
});

connectDB()
    .then((poolObj) => {
        console.log("Databse connected.");
        pool = poolObj;

        app.listen(3000, () => {
            console.log("Listening on port 3000");
        });
    })
    .catch((err) => {
        console.log("Error connecting to databse.");
    });
