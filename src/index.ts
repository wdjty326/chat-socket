// 교육용
import http from "http";
import ws from "ws";
import fs from "fs";
import nodb from "nodb";

import { wsSession } from "./session";
import { getAction, postAction } from "./action";
import { UPLOAD_FILE_PATH } from "./const";
import { WSType } from "./interface";

if (!fs.existsSync(UPLOAD_FILE_PATH)) fs.mkdirSync(UPLOAD_FILE_PATH);


const db = nodb.getInstance();
try {
	db.createFile("block", { name: "idx", primary: true }, { name: "target", primary: true }, { name: "timestamp" })
		.then(() => { });
} catch (e) {
	console.log(e);
}

const server = http.createServer((req, res) => {
	const pathname = req.url || "/";
	console.log(`Request for ${pathname} received.`);

	res.writeHead(200, {
		"Access-Control-Allow-Origin": "*",
		"Content-Type": "text/html",
	});

	if (pathname === "favicon.ico") return res.end();
	if (pathname === "/") {
		res.write("Welcome Test Server");
		return res.end();
	}

	try {
		if (req.method === "GET") return getAction(req, res);
		else if (req.method === "POST") {
			const chunks: Buffer[] = [];
			req.on("data", (data) => {
				chunks.push(data);
			});
			req.on("end", () => {
				const raw = Buffer.concat(chunks);
				// const body = raw.toString("binary"); // Buffer.from(Buffer.concat(chunks), "utf8");
				postAction(req, res, raw);
			});
		}
	} catch (e) {
		console.error(e);
		res.write(JSON.stringify({
			error: e.message,
		}));
		res.end();
	}
});
server.on("listening", () => {
	console.log("server listening 8443");
});
server.listen("8443");


//-----------------------------------

interface wsData {
	event: WSType;
	message: string;
}

const instance = wsSession.getInstance();

const websocket = new ws.Server({
	port: 8444,
});
websocket.on("connection", (socket, request) => {
	const pathname = request.url || "/";
	if (pathname === "/") return;

	const data = pathname.split(/\//g);
	if (data.length < 4) return;
	
	const roomid = parseInt(data[1], 10);
	const idx = parseInt(data[2], 10);
	const name = data[3];

	if (isNaN(roomid) || isNaN(idx)) return;

	socket.on("message", (msg) => {
		console.log(`Received message ${msg} from user`);
		try {
			let send: wsData = JSON.parse(msg.toString());
			switch (send.event) {
				case WSType.Message:
					instance.broadcast(WSType.Message, roomid, idx, name, send.message);
					break;
				default:
					instance.broadcast(send.event, roomid, idx, name, "");
					break;	
			}
		} catch (e) {
			console.error(e);
		}
	});
	socket.on("close", () => {
		instance.delete(idx);
		instance.broadcast(WSType.Close, roomid, idx, name, `${name}님께서 퇴장하셨습니다.`);
	});

	instance.push([roomid, idx, name, socket]);
	instance.broadcast(WSType.Open, roomid, idx, name, `${name}님께서 입장하셨습니다.`);
});
websocket.on("listening", () => {
	console.log("websocket listening 8444");
});
