import { config } from "@/config";
import type { UssdSessionContext } from "@/ussd/core/session-context";
import { StageHandler } from "@/ussd/core/stage-handlers";
import type { MenuResponse } from "@/ussd/core/types";
import { AmountStage } from "@/ussd/menus/amount";
import { ConfirmStage } from "@/ussd/menus/confirm";
import { ErrorAlert } from "@/ussd/menus/error";

export class WelcomeStage extends StageHandler {
	stage: string = "welcome";

	async getMenu(_: UssdSessionContext): Promise<MenuResponse> {
		const message =
			"Welcome to Mfantsipim 150th anniversary donation platoform\n Please select amount \n1. Ghs50 \n2. Ghs100 \n3. Ghs150 \n4. Enter other amount";
		return { message, continueSession: true };
	}

	async getNext(session: UssdSessionContext): Promise<StageHandler> {
		const ussd = session.getUssdData();
		if (ussd.isFirstMenu) return this;

		const isInvalidOption = !["1", "2", "3", "4"].includes(ussd.userData);
		if (isInvalidOption) return new ErrorAlert("Invalid option, please try again");

		if (ussd.userData === "4") return new AmountStage();

		const amount = this.extractAmount(ussd.userData);
		await session.update("amount", amount);
		return new ConfirmStage();
	}

	private extractAmount(option: string) {
		return (Number(option) * config.app.MIN_AMOUNT).toString();
	}
}
