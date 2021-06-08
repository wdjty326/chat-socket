export type ParameterFile = { filename: string; data: string; };
export type Parameter = {
	[key: string]: string | ParameterFile;
};
export interface Block {
	idx: number;
	target: number;
	timestamp?: number;
}

export enum WSType {
	Open = "open",
	Writing = "writing",
	Message = "message",
	UnWriting = "unwriting",
	Close = "close",
}