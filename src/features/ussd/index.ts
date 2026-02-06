import type { Request, Response } from "express";
import { createUssdApplication } from "@/features/ussd/core/index";
import { type StageHandler, StageHandlerMapping } from "@/features/ussd/core/stage-handlers";
import type { UssdData } from "@/features/ussd/core/types";
import { AmountStage } from "@/features/ussd/menus/amount";
import { ConfirmStage } from "@/features/ussd/menus/confirm";
import { NameStage } from "@/features/ussd/menus/name";
import { WelcomeStage } from "@/features/ussd/menus/welcome";
import { redisCache } from "@/utils/cache";
import { getLogger } from "@/utils/logger";

const handlers: Array<StageHandler> = [
	new WelcomeStage(),
	new AmountStage(),
	new NameStage(),
	new ConfirmStage(),
];
const logger = getLogger("system");
const UssdApp = createUssdApplication(redisCache);

export const handleUssd = async (req: Request, res: Response) => {
	try {
		const data = req.body as UssdData;
		const mapping = new StageHandlerMapping(handlers);
		const response = await UssdApp.run(data, mapping);
		return res.json(response);
	} catch (error) {
		const { message } = error as Error;
		logger.error({ action: "handle-ussd", details: message });
		return res.status(500).json({ error: "Something went wrong" });
	}
};
