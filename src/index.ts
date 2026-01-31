import type { Application } from "express";
import express from "express";
import { config } from "@/config";
import { handleNaloPaymentCallback } from "@/features/payment/index";
import { handleUssd } from "@/features/ussd/index";

const port = config.app.PORT;
const app: Application = express();

app.use(express.json());

app.post("/api/ussd/", handleUssd);
app.post("/api/payment/callback", handleNaloPaymentCallback);
app.get("/", (_, res) => res.send("OK"));

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
