"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postParameter = exports.getParameter = void 0;
var getParameter = function (search) {
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
exports.getParameter = getParameter;
var postParameter = function (body) {
    var params = {};
    var bodySplit = body.split(/\r\n/g);
    var start = bodySplit[0];
    var end = start + "--";
    bodySplit.forEach(function (line, idx) {
        if (line === end)
            return;
        if (line === start) {
            var header = bodySplit[idx + 1];
            var name_1 = header.substring(header.indexOf("name") + 6, header.indexOf("\"", header.indexOf("name") + 6));
            var isFile = header.includes("filename");
            if (isFile) {
                var value = bodySplit[idx + 4] || end;
                if (value === start || value === end)
                    params[name_1] = "";
                else {
                    var fileStream = "";
                    for (var i = idx + 5; bodySplit[i] !== start && bodySplit[i] !== end; i++)
                        fileStream += bodySplit[i];
                    var type = bodySplit[idx + 2].substr(14);
                    console.log(type, bodySplit[idx + 5]);
                    if (type === "image/jpeg") {
                    }
                    else if (type === "image/png") {
                        var fileStream_1 = "";
                        for (var i = idx + 5; bodySplit[i] !== start && bodySplit[i] !== end; i++)
                            fileStream_1 += bodySplit[i];
                        var buf2 = Buffer.from(fileStream_1, "ucs2");
                        var buf1 = Buffer.alloc(6);
                        buf1.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
                        params[name_1] = {
                            filename: header.substring(header.indexOf("filename") + 10, header.indexOf("\"", header.indexOf("filename") + 10)),
                            data: Buffer.concat([buf1, buf2]).toString("ucs2"), // new Blob([value]),
                        };
                    }
                    else if (type === "image/gif") {
                    }
                }
            }
            else {
                var value = bodySplit[idx + 3] || end;
                if (value === start || value === end)
                    params[name_1] = "";
                else
                    params[name_1] = decodeURIComponent(value);
            }
        }
    });
    return params;
};
exports.postParameter = postParameter;
