
// Binary search for arrays
// based on source: https://github.com/Olical/binary-search
// License: UNLICENSE https://unlicense.org/

import { ApiError as SerialApiError } from "./serial";
import { ApiError as RpcApiError } from "./rpc";
import { ApiError as FahApiError } from "./fhapi";
import { ApiError as ScriptingApiError } from "./scripting";

export function binaryIndexOf(list: Array<number>, item: number): number {
	let min = 0;
	let max = list.length - 1;
	let guess: number;

	if (item < list[0]) {
		return 0;
	} else if (item > list[max]) {
		return max;
	}

	var bitwise = (max <= 2147483647) ? true : false;
	if (bitwise) {
		while (min <= max) {
			guess = (min + max) >> 1;
			if (list[guess] === item) { return guess; }
			else {
				if (list[guess] < item) { min = guess + 1; }
				else { max = guess - 1; }
			}
		}
	} else {
		while (min <= max) {
			guess = Math.floor((min + max) / 2);
			if (list[guess] === item) { return guess; }
			else {
				if (list[guess] < item) { min = guess + 1; }
				else { max = guess - 1; }
			}
		}
	}

	return min;
}


export function handleRequestError(e: unknown, log: boolean = true): string {
	let errorString = '';
	let onlyLogError = '';
	let error;
	if (e instanceof SerialApiError) {
		error = (e as SerialApiError);		
	} else if (e instanceof RpcApiError) {
		error = (e as RpcApiError);
	} else if (e instanceof FahApiError) {
		error = (e as FahApiError);
	} else if ((e instanceof ScriptingApiError)) {
		error = (e as ScriptingApiError);
	}
	if (error) {
		errorString = `Request error ${error.request.method} - '${error.url}': ${error.status} - ${error.statusText}`;
	}
	
	if (e instanceof Error) {
		errorString = `Request error: ${e.message}`;
		if (e.stack) {
			onlyLogError = `\nStacktrace:\n${e.stack}`;
		}
	} else {
		errorString = `Unknown error during request: ${e}`;
	}
	if (log) {
		console.error(errorString + onlyLogError);
	}
	return errorString;
}