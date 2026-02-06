import type { UssdSessionContext } from "@/features/ussd/core/session-context";
import { StageHandler } from "@/features/ussd/core/stage-handlers";
import type { MenuResponse } from "@/features/ussd/core/types";
import { NameStage } from "@/features/ussd/menus/name";
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

		return new NameStage();
	}

	private validateAmount(userData: string) {
		const amount = Number(userData);
		if (Number.isNaN(amount) || amount < 1)
			return {
				success: false,
				message: "Invalid amount, please enter a valid amount",
			};
		return {
			success: true,
			amount: amount.toString(),
		};
	}

	private async getMessage(session: UssdSessionContext) {
		const message = await session.retrieve(this.messageKey);
		if (!message) return `Please enter any amount`;
		return message;
	}
}
