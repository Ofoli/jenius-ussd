import type { Application } from "express";
import express from "express";

const port = 3000;
const app: Application = express();

app.use(express.json());

app.post("/", (_, res) => {
	res.send("Hello World");
});

app.listen(port, () =>
	console.log(`Server is running on http://localhost:${port}`),
);
