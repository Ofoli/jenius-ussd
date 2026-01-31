import type { UssdSessionContext } from "@/features/ussd/core/session-context";
import type { MenuResponse } from "@/features/ussd/core/types";

export abstract class StageHandler {
	abstract stage: string;
	abstract getMenu(session: UssdSessionContext): Promise<MenuResponse>;
	abstract getNext(session: UssdSessionContext): Promise<StageHandler>;
}

export class StageHandlerMapping {
	mapping: Map<string, StageHandler>;

	constructor(handlers: StageHandler[]) {
		this.mapping = new Map(
			handlers.map((handler) => {
				return [handler.stage, handler];
			}),
		);
	}
	get(name: string): StageHandler {
		const handler = this.mapping.get(name);
		if (!handler) throw new Error(`Handler Not Found: ${name}`);
		return handler;
	}
}
