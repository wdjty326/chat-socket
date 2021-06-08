type GetObject = { [key: string]: string | string | number | boolean };

type PostObject = {
	[key: string]: string | { filename: string; data: string | Buffer; };
};

export const getParameter = (search: string): GetObject => {
	const params: GetObject = {};
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
	return params;
};

export const postParameter = (body: string, raw: Buffer): PostObject => {
	const params: PostObject = {};
	const bodySplit = body.split(/\r\n/g);

	// const start = bodySplit[0];
	const boundary = bodySplit[0];
	const boundaryEof = `${boundary}--`;

	console.log(bodySplit[0]);
	let pos = 0;
	bodySplit.forEach((line, idx) => {
		if (line === boundaryEof) return;
		if (line === boundary) {
			const header = bodySplit[idx + 1];
			const name = header.substring(
				header.indexOf("name") + 6,
				header.indexOf("\"", header.indexOf("name") + 6),
			);

			const isFile = header.includes("filename");
			if (isFile) {
				const value = bodySplit[idx + 4] || boundaryEof;
				if (value === boundary || value === boundaryEof) params[name] = "";
				else {
					const filename = header.substring(
						header.indexOf("filename") + 10,
						header.indexOf("\"", header.indexOf("filename") + 10),
					);
					let data: Buffer = Buffer.alloc(0);

					const type = bodySplit[idx + 2].substr(14);
					if (type === "image/jpeg") {
						const starts = Buffer.alloc(3);
						starts.set([0xff, 0xd8, 0xff]);

						const ends = Buffer.alloc(2);
						ends.set([0xff, 0xd9]);

						data = raw.slice(raw.indexOf(starts, pos), raw.indexOf(ends, pos) + 2);// new Blob([value]),
					} else if (type === "image/png") {
						const starts = Buffer.alloc(8);
						starts.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

						const ends = Buffer.alloc(8);
						ends.set([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);

						data = raw.slice(raw.indexOf(starts, pos), raw.indexOf(ends, pos) + 8);// new Blob([value]),
					} else if (type === "image/gif") {
						const starts = Buffer.alloc(6);
						starts.set([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
						if (raw.indexOf(starts, pos) === -1) starts.set([0x39], 4);

						const ends = Buffer.alloc(2);
						ends.set([0x00, 0x3b]);

						let pos_start = raw.indexOf(starts, pos);
						let pos_end = raw.indexOf(ends, pos) + 2;

						do {
							data = Buffer.concat([data, raw.slice(pos_start, pos_end)]);// new Blob([value]),
							pos_start = pos_end; // raw.indexOf(starts, pos_end);
							pos_end = raw.indexOf(ends, pos_end) + 2;
						} while (pos_start !== 1)
					}

					params[name] = {
						filename,
						data,// new Blob([value]),
					};
				}
			} else {
				const value = bodySplit[idx + 3] || boundaryEof;
				if (value === boundaryEof || value === boundaryEof) params[name] = "";
				else params[name] = decodeURIComponent(value);
			}
		}
		pos += line.length;
	});

	return params;
};
