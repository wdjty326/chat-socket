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
var db = nodb_1.default.getInstance();
var getAction = function (req, res) {
    var pathname = req.url;
    var search = pathname.substr(pathname.indexOf("?") + 1);
    var params = function_1.getParameter(search);
    if (pathname.startsWith("/blocklist")) {
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
};
exports.getAction = getAction;
var postAction = function (req, res, body) {
    var pathname = req.url;
    var params = function_1.postParameter(body);
    if (pathname.startsWith("/upload") && typeof params.file === "object") {
        var file = params.file;
        var filename = Date.now() + "_" + file.filename;
        if (!("filename" in file) || !file.filename.length)
            throw new Error("Typeof Exception::file");
        fs_1.default.writeFileSync(path_1.default.resolve(const_1.UPLOAD_FILE_PATH, filename), file.data);
        res.write(JSON.stringify({
            upload: const_1.UPLOAD_DIRECTORY + "/" + filename,
        }));
    }
    else {
        res.writeHead(404);
        res.end();
    }
    ;
};
exports.postAction = postAction;
