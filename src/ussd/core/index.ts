import { UssdSessionContext } from "@/ussd/core/session-context";
import { RedisBasedSessionStore } from "@/ussd/core/session-store";
import type { StageHandlerMapping } from "@/ussd/core/stage-handlers";
import type { UssdData } from "@/ussd/core/types";
import type { RedisCache } from "@/utils/cache";

class UssdCoreApp {
	private session: UssdSessionContext;

	constructor(session: UssdSessionContext) {
		this.session = session;
	}

	async run(data: UssdData, handlers: StageHandlerMapping) {
		await this.session.initialize(data);
		const stage = await this.session.nextStage();
		const handler = handlers.get(stage);
		const nextHandler = await handler.getNext(this.session);
		const menu = await nextHandler.getMenu(this.session);

		await this.session.nextStage(nextHandler.stage);
		return await this.session.getResponse(menu);
	}
}

export function createUssdApplication(cache: RedisCache) {
	const sessionStore = new RedisBasedSessionStore(cache);
	const ussdContext = new UssdSessionContext(sessionStore);
	return new UssdCoreApp(ussdContext);
}
