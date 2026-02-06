import type { UssdSessionContext } from "@/features/ussd/core/session-context";
import { StageHandler } from "@/features/ussd/core/stage-handlers";
import type { MenuResponse } from "@/features/ussd/core/types";
import { ConfirmStage } from "./confirm";

const MESSAGES = {
	minLength: 3,
	default: "Please enter your full name",
	retry: "Please enter your full name\n\nName must be at least 3 characters long",
};

export class NameStage extends StageHandler {
	stage: string = "name";
	messageKey: string = "nameMessage";

	async getMenu(session: UssdSessionContext): Promise<MenuResponse> {
		return { message: await this.getMessage(session), continueSession: true };
	}

	async getNext(session: UssdSessionContext): Promise<StageHandler> {
		const ussdInput = session.getUssdData().userData;
		if (ussdInput.length < MESSAGES.minLength) {
			await session.update(this.messageKey, MESSAGES.retry);
			return this;
		}

		await session.update("name", ussdInput);
		return new ConfirmStage();
	}

	private async getMessage(session: UssdSessionContext) {
		const message = await session.retrieve(this.messageKey);
		if (!message) return MESSAGES.default;
		return message;
	}
}
