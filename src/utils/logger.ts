import path from "node:path";
import winston from "winston";
import { config } from "@/config";
import { LOGGERS } from "@/config/constants";

const { timestamp, printf, combine } = winston.format;
const formatter = (log: winston.Logform.TransformableInfo) =>
	`${log.timestamp} - ${
		log.name
	}-logger - ${log.level.toUpperCase()} ${JSON.stringify(log.message)}`;

export type TLogger = (typeof LOGGERS)[number];

export const getLogger = (name: TLogger) => {
	const loggers: Record<TLogger, winston.Logger> = LOGGERS.reduce(
		(all, name: TLogger) => {
			all[name] = winston.createLogger({
				level: "info",
				format: combine(
					timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
					winston.format((info) => {
						info.name = name;
						return info;
					})(),
					printf(formatter),
				),
				transports: [
					new winston.transports.Console(),
					new winston.transports.File({
						filename: path.join(config.app.LOG_DIR, `${name}.log`),
					}),
				],
			});
			return all;
		},
		{} as Record<TLogger, winston.Logger>,
	);

	return loggers[name];
};

type Log = {
	action: string;
	details: string;
	metadata?: Record<string, unknown>;
};

export class ServiceLogger {
	private readonly logger: winston.Logger;

	constructor(name: TLogger) {
		this.logger = getLogger(name);
	}

	public info = (log: Log) => this.logger.info(log);
	public error = (log: Log) => this.logger.error(log);
}
