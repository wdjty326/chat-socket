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
var interface_1 = require("./interface");
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
                var raw = Buffer.concat(chunks_1);
                // const body = raw.toString("binary"); // Buffer.from(Buffer.concat(chunks), "utf8");
                action_1.postAction(req, res, raw);
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
    if (data.length < 4)
        return;
    var roomid = parseInt(data[1], 10);
    var idx = parseInt(data[2], 10);
    var name = data[3];
    if (isNaN(roomid) || isNaN(idx))
        return;
    socket.on("message", function (msg) {
        console.log("Received message " + msg + " from user");
        try {
            var send = JSON.parse(msg.toString());
            switch (send.event) {
                case interface_1.WSType.Message:
                    instance.broadcast(interface_1.WSType.Message, roomid, idx, name, send.message);
                    break;
                default:
                    instance.broadcast(send.event, roomid, idx, name, "");
                    break;
            }
        }
        catch (e) {
            console.error(e);
        }
    });
    socket.on("close", function () {
        instance.delete(idx);
        instance.broadcast(interface_1.WSType.Close, roomid, idx, name, name + "\uB2D8\uAED8\uC11C \uD1F4\uC7A5\uD558\uC168\uC2B5\uB2C8\uB2E4.");
    });
    instance.push([roomid, idx, name, socket]);
    instance.broadcast(interface_1.WSType.Open, roomid, idx, name, name + "\uB2D8\uAED8\uC11C \uC785\uC7A5\uD558\uC168\uC2B5\uB2C8\uB2E4.");
});
websocket.on("listening", function () {
    console.log("websocket listening 8444");
});
