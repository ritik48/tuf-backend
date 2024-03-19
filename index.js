import express from "express";
import cors from "cors";

import { connectDB } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

let pool;

const catchAsyc = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch((err) => next(err));
    };
};

const getLanguageIds = {
    Cpp: 54,
    Javascript: 93,
    C: 48,
    Go: 95,
    Python: 92,
    Java: 91,
};

app.get(
    "/",
    catchAsyc(async (req, res, next) => {
        try {
            const [row] = await pool.query("SELECT * FROM code");
            res.status(200).json({ data: row });
        } catch (error) {
            next(error);
        }
    })
);

app.post(
    "/new",
    catchAsyc(async (req, res, next) => {
        let { username, language, input, source_code, output } = req.body;

        if (!output) output = "No output";
        if (!input) input = "No input";

        const query = `INSERT INTO code (username, language, input, source_code, output) VALUES (?, ?, ?, ?, ?)`;
        const data = await pool.query(query, [
            username,
            language,
            input,
            source_code,
            output,
        ]);

        res.status(201).json({ message: "Data inserted successfully" });
    })
);

app.post(
    "/submissions",
    catchAsyc(async (req, res, next) => {
        const { code, stdin, language } = req.body;
        console.log(req.body);
        let language_id = getLanguageIds[language];
        console.log("id = ", language_id);

        const response = await fetch(
            `https://judge0-ce.p.rapidapi.com/submissions?wait=true&base64_encoded=true&fields=*`,
            {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Content-Type": "application/json",
                    "X-RapidAPI-Key":
                        process.env.RAPIDAPI_KEY,
                    "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
                },
                body: JSON.stringify({
                    language_id,
                    source_code: btoa(code),
                    stdin: btoa(stdin),
                }),
            }
        );

        const data = await response.json();
        const responseJson = {
            stdout: data.stdout ? atob(data.stdout) : null,
            accepted: data.status.id === 3,
            message: data.status.description,
        };
        console.log(data);
        res.status(201).json(responseJson);
    })
);

app.get(
    "/submissions/:id",
    catchAsyc(async (req, res, next) => {
        const { id } = req.params;

        const response = await fetch(
            `https://judge0-ce.p.rapidapi.com/submissions/${id}?base64_encoded=true&fields=*`,
            {
                headers: {
                    "X-RapidAPI-Key":
                        process.env.RAPIDAPI_KEY,
                    "X-RapidAPI-Host": process.env.RAPIDAPI_HOST,
                },
            }
        );

        if (!response.ok) {
            return res.status(404).json({ message: "Cannot fetch the output" });
        }

        const data = await response.json();

        const responseJson = {
            stdout: atob(data.stdout),
            accepted: data.status.id === 3,
            message: data.status.description,
        };
        console.log(responseJson);

        res.status(200).json(responseJson);
    })
);

// app.get("/:id", async (req, res) => {
//     const { id } = req.params;

//     const [data] = await pool.query(`SELECT * FROM code WHERE id=?`, [id]);
//     console.log(data[0]);
//     res.status(200).send({ data: data[0].source_code });
// });

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
