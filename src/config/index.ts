import type { ZodObject, ZodRawShape } from "zod";
import { ZodError, z } from "zod";

const AppEnvSchema = z.object({
	LOG_DIR: z.string(),
	PORT: z.coerce.number(),
	NODE_ENV: z.enum(["production", "development"]),
	MIN_AMOUNT: z.coerce.number(),
});

const RedisEnvSchema = z.object({
	REDIS_HOST: z.string(),
	REDIS_PORT: z.coerce.number(),
});

type AppEnv = z.infer<typeof AppEnvSchema>;
type RedisEnv = z.infer<typeof RedisEnvSchema>;

class AppConfig {
	app: AppEnv;
	redis: RedisEnv;

	constructor(nodeEnv: NodeJS.ProcessEnv) {
		this.app = this.validateEnv(nodeEnv, AppEnvSchema);
		this.redis = this.validateEnv(nodeEnv, RedisEnvSchema);
	}

	private validateEnv<T extends ZodRawShape>(env: NodeJS.ProcessEnv, schema: ZodObject<T>) {
		try {
			return schema.parse(env);
		} catch (error) {
			let message = "";
			if (error instanceof ZodError) {
				message = JSON.stringify(
					error.issues.map((issue) => {
						return { path: issue.path[0], message: issue.message };
					}),
				);
			} else {
				message = (error as Error).message;
			}
			console.error({ action: "validateEnvVariables", message });
			process.exit(1);
		}
	}
}

export const config = new AppConfig(process.env);
