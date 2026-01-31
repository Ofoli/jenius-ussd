import { z } from "zod";

const callbackDataSchema = z.object({
	status: z.enum(["COMPLETED", "FAILED"]),
	order_id: z.string(),
	amount: z.string(),
	charges: z.string(),
	amount_after_charges: z.string(),
});

export const validateCallbackData = (data: Record<string, string>) =>
	callbackDataSchema.safeParse(data);
