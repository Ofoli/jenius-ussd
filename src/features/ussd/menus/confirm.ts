import { NaloPaymentService } from "@/services/payment";
import type { UssdSessionContext } from "../core/session-context";
import { StageHandler } from "../core/stage-handlers";
import type { MenuResponse } from "../core/types";
import { ErrorAlert } from "./error";

export class ConfirmStage extends StageHandler {
	stage: string = "confirm";

	paymentService: NaloPaymentService;
	constructor() {
		super();
		this.paymentService = new NaloPaymentService();
	}

	async getMenu(session: UssdSessionContext): Promise<MenuResponse> {
		const amount = await session.retrieve("amount");
		return {
			message: `Please confirm your donation of Ghs${amount} to Mfantsipim 150th anniversary. \n1. Confirm \n2. Cancel`,
			continueSession: true,
		};
	}

	async getNext(session: UssdSessionContext): Promise<StageHandler> {
		const ussd = session.getUssdData();

		if (ussd.userData !== "1") return new ErrorAlert("You have cancelled your donation");

		const paymentData = {
			msisdn: ussd.msisdn,
			network: ussd.network,
			amount: Number(await session.retrieve("amount")),
		};

		this.paymentService.pay(paymentData);
		const message =
			"Your donation has been initiated, please approve the next prompt to complete the payment";
		return new ErrorAlert(message);
	}
}
