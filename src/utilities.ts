
// Binary search for arrays
// based on source: https://github.com/Olical/binary-search
// License: UNLICENSE https://unlicense.org/

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