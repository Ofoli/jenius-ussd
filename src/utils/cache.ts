import { createClient, type RedisClientType } from "redis";
import { config } from "@/config";
import { getLogger } from "@/utils/logger";

export class RedisCache {
	private client: RedisClientType | undefined;
	private readonly logger = getLogger("system");

	constructor(host: string, port: number) {
		this.connect(host, port);
	}

	private async connect(host: string, port: number) {
		try {
			this.client = createClient({ url: `redis://${host}:${port}` });
			await this.client.connect();
			console.log("Connected to Redis");
		} catch (error) {
			this.logger.error({ action: "redis-connect", details: error });
			console.error("Error connecting to Redis:", error);
		}
	}

	async get<T>(key: string): Promise<T | null> {
		if (!this.client?.isReady) return null;

		try {
			const data = await this.client.get(key);
			return data === null ? null : (JSON.parse(data) as T);
		} catch (error) {
			this.logger.error({
				action: "cache-get",
				data: key,
				details: error,
			});
			return null;
		}
	}

	async set<T extends Record<string, unknown>>(
		key: string,
		value: T,
		expirationInSeconds: number,
	): Promise<void> {
		if (!this.client?.isReady) return;

		try {
			await this.client.setEx(key, expirationInSeconds, JSON.stringify(value));
		} catch (error) {
			this.logger.error({
				action: "cache-set",
				data: { key, value },
				details: error,
			});
		}
	}

	async destroy(key: string) {
		if (!this.client?.isReady) return;

		try {
			await this.client.del(key);
		} catch (error) {
			this.logger.error({
				action: "cache-unset",
				data: key,
				details: error,
			});
		}
	}

	async disconnect(): Promise<void> {
		if (this.client?.isReady) {
			await this.client.quit();
			console.log("Disconnected from Redis");
		}
	}
}

export const redisCache = new RedisCache(
	config.redis.REDIS_HOST,
	config.redis.REDIS_PORT,
);
