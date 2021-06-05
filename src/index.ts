import http from "http";
import ws from "ws";
import fs from "fs";

import nodb from "nodb";

const db = nodb.getInstance();
try {
	db.createFile("block", { name: "idx", primary: true }, { name: "target" }, { name: "timestamp" });
} catch (e) {}

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
		const params: {
			[key: string]: string | number | boolean;
		} = {};
		const search = pathname.substr(pathname.indexOf("?") + 1);
		search
			.split("&")
			.forEach((s) => {
				const sp = s.split("=");

				const key = sp[0];
				const value = decodeURIComponent(sp[1] || "");

				if (isNaN(parseInt(value, 10)))
					params[key] = parseInt(value, 10);
				else if (value.toLowerCase() === "true" || value.toLowerCase() === "false")
					params[key] = value.toLowerCase() === "true";
				else
					params[key] = value;
			});

		if (pathname.startsWith("/upload")) {
			// req.on("data", (chunk) => {
			// 	fs.writeFileSync("")
			// });
		} else if (pathname.startsWith("/block")) {

		} else if (pathname.startsWith("/unblock")) {

		} throw new Error("Not Found");
	} catch (e) {
		res.write(JSON.stringify({
			error: e.message,
		}));
	} finally {
		res.end();
	}
});
server.on("listening", () => {
	console.log("server listening 8443");
});
server.listen("8443");


//-----------------------------------

interface wsData {
	event: "open" | "message" | "close";
	data: {
		type: "file" | "string";
		message: string;
	};
}

const websocket = new ws.Server({
	port: 8444,
});
websocket.on("connection", (socket, request) => {
	socket.on("open", () => {
		console.log(`${request.socket.address()}`);
	});
	socket.on("message", (msg) => {
		console.log(`Received message ${msg} from user`);
		try {
			let send: wsData = JSON.parse(msg.toString());
			switch (send.event) {
				case "open":
					socket.send(JSON.stringify({ message: "00님이 입장하였습니다." }));	
					break;
				case "message":
					socket.send(JSON.stringify({ message: send.data.message }));	
					break;
				case "close":
					socket.send(JSON.stringify({ message: "00님이 퇴장하였습니다." }));	
					break;	
			}
		} catch (e) {}
	});
});
websocket.on("listening", () => {
	console.log("websocket listening 8444");
});
