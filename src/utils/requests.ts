import axios, { type AxiosError, type RawAxiosRequestHeaders } from "axios";

export type ApiResponse = {
	status: boolean;
	data: Record<string, unknown>;
};

export class Request {
	static async post<T extends Record<string, unknown>>(
		url: string,
		values: T,
		headers: RawAxiosRequestHeaders = {},
	): Promise<ApiResponse> {
		try {
			const { data } = await axios.post(url, values, { headers });
			return { status: true, data };
		} catch (err) {
			const { response } = err as AxiosError;
			const { message } = err as Error;
			return {
				status: false,
				data: response?.data || { message },
			} as ApiResponse;
		}
	}

	static async get(url: string): Promise<ApiResponse> {
		try {
			const { data } = await axios.get(url);
			return { status: true, data };
		} catch (err) {
			const { response } = err as AxiosError;
			const { message } = err as Error;

			return {
				status: false,
				data: response?.data || { message },
			} as ApiResponse;
		}
	}
}
