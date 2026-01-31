import type { UssdSessionContext } from "@/features/ussd/core/session-context";
import { StageHandler } from "@/features/ussd/core/stage-handlers";
import type { MenuResponse } from "@/features/ussd/core/types";

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
