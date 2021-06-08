"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsSession = void 0;
var const_1 = require("./const");
var wsSession = /** @class */ (function () {
    function wsSession() {
        this.chats = [];
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
        var idx = this.list.findIndex(function (v) { return v[0] === key; });
        if (idx > -1)
            this.list.splice(idx, 1);
    };
    wsSession.prototype.get = function () {
        return __spreadArray([], this.list);
    };
    wsSession.prototype.getChats = function () {
        return __spreadArray([], this.chats);
    };
    wsSession.prototype.broadcast = function (type, idx, name, message) {
        this.list.forEach(function (session) { return session[2].send(JSON.stringify({ type: type, idx: idx, name: name, message: message })); });
        this.chats.push([type, idx, name, message]);
        if (this.chats.length > const_1.MAXIMUM_CHAT_COUNT)
            this.chats.splice(0, 1);
    };
    wsSession.instance = null;
    return wsSession;
}());
exports.wsSession = wsSession;
