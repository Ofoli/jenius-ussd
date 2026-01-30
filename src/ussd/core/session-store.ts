import type { UssdSession } from "@/ussd/core/types";
import type { RedisCache } from "@/utils/cache";

export abstract class BaseSessionStore {
	abstract get(key: string): Promise<UssdSession | null>;
	abstract set(key: string, session: UssdSession): Promise<void>;
	abstract destroy(key: string): Promise<void>;
}

export class RedisBasedSessionStore extends BaseSessionStore {
	private store: RedisCache;
	private SESSION_EXPIRATION: number = 300; //5mins

	constructor(store: RedisCache) {
		super();
		this.store = store;
	}

	destroy = (key: string) => this.store.destroy(this.rkey(key));
	get = (key: string) => this.store.get<UssdSession>(this.rkey(key));
	set = (key: string, session: UssdSession) =>
		this.store.set<UssdSession>(this.rkey(key), session, this.SESSION_EXPIRATION);

	rkey = (key: string) => `ussd:session:${key}`;
}
