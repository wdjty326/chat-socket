type GetObject = { [key: string]: string | string | number | boolean };

type PostObject = {
	[key: string]: string | { filename: string; data: string; };
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

export const postParameter = (body: string): PostObject => {
	const params: PostObject = {};
	const bodySplit = body.split(/\r\n/g);

	const start = bodySplit[0];
	const end = `${start}--`;

	bodySplit.forEach((line, idx) => {
		if (line === end) return;
		if (line === start) {
			const header = bodySplit[idx + 1];
			const name = header.substring(
				header.indexOf("name") + 6,
				header.indexOf("\"", header.indexOf("name") + 6),
			);

			const isFile = header.includes("filename");
			if (isFile) {
				const value = bodySplit[idx + 4] || end;
				if (value === start || value === end) params[name] = "";
				else {
					let fileStream = "";
					for (let i = idx + 5; bodySplit[i] !== start && bodySplit[i] !== end; i++) fileStream += bodySplit[i];

					const type = bodySplit[idx + 2].substr(14);
					console.log(type, bodySplit[idx + 5]);
					if (type === "image/jpeg") {

					} else if (type === "image/png") {
						let fileStream = "";
						for (let i = idx + 5; bodySplit[i] !== start && bodySplit[i] !== end; i++) fileStream += bodySplit[i];
						const buf2 = Buffer.from(fileStream, "ascii");
						const buf1 = Buffer.alloc(6);
						buf1.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);


						params[name] = {
							filename: header.substring(
								header.indexOf("filename") + 10,
								header.indexOf("\"", header.indexOf("filename") + 10),
							),
							data: Buffer.concat([buf1, buf2]).toString("ascii"),// new Blob([value]),
						};
					} else if (type === "image/gif") {

					}
				}
			} else {
				const value = bodySplit[idx + 3] || end;
				if (value === start || value === end) params[name] = "";
				else params[name] = decodeURIComponent(value);
			}
		}
	});

	return params;
};
