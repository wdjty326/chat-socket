import ws from "ws";
import { MAXIMUM_CHAT_COUNT } from "./const";
import { WSType } from "./interface";

export class wsSession {
	private readonly chats: Array<[WSType, number, string, string]> = [];
	private readonly list: Array<[number, string, ws]> = [];
	private static instance: wsSession | null = null;

	private constructor () {}
	public static getInstance () {
		if (this.instance === null)
			this.instance = new wsSession();
		return this.instance; 
	}

	public push (data: [number, string, ws]) {
		this.list.push(data);
	}

	public delete (key: number) {
		const idx = this.list.findIndex((v) => v[0] === key);
		if (idx > -1) this.list.splice(idx, 1);
	}

	public get () {
		return [...this.list];
	}

	public getChats () {
		return [...this.chats];
	}

	public broadcast(type: WSType, idx: number, name: string, message: string) {
		this.list.forEach((session) => session[2].send(JSON.stringify({ type, idx, name, message })));
		this.chats.push([type, idx, name, message]);
		if (this.chats.length > MAXIMUM_CHAT_COUNT) this.chats.splice(0, 1);
	}
}
