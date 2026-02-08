import type { Request, Response } from "express";
import { transactionQuerySchema, validateCallbackData } from "@/features/payment/schema";
import { NaloPaymentService } from "@/services/payment";
import { NaloSmsService } from "@/services/sms";
import { TransactionService } from "@/services/transaction";

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

export async function retrieveTransactions(req: Request, res: Response) {
	const result = transactionQuerySchema.safeParse(req.query);

	if (!result.success) {
		res.status(400).json({ success: false, error: result.error.issues });
		return;
	}

	const { offset, limit, status, msisdn } = result.data;
	const { data, total } = await TransactionService.query({ offset, limit, status, msisdn });

	res.status(200).json({
		success: true,
		data: {
			transactions: data,
			total,
		},
	});
}
