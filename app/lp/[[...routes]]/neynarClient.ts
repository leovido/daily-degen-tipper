import { neynarClient } from "@/app/client";
import { isWithinTimeRangeLP } from "@/app/helper";
import { kFormatter } from "@/app/numberFormattingKs";

const castWithMatchedHam = (author: string, castText: string) => {
	const pattern = /(🍖)\s*x?\s*(\d+)/;
	const match = castText.match(pattern);

	if (match !== null) {
		const amount = Number(match[2]) * 10;
		const formatted = kFormatter(amount.toString());

		return {
			hamValueFormatted: formatted,
			hamValue: `${amount}`,
			author
		};
	}
};

export const fetchUserInfo = async (fid: number) => {
	const result = await neynarClient.fetchBulkUsers([fid]);
	const currentUser = result.users.find((user) => {
		return user;
	});
	return {
		pfpURL: currentUser?.pfp_url || "",
		username: currentUser?.username || ""
	};
};

export const client = async (fid: number, date: Date) => {
	const fetchAllCastsResult = await neynarClient.fetchAllCastsCreatedByUser(
		fid,
		{
			limit: 100
		}
	);
	const filteredAndFormattedCasts = fetchAllCastsResult.result.casts
		.filter((cast) => isWithinTimeRangeLP(date, cast.timestamp))
		.map((cast) => {
			return castWithMatchedHam(cast.parentAuthor.fid || "", cast.text);
		})
		.filter((cast) => cast !== undefined);
	const usersInfo = await Promise.all(
		filteredAndFormattedCasts.map(async (cast) => {
			if (!cast) return;
			const response = await neynarClient.fetchBulkUsers([Number(cast.author)]);
			const user = response.users.find((user) => user.username);
			return {
				username: user?.username || "",
				tipAmountFormatted: cast.hamValueFormatted,
				tipAmount: cast.hamValue,
				fid: user?.fid || 0
			};
		})
	);
	// Filter out any undefined values after async operations
	return usersInfo.filter((user) => user !== undefined);
};
