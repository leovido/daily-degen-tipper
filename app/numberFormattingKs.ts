export const kFormatter = (numStr: string) => {
	const num = Number(numStr);
	let x;
	if (num % 1000 === 0) {
		x = (Math.abs(num) / 1000).toFixed(0);
		return Math.abs(num) > 999 ? x + "K" : Math.abs(num).toString();
	} else if (num % 100 === 0) {
		x = (Math.abs(num) / 1000).toFixed(1);
		return Math.abs(num) > 999 ? x + "K" : Math.abs(num).toString();
	} else if (num % 10 === 0) {
		x = (Math.abs(num) / 1000).toFixed(2);
		return Math.abs(num) > 999 ? x + "K" : Math.abs(num).toString();
	} else {
		x = Math.abs(num);
		return x.toString();
	}
};
