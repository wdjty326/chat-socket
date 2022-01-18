"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAction = exports.getAction = void 0;
var nodb_1 = __importDefault(require("nodb"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var function_1 = require("./function");
var const_1 = require("./const");
var session_1 = require("./session");
var db = nodb_1.default.getInstance();
exports.getAction = function (req, res) {
    var pathname = req.url;
    var search = pathname.substr(pathname.indexOf("?") + 1);
    var params = function_1.getParameter(search);
    if (pathname.startsWith("/upload/")) {
        var filePath = pathname.substr(8, pathname.indexOf("?") > -1 ? pathname.indexOf("?") : pathname.length);
        var extension = pathname.substr(filePath.lastIndexOf(".")).toLowerCase();
        var contentType = "image/jpeg";
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
        res.write(fs_1.default.readFileSync(path_1.default.resolve(const_1.UPLOAD_FILE_PATH, filePath), {
            flag: "r"
        }));
        res.end();
    }
    else if (pathname.startsWith("/check")) {
        var idx_1 = params.idx;
        if (typeof idx_1 !== "string" || isNaN(parseInt(idx_1.toString(), 10)))
            throw new Error("Typeof Exception::idx");
        var checked = session_1.wsSession.getInstance()
            .get()
            .findIndex(function (data) { return data[1] === parseInt(idx_1.toString(), 10); });
        res.write(JSON.stringify({
            checked: checked !== -1,
        }));
        res.end();
    }
    else if (pathname.startsWith("/chatlist")) {
        var roomid = params.roomid;
        if (typeof roomid !== "string" || isNaN(parseInt(roomid.toString(), 10)))
            throw new Error("Typeof Exception::roomid");
        res.write(JSON.stringify(session_1.wsSession.getInstance()
            .getChats(parseInt(roomid, 10)).map(function (data) { return ({ type: data[0], idx: data[1], name: data[2], message: data[3] }); })));
        res.end();
    }
    else if (pathname.startsWith("/userlist")) {
        var roomid = params.roomid;
        if (roomid) {
            if (typeof roomid !== "string" || isNaN(parseInt(roomid.toString(), 10)))
                throw new Error("Typeof Exception::roomid");
            res.write(JSON.stringify(session_1.wsSession.getInstance().get(parseInt(roomid, 10)).map(function (data) { return ({ idx: data[1], name: data[2] }); })));
        }
        else
            res.write(JSON.stringify(session_1.wsSession.getInstance().get().map(function (data) { return ({ idx: data[1], name: data[2] }); })));
        res.end();
    }
    else if (pathname.startsWith("/blocklist")) {
        var idx_2 = params.idx;
        if (typeof idx_2 !== "string" || isNaN(parseInt(idx_2.toString(), 10)))
            throw new Error("Typeof Exception::idx");
        db.select("block", function (data) { return data.idx === parseInt(idx_2.toString(), 10); })
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
};
exports.postAction = function (req, res, raw) {
    var pathname = req.url;
    var body = raw.toString();
    var contentType = req.headers["content-type"] || "";
    if (!contentType.startsWith("multipart/form-data")) {
        res.write(JSON.stringify({
            error: "Content-Type::Multipart/form-data",
        }));
        return res.end();
    }
    var params = function_1.postParameter(body, raw);
    if (pathname.startsWith("/upload") && typeof params.file === "object") {
        var file = params.file;
        var filename = Date.now() + "_" + file.filename;
        if (!("filename" in file) || !file.filename.length)
            throw new Error("Typeof Exception::file");
        fs_1.default.writeFileSync(path_1.default.resolve(const_1.UPLOAD_FILE_PATH, filename), file.data);
        res.write(JSON.stringify({
            upload: const_1.UPLOAD_DIRECTORY + "/" + filename,
        }));
        res.end();
    }
    else {
        res.writeHead(404);
        res.end();
    }
    ;
};
