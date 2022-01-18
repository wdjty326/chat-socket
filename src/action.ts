import http, { IncomingMessage, ServerResponse } from "http";
import nodb from "nodb";
import fs from "fs";
import path from "path";

import { getParameter, postParameter } from "./function";
import { Block } from "./interface";
import { UPLOAD_DIRECTORY, UPLOAD_FILE_PATH } from "./const";
import { wsSession } from "./session";

const db = nodb.getInstance();

export const getAction: http.RequestListener = (req, res) => {
	const pathname = req.url!;
	const search = pathname.substr(pathname.indexOf("?") + 1)
	const params = getParameter(search);

	if (pathname.startsWith("/upload/")) {
		const filePath = pathname.substr(8, pathname.indexOf("?") > -1 ? pathname.indexOf("?") : pathname.length);
		const extension = pathname.substr(filePath.lastIndexOf(".")).toLowerCase();
		let contentType = "image/jpeg";
		switch (extension) {
			case "gif":
				contentType = "image/gif";
				break;
			case "png":
				contentType = "image/png";
				break;
		}
		res.writeHead(200, {
			"Content-Type": contentType,
		});
		res.write(fs.readFileSync(path.resolve(UPLOAD_FILE_PATH, filePath), {
			flag: "r"
		}));
		res.end();
	}
	else if (pathname.startsWith("/check")) {
		const { idx } = params;

		if (typeof idx !== "string" || isNaN(parseInt(idx.toString(), 10)))
			throw new Error("Typeof Exception::idx");

		const checked = wsSession.getInstance()
			.get()
			.findIndex((data) => data[1] === parseInt(idx.toString(), 10));
		res.write(JSON.stringify({
			checked: checked !== -1,
		}));
		res.end();
	}
	else if (pathname.startsWith("/chatlist")) {
		const { roomid } = params;

		if (typeof roomid !== "string" || isNaN(parseInt(roomid.toString(), 10)))
			throw new Error("Typeof Exception::roomid");

		res.write(JSON.stringify(wsSession.getInstance()
			.getChats(parseInt(roomid, 10)).map((data) => ({ type: data[0], idx: data[1], name: data[2], message: data[3] }))));
		res.end();
	}
	else if (pathname.startsWith("/userlist")) {
		let { roomid } = params;

		if (roomid) {
			if (typeof roomid !== "string" || isNaN(parseInt(roomid.toString(), 10)))
				throw new Error("Typeof Exception::roomid");
			res.write(JSON.stringify(wsSession.getInstance().get(parseInt(roomid, 10)).map((data) => ({ idx: data[1], name: data[2] }))));
		} else
			res.write(JSON.stringify(wsSession.getInstance().get().map((data) => ({ idx: data[1], name: data[2] }))));
		res.end();
	}
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
};

export const postAction = (req: IncomingMessage, res: ServerResponse, raw: Buffer): void => {
	const pathname = req.url!;
	const body = raw.toString();

	const contentType = req.headers["content-type"] || "";
	if (!contentType.startsWith("multipart/form-data")) {
		res.write(JSON.stringify({
			error: "Content-Type::Multipart/form-data",
		}));
		return res.end();
	}

	const params = postParameter(body, raw);

	if (pathname.startsWith("/upload") && typeof params.file === "object") {
		const file = params.file;
		const filename = `${Date.now()}_${file.filename}`;

		if (!("filename" in file) || !file.filename.length) throw new Error("Typeof Exception::file");
		fs.writeFileSync(path.resolve(UPLOAD_FILE_PATH, filename), file.data);
		res.write(JSON.stringify({
			upload: `${UPLOAD_DIRECTORY}/${filename}`,
		}));
		res.end();
	}
	else {
		res.writeHead(404);
		res.end();
	};
};

