"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postParameter = exports.getParameter = void 0;
exports.getParameter = function (search) {
    var params = {};
    search
        .split("&")
        .forEach(function (s) {
        var sp = s.split("=");
        var key = sp[0];
        var value = decodeURIComponent(sp[1] || "");
        if (isNaN(parseInt(value, 10)))
            params[key] = parseInt(value, 10);
        else if (value.toLowerCase() === "true" || value.toLowerCase() === "false")
            params[key] = value.toLowerCase() === "true";
        else
            params[key] = value;
    });
    return params;
};
exports.postParameter = function (body, raw) {
    var params = {};
    var bodySplit = body.split(/\r\n/g);
    // const start = bodySplit[0];
    var boundary = bodySplit[0];
    var boundaryEof = boundary + "--";
    console.log(bodySplit[0]);
    var pos = 0;
    bodySplit.forEach(function (line, idx) {
        if (line === boundaryEof)
            return;
        if (line === boundary) {
            var header = bodySplit[idx + 1];
            var name_1 = header.substring(header.indexOf("name") + 6, header.indexOf("\"", header.indexOf("name") + 6));
            var isFile = header.includes("filename");
            if (isFile) {
                var value = bodySplit[idx + 4] || boundaryEof;
                if (value === boundary || value === boundaryEof)
                    params[name_1] = "";
                else {
                    var filename = header.substring(header.indexOf("filename") + 10, header.indexOf("\"", header.indexOf("filename") + 10));
                    var data = Buffer.alloc(0);
                    var type = bodySplit[idx + 2].substr(14);
                    if (type === "image/jpeg") {
                        var starts = Buffer.alloc(3);
                        starts.set([0xff, 0xd8, 0xff]);
                        var ends = Buffer.alloc(2);
                        ends.set([0xff, 0xd9]);
                        data = raw.slice(raw.indexOf(starts, pos), raw.indexOf(ends, pos) + 2); // new Blob([value]),
                    }
                    else if (type === "image/png") {
                        var starts = Buffer.alloc(8);
                        starts.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
                        var ends = Buffer.alloc(8);
                        ends.set([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
                        data = raw.slice(raw.indexOf(starts, pos), raw.indexOf(ends, pos) + 8); // new Blob([value]),
                    }
                    else if (type === "image/gif") {
                        var starts = Buffer.alloc(6);
                        starts.set([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
                        if (raw.indexOf(starts, pos) === -1)
                            starts.set([0x39], 4);
                        var ends = Buffer.alloc(2);
                        ends.set([0x00, 0x3b]);
                        var pos_start = raw.indexOf(starts, pos);
                        var pos_end = raw.indexOf(ends, pos) + 2;
                        do {
                            data = Buffer.concat([data, raw.slice(pos_start, pos_end)]); // new Blob([value]),
                            pos_start = pos_end; // raw.indexOf(starts, pos_end);
                            pos_end = raw.indexOf(ends, pos_end) + 2;
                        } while (pos_start !== 1);
                    }
                    params[name_1] = {
                        filename: filename,
                        data: data,
                    };
                }
            }
            else {
                var value = bodySplit[idx + 3] || boundaryEof;
                if (value === boundaryEof || value === boundaryEof)
                    params[name_1] = "";
                else
                    params[name_1] = decodeURIComponent(value);
            }
        }
        pos += line.length;
    });
    return params;
};
