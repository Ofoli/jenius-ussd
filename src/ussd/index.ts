import type { Request, Response } from "express";
import { createUssdApplication } from "@/ussd/core/index";
import { type StageHandler, StageHandlerMapping } from "@/ussd/core/stage-handlers";
import type { UssdData } from "@/ussd/core/types";
import { redisCache } from "@/utils/cache";
import { getLogger } from "@/utils/logger";
import { AmountStage } from "./menus/amount";
import { ConfirmStage } from "./menus/confirm";
import { WelcomeStage } from "./menus/welcome";

const handlers: Array<StageHandler> = [new WelcomeStage(), new AmountStage(), new ConfirmStage()];
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
