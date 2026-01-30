import type { BaseSessionStore } from "@/ussd/core/session-store";
import type { MenuResponse, UssdData, UssdInputData, UssdSession } from "@/ussd/core/types";

export class UssdSessionContext {
	private store: BaseSessionStore;
	private nextStageKey = "_next_stage";
	private data: UssdInputData | null = null;

	constructor(sessionStore: BaseSessionStore) {
		this.store = sessionStore;
	}

	private async getCurrentSession(): Promise<UssdSession> {
		if (!this.data) return {};
		return (await this.store.get(this.data.sessionId)) ?? {};
	}

	async initialize(data: UssdData) {
		this.data = this.toInternal(data);
		if (this.data.isFirstMenu) {
			await this.store.set(this.data.sessionId, {});
		}
	}

	async retrieve(key: string): Promise<string> {
		const session = await this.getCurrentSession();
		return session[key];
	}

	async update(key: string, value: string) {
		const session = await this.getCurrentSession();
		session[key] = value;
		await this.store.set((this.data as UssdInputData).sessionId, session);
	}

	async nextStage(stage: string = ""): Promise<string> {
		const session = await this.getCurrentSession();
		if (!stage) stage = session[this.nextStageKey] ?? "welcome";
		await this.update(this.nextStageKey, stage);
		return stage;
	}

	getUssdData(): UssdInputData {
		return this.data as UssdInputData;
	}

	async getResponse(menu: MenuResponse): Promise<Record<string, string | boolean>> {
		const data = this.data as UssdInputData;
		if (!menu.continueSession) await this.store.destroy(data.sessionId);
		return {
			USERID: data.userId,
			MSISDN: data.msisdn,
			MSG: menu.message,
			MSGTYPE: menu.continueSession,
		};
	}

	toInternal(data: UssdData): UssdInputData {
		return {
			sessionId: data.SESSIONID,
			userData: data.USERDATA,
			msisdn: data.MSISDN,
			network: data.NETWORK,
			isFirstMenu: data.MSGTYPE,
			userId: data.USERID,
		};
	}
}
