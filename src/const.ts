import path from "path";
import ws from "ws";

export const UPLOAD_DIRECTORY = "upload";
export const UPLOAD_FILE_PATH = path.resolve(__dirname, UPLOAD_DIRECTORY);

export const SOCKET_SESSION: Array<[number, string, ws]> = [];
