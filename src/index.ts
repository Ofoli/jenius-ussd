import type { Application } from "express";
import express from "express";
import { config } from "@/config";
import { handleUssd } from "@/ussd/index";

const port = config.app.PORT;
const app: Application = express();

app.use(express.json());

app.post("/api/ussd/", handleUssd);
app.get("/", (_, res) => res.send("OK"));

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
