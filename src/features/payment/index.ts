import type { Request, Response } from "express";
import { validateCallbackData } from "@/features/payment/schema";
import { NaloPaymentService } from "@/services/payment";
import { NaloSmsService } from "@/services/sms";

export async function handleNaloPaymentCallback(req: Request, res: Response) {
	const validationResponse = validateCallbackData(req.body);
	if (!validationResponse.success) {
		return res.status(400).json(validationResponse.error);
	}

	const response = await new NaloPaymentService().processCallback(validationResponse.data);
	return res.status(response.status).json(response.message);
}

export async function handleSmsCallback(req: Request, res: Response) {
	new NaloSmsService().handleCallback(req.body);
	return res.status(200).send("ok");
}
