import React from "react";
import { FCUser } from "./api/[[...routes]]/client";

export const singlePayslipView = (
	groupedArray: (FCUser | undefined)[][],
	isSingleView: boolean,
	isSecondaryView: boolean,
	page: number
): React.ReactNode => {
	const username = (username: string | undefined) => {
		if (isSingleView) {
			return username || "";
		} else {
			if (username && username.length > 9) {
				return `${username.slice(0, 8)}..`;
			}
			return username?.slice(0, 8) || "";
		}
	};
	const range = isSecondaryView ? 5 : 0;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: isSingleView ? 500 : 320,
				paddingLeft: 16,
				paddingRight: 16
			}}
		>
			{groupedArray[page] && mappedView(groupedArray, page, range, username)}
		</div>
	);
};

const mappedView = (
	groupedArray: (FCUser | undefined)[][],
	page: number,
	range: number,
	username: (username: string | undefined) => string
) => {
	const pageArray = groupedArray[page];
	const value = pageArray
		? pageArray.slice(0 + range, 5 + range).filter((x) => x !== undefined)
		: [];

	return value.map((u, index) => (
		<div
			key={`grouped-div-${index}`}
			style={{
				display: "flex",
				flexDirection: "row",
				justifyContent: "space-between",
				fontSize: 12,
				color: "#38BDF8"
			}}
		>
			<div style={{ display: "flex", flexDirection: "column" }}>
				<h2
					key={index}
					style={{
						fontWeight: 400,
						fontSize: 25,
						fontFamily: "Open Sans"
					}}
				>{`${10 * page + index + range + 1}. @${username(u?.username)}`}</h2>
				<h2
					key={index}
					style={{
						color: "#D6FFF6",
						fontWeight: 400,
						marginTop: -20
					}}
				>
					{`${u?.fid}`}
				</h2>
			</div>
			<h2
				key={index}
				style={{
					fontWeight: 700,
					alignItems: "center",
					fontSize: 35,
					fontFamily: "Roboto",
					color: "#c7ffbf",
					paddingLeft: 16
				}}
			>
				{`${u?.tipAmount}`}
			</h2>
		</div>
	));
};
