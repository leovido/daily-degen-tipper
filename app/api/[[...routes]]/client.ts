import { neynarClient } from "@/app/client";
import { isWithinTimeRange } from "@/app/helper";
import { kFormatter } from "@/app/numberFormattingKs";

export interface FCUser {
	username: string;
	tipAmountFormatted?: string;
	tipAmount?: string;
	fid: number;
}

export const client = async (
	fid: number,
	date: Date
): Promise<(FCUser | undefined)[]> => {
	if (process.env.CONFIG === "DEV") {
		console.log("making a request...");
	}
	const allCasts = await neynarClient.fetchAllCastsCreatedByUser(fid, {
		limit: 100
	});
	const filteredCasts = allCasts.result.casts
		.filter((cast) => {
			return isWithinTimeRange(date, cast.timestamp);
		})
		.map((cast) => {
			const pattern = /(\b\d+) \$DEGEN\b/i;
			const match = cast.text.match(pattern);

			if (match !== null) {
				const extractDegenString = match[1];
				const formatted = kFormatter(extractDegenString);
				return {
					tipAmountFormatted: formatted || "",
					tipAmount: extractDegenString || "",
					author: cast.parentAuthor.fid || ""
				};
			}
		})
		.filter((value) => {
			return value !== undefined;
		})
		.map(async (value) => {
			if (value) {
				const response = await neynarClient.fetchBulkUsers([
					Number(value.author)
				]);

				const user = response.users.find((user) => {
					return user.username;
				});

				const val: FCUser = {
					username: user?.username || "",
					tipAmountFormatted: value?.tipAmountFormatted,
					tipAmount: value?.tipAmount || "",
					fid: user?.fid || 0
				};

				return val;
			}
		})
		.map(async (user) => {
			const u: FCUser | undefined = await user;

			return u;
		});

	const requestUser = await Promise.all(filteredCasts);

	return requestUser;
};
