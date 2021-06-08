"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAXIMUM_CHAT_COUNT = exports.UPLOAD_FILE_PATH = exports.UPLOAD_DIRECTORY = void 0;
var path_1 = __importDefault(require("path"));
exports.UPLOAD_DIRECTORY = "upload";
exports.UPLOAD_FILE_PATH = path_1.default.resolve(__dirname, exports.UPLOAD_DIRECTORY);
exports.MAXIMUM_CHAT_COUNT = 100;
