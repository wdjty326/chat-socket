// 교육용
import http from "http";
import ws from "ws";
import fs from "fs";
import path from "path";

import nodb from "nodb";
import { Block, Parameter, ParameterFile } from "./interface";
import { UploadDir } from "./const";

const UPLOAD_FILE_PATH = path.resolve(__dirname, UploadDir);
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

	if (req.method === "GET") {
		res.writeHead(403);
		return res.end();
	}

	res.writeHead(200, {
		"Access-Control-Allow-Origin": "*",
		"Content-Type": "text/html",
	});

	if (pathname === "favicon.ico") return res.end();
	if (pathname === "/") {
		res.write("Welcome Test Server");
		return res.end();
	}

	// try {
	new Promise<Parameter>((resolve) => {
		const params: Parameter = {};
		const chunks: BlobPart[] = [];
		req.on("data", (data) => {
			chunks.push(data);
		});
		req.on("end", () => {
			const body = chunks.toString().split(/\r\n/g);
			const webKitFormBoundary = body[0];
			const webKitFormBoundaryEnded = `${webKitFormBoundary}--`;

			body.forEach((line, idx) => {
				if (line === webKitFormBoundaryEnded) return;
				if (line === webKitFormBoundary) {
					const header = body[idx + 1];
					const name = header.substring(
						header.indexOf("name") + 6,
						header.indexOf("\"", header.indexOf("name") + 6),
					);

					const isFile = header.includes("filename");
					if (isFile) {
						const value = body[idx + 4] || webKitFormBoundaryEnded;
						if (value === webKitFormBoundary || value === webKitFormBoundary) params[name] = "";
						else {
							let buf = Buffer.from(value, "binary");
							// buf = buf.slice(buf.findIndex((v) => v === 0x00), buf.length);
							// buf.set([0xff, 0xd8, 0xff, 0x0e], 0);
							console.log(buf);
							params[name] = {
								filename: header.substring(
									header.indexOf("filename") + 10,
									header.indexOf("\"", header.indexOf("filename") + 10),
								),
								data: value,// new Blob([value]),
							};
						}
					} else {
						const value = body[idx + 3] || webKitFormBoundaryEnded;
						if (value === webKitFormBoundary || value === webKitFormBoundary) params[name] = "";
						else params[name] = decodeURIComponent(value);
					}
				}
			});

			resolve(params);
		});
	}).then((params) => {
		try {
			if (pathname.startsWith("/upload")) {
				const file = params.file as ParameterFile;
				const filename = `${Date.now()}_${file.filename}`;

				if (!file || !("filename" in file)) throw new Error("Typeof Exception::file");
				fs.writeFileSync(path.resolve(UPLOAD_FILE_PATH, filename), file.data);
				res.write(JSON.stringify({
					upload: `${UploadDir}/${filename}`,
				}));
			}
			// 차단 리스트
			else if (pathname.startsWith("/blocklist")) {
				const { idx } = params;

				if (typeof idx !== "string" || isNaN(parseInt(idx.toString(), 10)))
					throw new Error("Typeof Exception::idx");

				db.select<Block>("block", (data) => data.idx === parseInt(idx.toString(), 10))
					.then((datas) => {
						res.write(JSON.stringify(datas));
						res.end();
					})
					.catch((e) => {
						throw e;
					});
			}
			// 차단 및 차단해제
			else if (pathname.startsWith("/block") || pathname.startsWith("/unblock")) {
				const { idx, target } = params;

				if (typeof idx !== "string" || isNaN(parseInt(idx.toString(), 10)))
					throw new Error("Typeof Exception::idx");
				if (typeof target !== "string" || isNaN(parseInt(target.toString(), 10)))
					throw new Error("Typeof Exception::target");

				if (pathname.startsWith("/block")) {
					db.insertData<Block>("block", {
						idx: parseInt(idx.toString(), 10),
						target: parseInt(target.toString(), 10),
						timestamp: Date.now(),
					})
						.then(() => {
							res.write("{}");
							res.end();
						})
						.catch((e) => {
							throw e;
						});
				} else {
					db.deleteData<Block>("block", {
						idx: parseInt(idx.toString(), 10),
						target: parseInt(target.toString(), 10),
					})
						.then(() => {
							res.write("{}");
							res.end();
						})
						.catch((e) => {
							throw e;
						});
				}
			}
			else {
				res.writeHead(404);
				res.end();
			};
		} catch (e) {
			console.error(e);
			res.write(JSON.stringify({
				error: e.message,
			}));
			res.end();
		}
	});
});
server.on("listening", () => {
	console.log("server listening 8443");
});
server.listen("8443");


//-----------------------------------

interface wsData {
	event: "open" | "message" | "close";
	message: string;
}

const broadcast = (name: string, message: string) => sessions.forEach((session) => session[2].send(JSON.stringify({ name, message })));

const sessions: Array<[number, string, ws]> = [];
const websocket = new ws.Server({
	port: 8444,
});
websocket.on("connection", (socket, request) => {
	const pathname = request.url || "/";
	if (pathname === "/") return;

	const data = pathname.split(/\//g);
	if (data.length < 3) return;

	const idx = parseInt(data[1], 10);
	if (isNaN(idx)) return;

	sessions.push([idx, data[2], socket]);

	socket.on("message", (msg) => {
		console.log(`Received message ${msg} from user`);
		try {
			let send: wsData = JSON.parse(msg.toString());
			switch (send.event) {
				case "message":
					broadcast(data[2], send.message);
					break;
			}
		} catch (e) {
			console.error(e);
		}
	});
	socket.on("close", () => {
		const idx = sessions.findIndex((v) => v[0] === idx);
		if (idx > -1) sessions.splice(idx, 1);
		broadcast(data[2], `${data[2]}님께서 퇴장하셨습니다.`);
	});
	broadcast(data[2], `${data[2]}님께서 입장하셨습니다.`);
});
websocket.on("listening", () => {
	console.log("websocket listening 8444");
});
