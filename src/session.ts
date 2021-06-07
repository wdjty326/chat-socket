import ws from "ws";

export class wsSession {
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

	public broadcast(idx: number, name: string, message: string) {
		this.list.forEach((session) => session[2].send(JSON.stringify({ idx, name, message })));
	}
}
