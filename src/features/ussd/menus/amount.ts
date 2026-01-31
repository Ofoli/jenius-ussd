import { config } from "@/config";
import type { UssdSessionContext } from "@/features/ussd/core/session-context";
import { StageHandler } from "@/features/ussd/core/stage-handlers";
import type { MenuResponse } from "@/features/ussd/core/types";
import { ConfirmStage } from "./confirm";

export class AmountStage extends StageHandler {
	stage: string = "amount";
	messageKey: string = "amountMessage";

	async getMenu(session: UssdSessionContext): Promise<MenuResponse> {
		return {
			message: await this.getMessage(session),
			continueSession: true,
		};
	}

	async getNext(session: UssdSessionContext): Promise<StageHandler> {
		const ussdInput = session.getUssdData().userData;
		const response = this.validateAmount(ussdInput);

		if (!response.success) {
			await session.update(this.messageKey, response.message as string);
			return this;
		}
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

	private async getMessage(session: UssdSessionContext) {
		const message = await session.retrieve(this.messageKey);
		if (!message) return `Please enter any amount from Ghs${config.app.MIN_AMOUNT}`;
		return message;
	}
}
