"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var ws_1 = __importDefault(require("ws"));
var nodb_1 = __importDefault(require("nodb"));
var db = nodb_1.default.getInstance();
try {
    db.createFile("block", { name: "idx", primary: true }, { name: "target" }, { name: "timestamp" });
}
catch (e) { }
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
        var params_1 = {};
        var search = pathname.substr(pathname.indexOf("?") + 1);
        search
            .split("&")
            .forEach(function (s) {
            var sp = s.split("=");
            var key = sp[0];
            var value = decodeURIComponent(sp[1] || "");
            if (isNaN(parseInt(value, 10)))
                params_1[key] = parseInt(value, 10);
            else if (value.toLowerCase() === "true" || value.toLowerCase() === "false")
                params_1[key] = value.toLowerCase() === "true";
            else
                params_1[key] = value;
        });
        if (pathname.startsWith("/upload")) {
            // req.on("data", (chunk) => {
            // 	fs.writeFileSync("")
            // });
        }
        else if (pathname.startsWith("/block")) {
        }
        else if (pathname.startsWith("/unblock")) {
        }
        throw new Error("Not Found");
    }
    catch (e) {
        res.write(JSON.stringify({
            error: e.message,
        }));
    }
    finally {
        res.end();
    }
});
server.on("listening", function () {
    console.log("server listening 8443");
});
server.listen("8443");
var websocket = new ws_1.default.Server({
    port: 8444,
});
websocket.on("connection", function (socket, request) {
    socket.on("open", function () {
        console.log("" + request.socket.address());
    });
    socket.on("message", function (msg) {
        console.log("Received message " + msg + " from user");
        try {
            var send = JSON.parse(msg.toString());
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
        }
        catch (e) { }
    });
});
websocket.on("listening", function () {
    console.log("websocket listening 8444");
});
