"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 교육용
var http_1 = __importDefault(require("http"));
var ws_1 = __importDefault(require("ws"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var nodb_1 = __importDefault(require("nodb"));
var const_1 = require("./const");
var UPLOAD_FILE_PATH = path_1.default.resolve(__dirname, const_1.UploadDir);
if (!fs_1.default.existsSync(UPLOAD_FILE_PATH))
    fs_1.default.mkdirSync(UPLOAD_FILE_PATH);
var db = nodb_1.default.getInstance();
try {
    db.createFile("block", { name: "idx", primary: true }, { name: "target", primary: true }, { name: "timestamp" })
        .then(function () { });
}
catch (e) {
    console.log(e);
}
var server = http_1.default.createServer(function (req, res) {
    var pathname = req.url || "/";
    console.log("Request for " + pathname + " received.");
    if (req.method === "GET") {
        res.writeHead(403);
        return res.end();
    }
    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/html",
    });
    if (pathname === "favicon.ico")
        return res.end();
    if (pathname === "/") {
        res.write("Welcome Test Server");
        return res.end();
    }
    // try {
    new Promise(function (resolve) {
        var params = {};
        var chunks = [];
        req.on("data", function (data) {
            chunks.push(data);
        });
        req.on("end", function () {
            var body = chunks.toString().split(/\r\n/g);
            var webKitFormBoundary = body[0];
            var webKitFormBoundaryEnded = webKitFormBoundary + "--";
            body.forEach(function (line, idx) {
                if (line === webKitFormBoundaryEnded)
                    return;
                if (line === webKitFormBoundary) {
                    var header = body[idx + 1];
                    var name_1 = header.substring(header.indexOf("name") + 6, header.indexOf("\"", header.indexOf("name") + 6));
                    var isFile = header.includes("filename");
                    if (isFile) {
                        var value = body[idx + 4] || webKitFormBoundaryEnded;
                        if (value === webKitFormBoundary || value === webKitFormBoundary)
                            params[name_1] = "";
                        else {
                            var buf = Buffer.from(value, "binary");
                            // buf = buf.slice(buf.findIndex((v) => v === 0x00), buf.length);
                            // buf.set([0xff, 0xd8, 0xff, 0x0e], 0);
                            console.log(buf);
                            params[name_1] = {
                                filename: header.substring(header.indexOf("filename") + 10, header.indexOf("\"", header.indexOf("filename") + 10)),
                                data: value, // new Blob([value]),
                            };
                        }
                    }
                    else {
                        var value = body[idx + 3] || webKitFormBoundaryEnded;
                        if (value === webKitFormBoundary || value === webKitFormBoundary)
                            params[name_1] = "";
                        else
                            params[name_1] = decodeURIComponent(value);
                    }
                }
            });
            resolve(params);
        });
    }).then(function (params) {
        try {
            if (pathname.startsWith("/upload")) {
                var file = params.file;
                var filename = Date.now() + "_" + file.filename;
                if (!file || !("filename" in file))
                    throw new Error("Typeof Exception::file");
                fs_1.default.writeFileSync(path_1.default.resolve(UPLOAD_FILE_PATH, filename), file.data);
                res.write(JSON.stringify({
                    upload: const_1.UploadDir + "/" + filename,
                }));
            }
            // 차단 리스트
            else if (pathname.startsWith("/blocklist")) {
                var idx_1 = params.idx;
                if (typeof idx_1 !== "string" || isNaN(parseInt(idx_1.toString(), 10)))
                    throw new Error("Typeof Exception::idx");
                db.select("block", function (data) { return data.idx === parseInt(idx_1.toString(), 10); })
                    .then(function (datas) {
                    res.write(JSON.stringify(datas));
                    res.end();
                })
                    .catch(function (e) {
                    throw e;
                });
            }
            // 차단 및 차단해제
            else if (pathname.startsWith("/block") || pathname.startsWith("/unblock")) {
                var idx = params.idx, target = params.target;
                if (typeof idx !== "string" || isNaN(parseInt(idx.toString(), 10)))
                    throw new Error("Typeof Exception::idx");
                if (typeof target !== "string" || isNaN(parseInt(target.toString(), 10)))
                    throw new Error("Typeof Exception::target");
                if (pathname.startsWith("/block")) {
                    db.insertData("block", {
                        idx: parseInt(idx.toString(), 10),
                        target: parseInt(target.toString(), 10),
                        timestamp: Date.now(),
                    })
                        .then(function () {
                        res.write("{}");
                        res.end();
                    })
                        .catch(function (e) {
                        throw e;
                    });
                }
                else {
                    db.deleteData("block", {
                        idx: parseInt(idx.toString(), 10),
                        target: parseInt(target.toString(), 10),
                    })
                        .then(function () {
                        res.write("{}");
                        res.end();
                    })
                        .catch(function (e) {
                        throw e;
                    });
                }
            }
            else {
                res.writeHead(404);
                res.end();
            }
            ;
        }
        catch (e) {
            console.error(e);
            res.write(JSON.stringify({
                error: e.message,
            }));
            res.end();
        }
    });
});
server.on("listening", function () {
    console.log("server listening 8443");
});
server.listen("8443");
var broadcast = function (name, message) { return sessions.forEach(function (session) { return session[2].send(JSON.stringify({ name: name, message: message })); }); };
var sessions = [];
var websocket = new ws_1.default.Server({
    port: 8444,
});
websocket.on("connection", function (socket, request) {
    var pathname = request.url || "/";
    if (pathname === "/")
        return;
    var data = pathname.split(/\//g);
    if (data.length < 3)
        return;
    var idx = parseInt(data[1], 10);
    if (isNaN(idx))
        return;
    sessions.push([idx, data[2], socket]);
    socket.on("message", function (msg) {
        console.log("Received message " + msg + " from user");
        try {
            var send = JSON.parse(msg.toString());
            switch (send.event) {
                case "message":
                    broadcast(data[2], send.message);
                    break;
            }
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on("close", function () {
        var idx = sessions.findIndex(function (v) { return v[0] === idx; });
        if (idx > -1)
            sessions.splice(idx, 1);
        broadcast(data[2], data[2] + "\uB2D8\uAED8\uC11C \uD1F4\uC7A5\uD558\uC168\uC2B5\uB2C8\uB2E4.");
    });
    broadcast(data[2], data[2] + "\uB2D8\uAED8\uC11C \uC785\uC7A5\uD558\uC168\uC2B5\uB2C8\uB2E4.");
});
websocket.on("listening", function () {
    console.log("websocket listening 8444");
});
