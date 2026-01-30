import { config } from "@/config";
import type { UssdSessionContext } from "@/ussd/core/session-context";
import { StageHandler } from "@/ussd/core/stage-handlers";
import type { MenuResponse } from "@/ussd/core/types";
import { ErrorAlert } from "@/ussd/menus/error";
import { ConfirmStage } from "./confirm";

export class AmountStage extends StageHandler {
	stage: string = "amount";

	async getMenu(_: UssdSessionContext): Promise<MenuResponse> {
		return {
			message: `Please enter any amount from Ghs${config.app.MIN_AMOUNT}`,
			continueSession: true,
		};
	}

	async getNext(session: UssdSessionContext): Promise<StageHandler> {
		const ussdInput = session.getUssdData().userData;
		const response = this.validateAmount(ussdInput);

		if (!response.success) return new ErrorAlert(response.message as string);
		await session.update("amount", response.amount as string);

		return new ConfirmStage();
	}

	private validateAmount(userData: string) {
		const amount = Number(userData);
		if (Number.isNaN(amount))
			return {
				success: false,
				message: "Invalid amount, please enter a valid amount",
			};
		if (amount < config.app.MIN_AMOUNT)
			return {
				success: false,
				message: `Please enter Ghs${config.app.MIN_AMOUNT} or more`,
			};
		return {
			success: true,
			amount: amount.toString(),
		};
	}
}
