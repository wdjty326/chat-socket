"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsSession = void 0;
var const_1 = require("./const");
var wsSession = /** @class */ (function () {
    function wsSession() {
        this.chats = {};
        this.list = [];
    }
    wsSession.getInstance = function () {
        if (this.instance === null)
            this.instance = new wsSession();
        return this.instance;
    };
    wsSession.prototype.push = function (data) {
        this.list.push(data);
    };
    wsSession.prototype.delete = function (key) {
        var idx = this.list.findIndex(function (v) { return v[1] === key; });
        if (idx > -1)
            this.list.splice(idx, 1);
    };
    wsSession.prototype.get = function (roomid) {
        return typeof roomid === "undefined" ? __spreadArrays(this.list) : __spreadArrays(this.list).filter(function (session) { return session[0] === roomid; });
    };
    wsSession.prototype.getChats = function (roomid) {
        return __spreadArrays(this.chats[roomid]);
    };
    wsSession.prototype.broadcast = function (type, roomid, idx, name, message) {
        this.list.filter(function (session) { return session[0] === roomid; })
            .forEach(function (session) { return session[3].send(JSON.stringify({ type: type, idx: idx, name: name, message: message })); });
        if (typeof this.chats[roomid] === "undefined")
            this.chats[roomid] = [];
        this.chats[roomid].push([type, idx, name, message]);
        if (this.chats[roomid].length > const_1.MAXIMUM_CHAT_COUNT)
            this.chats[roomid].splice(0, 1);
    };
    wsSession.instance = null;
    return wsSession;
}());
exports.wsSession = wsSession;
