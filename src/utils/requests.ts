import axios, { type AxiosError } from "axios";

export type SuccessResponse = {
	status: true;
	data: Record<string, unknown>;
};

type ErrorResponse = {
	status: false;
	message: Record<string, string> | string;
};

export class Request {
	test() {
		return null;
	}
	static async post<T extends Record<string, unknown>>(
		url: string,
		values: T,
		headers: { token?: string; auth?: string } = {},
	): Promise<SuccessResponse | ErrorResponse> {
		try {
			const token = headers.token ?? "";
			const auth = headers.auth ?? "";
			const { data } = await axios.post(url, values, {
				headers: { "x-api-key": token, token, Authorization: `Basic ${auth}` },
			});
			return { status: true, data };
		} catch (err) {
			const { response } = err as AxiosError;
			const { message } = err as Error;
			return {
				status: false,
				message: response?.data ?? message,
			} as ErrorResponse;
		}
	}

	static async get(url: string, token: string = ""): Promise<SuccessResponse | ErrorResponse> {
		try {
			const { data } = await axios.get(url, {
				headers: { "x-api-key": token },
			});
			return { status: true, data };
		} catch (err) {
			const { response } = err as AxiosError;
			const { message } = err as Error;
			return {
				status: false,
				message: response?.data ?? message,
			} as ErrorResponse;
		}
	}
}
