import http, { IncomingMessage, ServerResponse } from "http";
import nodb from "nodb";
import fs from "fs";
import path from "path";

import { getParameter, postParameter } from "./function";
import { Block } from "./interface";
import { UPLOAD_DIRECTORY, UPLOAD_FILE_PATH } from "./const";

const db = nodb.getInstance();

export const getAction: http.RequestListener = (req, res) => {
	const pathname = req.url!;
	const search = pathname.substr(pathname.indexOf("?") + 1)
	const params = getParameter(search);

	if (pathname.startsWith("/blocklist")) {
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

export const postAction = (req: IncomingMessage, res: ServerResponse, body: string): void => {
	const pathname = req.url!;
	const params = postParameter(body);

	if (pathname.startsWith("/upload") && typeof params.file === "object") {
		const file = params.file;
		const filename = `${Date.now()}_${file.filename}`;

		if (!("filename" in file) || !file.filename.length) throw new Error("Typeof Exception::file");
		fs.writeFileSync(path.resolve(UPLOAD_FILE_PATH, filename), file.data);
		res.write(JSON.stringify({
			upload: `${UPLOAD_DIRECTORY}/${filename}`,
		}));
	}
	else {
		res.writeHead(404);
		res.end();
	};
};

