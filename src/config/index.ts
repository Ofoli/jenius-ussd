import type { ZodObject, ZodRawShape } from "zod";
import { ZodError, z } from "zod";

const AppEnvSchema = z.object({
	LOG_DIR: z.string(),
	PORT: z.coerce.number(),
	NODE_ENV: z.enum(["production", "development"]),
	MIN_AMOUNT: z.coerce.number(),
	DATABASE_URL: z.string(),
	DATABASE_AUTH_TOKEN: z.string(),
});

const RedisEnvSchema = z.object({
	REDIS_HOST: z.string(),
	REDIS_PORT: z.coerce.number(),
});

const PaymentEnvSchema = z.object({
	NALO_HOST: z.url(),
	NALO_MERCHANT: z.string(),
	NALO_SECRET_KEY: z.string(),
	NALO_AUTH_KEY: z.string(),
	NALO_CALLBACK_URL: z.url(),
});

type AppEnv = z.infer<typeof AppEnvSchema>;
type RedisEnv = z.infer<typeof RedisEnvSchema>;
type PaymentEnv = z.infer<typeof PaymentEnvSchema>;
class AppConfig {
	app: AppEnv;
	redis: RedisEnv;
	payment: PaymentEnv;

	constructor(nodeEnv: NodeJS.ProcessEnv) {
		this.app = this.validateEnv(nodeEnv, AppEnvSchema);
		this.redis = this.validateEnv(nodeEnv, RedisEnvSchema);
		this.payment = this.validateEnv(nodeEnv, PaymentEnvSchema);
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
