"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// 교육용
var http_1 = __importDefault(require("http"));
var ws_1 = __importDefault(require("ws"));
var fs_1 = __importDefault(require("fs"));
var nodb_1 = __importDefault(require("nodb"));
var session_1 = require("./session");
var action_1 = require("./action");
var const_1 = require("./const");
if (!fs_1.default.existsSync(const_1.UPLOAD_FILE_PATH))
    fs_1.default.mkdirSync(const_1.UPLOAD_FILE_PATH);
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
    try {
        if (req.method === "GET")
            return action_1.getAction(req, res);
        else if (req.method === "POST") {
            var chunks_1 = [];
            req.on("data", function (data) {
                chunks_1.push(data);
            });
            req.on("end", function () {
                var body = chunks_1.map(function (chunk) { return chunk.toString("utf8"); }).join("");
                action_1.postAction(req, res, body);
            });
        }
    }
    catch (e) {
        console.error(e);
        res.write(JSON.stringify({
            error: e.message,
        }));
        res.end();
    }
});
server.on("listening", function () {
    console.log("server listening 8443");
});
server.listen("8443");
var instance = session_1.wsSession.getInstance();
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
    socket.on("message", function (msg) {
        console.log("Received message " + msg + " from user");
        try {
            var send = JSON.parse(msg.toString());
            switch (send.event) {
                case "message":
                    instance.broadcast(idx, data[2], send.message);
                    break;
            }
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on("close", function () {
        instance.delete(idx);
        instance.broadcast(idx, data[2], data[2] + "\uB2D8\uAED8\uC11C \uD1F4\uC7A5\uD558\uC168\uC2B5\uB2C8\uB2E4.");
    });
    instance.push([idx, data[2], socket]);
    instance.broadcast(idx, data[2], data[2] + "\uB2D8\uAED8\uC11C \uC785\uC7A5\uD558\uC168\uC2B5\uB2C8\uB2E4.");
});
websocket.on("listening", function () {
    console.log("websocket listening 8444");
});
