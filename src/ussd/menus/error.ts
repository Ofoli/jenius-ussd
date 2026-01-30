import type { UssdSessionContext } from "@/ussd/core/session-context";
import { StageHandler } from "@/ussd/core/stage-handlers";
import type { MenuResponse } from "@/ussd/core/types";

export class ErrorAlert extends StageHandler {
	stage: string = "error";
	error: string;

	constructor(error: string) {
		super();
		this.error = error;
	}

	async getMenu(_: UssdSessionContext): Promise<MenuResponse> {
		return { message: this.error, continueSession: false };
	}

	async getNext(_: UssdSessionContext): Promise<StageHandler> {
		return this;
	}
}
