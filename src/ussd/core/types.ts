export type UssdData = {
	SESSIONID: string;
	NETWORK: string;
	MSISDN: string;
	MSGTYPE: boolean;
	USERDATA: string;
	USERID: string;
};
export type UssdInputData = {
	userId: string;
	sessionId: string;
	userData: string;
	msisdn: string;
	network: string;
	isFirstMenu: boolean;
};
export type UssdSession = Record<string, string>;
export type MenuResponse = {
	message: string;
	continueSession: boolean;
};
