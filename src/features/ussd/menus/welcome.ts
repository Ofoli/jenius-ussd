import { config } from "@/config";
import type { UssdSessionContext } from "@/features/ussd/core/session-context";
import { StageHandler } from "@/features/ussd/core/stage-handlers";
import type { MenuResponse } from "@/features/ussd/core/types";
import { AmountStage } from "@/features/ussd/menus/amount";
import { ErrorAlert } from "@/features/ussd/menus/error";
import { NameStage } from "@/features/ussd/menus/name";

export class WelcomeStage extends StageHandler {
	stage: string = "welcome";

	async getMenu(_: UssdSessionContext): Promise<MenuResponse> {
		const message =
			"Welcome to the Official Mfantsipim 150th Anniversary Donation Platform\n\n Please select amount \n1. Ghs50 \n2. Ghs100 \n3. Ghs150 \n4. Enter other amount";
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
		return new NameStage();
	}

	private extractAmount(option: string) {
		return (Number(option) * config.app.MIN_AMOUNT).toString();
	}
}
