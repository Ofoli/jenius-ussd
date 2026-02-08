import cors from "cors";
import type { Application } from "express";
import express from "express";
import { config } from "@/config";
import {
	handleNaloPaymentCallback,
	handleSmsCallback,
	retrieveTransactions,
} from "@/features/payment/index";
import { authenticate } from "@/features/payment/middleware";
import { handleUssd } from "@/features/ussd/index";

const port = config.app.PORT;
const app: Application = express();

app.use(cors({ origin: config.app.FRONTEND_URL }));
app.use(express.json());

app.post("/api/ussd/", handleUssd);
app.post("/api/sms/callback", handleSmsCallback);
app.post("/api/payment/callback", handleNaloPaymentCallback);
app.get("/api/payment/transactions", authenticate, retrieveTransactions);
app.get("/", (_, res) => res.send("OK"));

app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));
