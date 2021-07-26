import ws from "ws";
import { MAXIMUM_CHAT_COUNT } from "./const";
import { WSType } from "./interface";

export class wsSession {
	private readonly chats: {
		[key: number]: Array<[WSType, number, string, string]>;
	} = {};
	private readonly list: Array<[number, number, string, ws]> = [];
	private static instance: wsSession | null = null;

	private constructor() { }
	public static getInstance() {
		if (this.instance === null)
			this.instance = new wsSession();
		return this.instance;
	}

	public push(data: [number, number, string, ws]) {
		this.list.push(data);
	}

	public delete(key: number) {
		const idx = this.list.findIndex((v) => v[1] === key);
		if (idx > -1) this.list.splice(idx, 1);
	}

	public get(roomid?: number) {
		return typeof roomid === "undefined" ? [...this.list] : [...this.list].filter((session) => session[0] === roomid);
	}

	public getChats(roomid: number) {
		return [...this.chats[roomid]];
	}

	public broadcast(type: WSType, roomid: number, idx: number, name: string, message: string) {
		this.list.filter((session) => session[0] === roomid)
			.forEach((session) => session[3].send(JSON.stringify({ type, idx, name, message })));

		if (typeof this.chats[roomid] === "undefined") this.chats[roomid] = [];
		this.chats[roomid].push([type, idx, name, message]);

		if (this.chats[roomid].length > MAXIMUM_CHAT_COUNT) this.chats[roomid].splice(0, 1);
	}
}
