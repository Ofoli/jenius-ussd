import type { NextFunction, Request, Response } from "express";
import { config } from "@/config";

export function authenticate(req: Request, res: Response, next: NextFunction) {
	const key = req.headers["x-api-key"];

	if (!key || key !== config.app.API_KEY) {
		res.status(401).json({ success: false, error: "Unauthorized" });
		return;
	}

	next();
}
