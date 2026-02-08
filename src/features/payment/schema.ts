import { z } from "zod";
import { STATUSES } from "@/config/constants";

const callbackDataSchema = z.object({
	status: z.enum(["COMPLETED", "FAILED"]),
	order_id: z.string(),
	amount: z.string(),
	charges: z.string(),
	amount_after_charges: z.string(),
});

export const transactionQuerySchema = z.object({
	offset: z.coerce.number().int().min(0).default(0),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	status: z.enum(STATUSES).optional(),
	msisdn: z.string().startsWith("233").min(12).max(12).optional(),
});

export const validateCallbackData = (data: Record<string, string>) =>
	callbackDataSchema.safeParse(data);

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;
