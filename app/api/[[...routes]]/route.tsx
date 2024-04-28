/** @jsxImportSource frog/jsx */

import React from "react";
import { Button, Frog } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { vars } from "./ui";
import { type FCUser, client } from "./client";
import { type DegenResponse } from "./types";
import { boostedChannels } from "./pill";

interface State {
	currentPage: number;
	pages: number;
	pageState: PageState;
	items: Array<Array<FCUser | undefined>>;
	totalDegen: number;
}

enum PageState {
	EMPTY,
	BEGINNING,
	MIDDLE,
	END
}

const firstRun = async (fid: number, date: Date, forceRefresh: boolean) => {
	const willRun = forceRefresh && process.env.CONFIG !== "DEV";
	const items: (FCUser | undefined)[] = willRun
		? await client(fid, date).catch((e) => {
				console.error(`client items error: ${e}`);

				throw new Error(`client items error: ${e}`);
			})
		: [];

	const totalDegen = items.reduce((acc, item) => {
		if (item) {
			const amount = item.degenValue ?? 0;

			return acc + Number(amount);
		} else {
			return acc + 0;
		}
	}, 0);

	const groupedArray = Array.from(
		{ length: Math.ceil(items.length / 10) },
		(_, index) => items.slice(index * 10, index * 10 + 10)
	);

	return {
		totalDegen,
		groupedArray
	};
};

const generateIntents = (pageState: PageState) => {
	switch (pageState) {
		case PageState.EMPTY: {
			const url = "https://warpcast.com/~/channel";

			const randomChannel =
				boostedChannels[Math.floor(Math.random() * boostedChannels.length)];

			const updatedURL = `${url}${randomChannel.toLowerCase()}`;

			return [
				<Button key={"check"} action="/check" value="check">
					Refresh
				</Button>,
				<Button.Link key={"degen-tips"} href="https://degen.tips">
					Visit degen.tips
				</Button.Link>,
				<Button.Link key={"boosted-channel"} href={updatedURL}>
					Visit random boosted channel
				</Button.Link>
			];
		}
		case PageState.BEGINNING:
			return [
				<Button key={"check"} action="/check" value="check">
					Refresh
				</Button>,
				<Button.Link
					key={"tip"}
					href="https://warpcast.com/leovido.eth/0x7d10bcc0"
				>
					Tip 🎩
				</Button.Link>,
				<Button key={"inc"} value="inc">
					→
				</Button>
			];
		case PageState.MIDDLE:
			return [
				<Button key={"check"} action="/check" value="check">
					Refresh
				</Button>,
				<Button key={"dec"} value="dec">
					←
				</Button>,
				<Button key={"inc"} value="inc">
					→
				</Button>
			];
		case PageState.END:
			return [
				<Button key={"check"} action="/check" value="check">
					Refresh
				</Button>,
				<Button.Link
					key={"tip"}
					href="https://warpcast.com/leovido.eth/0x7d10bcc0"
				>
					Tip 🎩
				</Button.Link>,
				<Button key={"pageOne"} value="pageOne">
					Page 1
				</Button>
			];
	}
};

const app = new Frog<{ State: State }>({
	initialState: {
		currentPage: 0,
		pages: 0,
		pageState: PageState.EMPTY,
		items: [],
		totalDegen: 0
	},
	imageAspectRatio: "1:1",
	assetsPath: "/",
	basePath: "/api",
	ui: { vars },
	imageOptions: {
		fonts: [
			{
				name: "Roboto",
				source: "google",
				weight: 400
			},
			{
				name: "Roboto",
				source: "google",
				weight: 700
			},
			{
				name: "Open Sans",
				source: "google",
				weight: 700
			},
			{
				name: "Open Sans",
				source: "google",
				weight: 400
			},
			{
				name: "DM Serif Display",
				source: "google"
			}
		]
	},
	hub: {
		apiUrl: "https://hubs.airstack.xyz",
		fetchOptions: {
			headers: {
				"x-airstack-hubs": process.env.AIRSTACK_API_KEY || ""
			}
		}
	}
});

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame("/", async (c) => {
	return c.res({
		image: (
			<div
				style={{
					fontFamily: "Open Sans",
					alignItems: "center",
					background: "linear-gradient(to right, #231651, #17101F)",
					backgroundSize: "100% 100%",
					display: "flex",
					flexDirection: "column",
					flexWrap: "nowrap",
					height: "100%",
					justifyContent: "center",
					textAlign: "center",
					width: "100%"
				}}
			>
				<h1
					style={{
						fontFamily: "DM Serif Display",
						fontSize: "3rem",
						color: "#D6FFF6"
					}}
				>
					Who did I tip today?
				</h1>
				<h1
					style={{
						fontFamily: "DM Serif Display",
						fontSize: "2.5rem",
						color: "#D6FFF6"
					}}
				>
					🎩 $DEGEN edition 🎩
				</h1>
				<h4 style={{ fontSize: "1.75rem", color: "#D6FFF6", fontWeight: 400 }}>
					Frame by @leovido.eth
				</h4>
			</div>
		),
		intents: [
			<Button key={"check"} action="/check" value="check">
				Check
			</Button>,
			<Button.Link
				key={"tip"}
				href="https://warpcast.com/leovido.eth/0x7d10bcc0"
			>
				Tip 🎩
			</Button.Link>,
			<Button.Link key={"degen-tips"} href="https://degen.tips">
				Visit degen.tips
			</Button.Link>
		]
	});
});

app.frame("/check", async (c) => {
	const { buttonValue, frameData, deriveState, verified } = c;
	const forceRefresh = buttonValue === "check";

	const isDevEnvironment = process.env.CONFIG === "DEV";

	if (!verified) {
		console.log(`Frame verification failed for ${frameData?.fid}`);
		return c.res({
			image: (
				<div
					style={{
						fontFamily: "Open Sans",
						alignItems: "center",
						background: "linear-gradient(to right, #231651, #17101F)",
						backgroundSize: "100% 100%",
						display: "flex",
						flexDirection: "column",
						flexWrap: "nowrap",
						height: "100%",
						justifyContent: "center",
						textAlign: "center",
						width: "100%"
					}}
				>
					<p
						style={{
							fontFamily: "Open Sans",
							fontWeight: 700,
							fontSize: 45,
							color: "#D6FFF6"
						}}
					>
						Something went wrong
					</p>
				</div>
			),
			intents: [
				<Button key={"restart"} action="/">
					Restart
				</Button>
			]
		});
	}

	const fid = frameData?.fid || 0;

	const request = await fetch(
		`https://www.degen.tips/api/airdrop2/tip-allowance?fid=${fid}`,
		{
			headers: {
				"Content-Type": "application/json",
				"Content-Encoding": "gzip"
			}
		}
	).catch((e) => {
		console.error(`degen.tips: ${e}`);

		throw new Error(`degen.tips: ${e}`);
	});

	const json: DegenResponse[] = !isDevEnvironment
		? await request.json().catch((e) => {
				console.error(`degen.tips json: ${e}`);

				throw new Error(`degen.tips json: ${e}`);
			})
		: [];

	if (json.length === 0) {
		return c.res({
			image: (
				<div
					style={{
						fontFamily: "Open Sans",
						alignItems: "center",
						background: "linear-gradient(to right, #231651, #17101F)",
						backgroundSize: "100% 100%",
						display: "flex",
						flexDirection: "column",
						flexWrap: "nowrap",
						height: "100%",
						justifyContent: "center",
						textAlign: "center",
						width: "100%"
					}}
				>
					<h1
						style={{
							fontFamily: "DM Serif Display",
							fontSize: "3rem",
							color: "#D6FFF6"
						}}
					>
						🎩 Who did I tip today? 🎩
					</h1>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center"
						}}
					>
						<h1 style={{ fontFamily: "DM Serif Display", color: "#D6FFF6" }}>
							Sorry, your FID: {fid} is not eligible
						</h1>
						<h1
							style={{
								fontFamily: "DM Serif Display",
								color: "#D6FFF6",
								marginTop: -16
							}}
						>
							for S3 DEGEN tipping
						</h1>
					</div>
					<h3 style={{ color: "#D6FFF6" }}>
						Visit https://degen.tips for more info
					</h3>
				</div>
			)
		});
	}

	const allowance =
		json.find((value) => {
			return value.tip_allowance;
		})?.tip_allowance || 0;

	const date = new Date();
	const { totalDegen: total, groupedArray: grouped } = await firstRun(
		fid,
		date,
		forceRefresh
	);

	const state = deriveState((previousState) => {
		switch (buttonValue) {
			case "dec":
				previousState.currentPage = Math.max(0, previousState.currentPage - 1);
				break;
			case "inc":
				previousState.currentPage = Math.min(
					previousState.pages - 1,
					previousState.currentPage + 1
				);
				break;
			case "pageOne":
				previousState.currentPage = 0;
				previousState.pageState = PageState.BEGINNING;
				break;
			case "refresh":
			case "check":
				previousState.totalDegen = total;
				previousState.pages = grouped.length;
				previousState.items = grouped;
				break;
			default:
				break;
		}

		if (previousState.pages === 1) {
			previousState.pageState = PageState.EMPTY;
		} else if (previousState.currentPage === 0) {
			previousState.pageState = PageState.BEGINNING;
		} else if (previousState.currentPage === previousState.pages - 1) {
			previousState.pageState = PageState.END;
		} else if (
			previousState.currentPage > 0 &&
			previousState.currentPage < previousState.pages - 1
		) {
			previousState.pageState = PageState.MIDDLE;
		}
	});

	const page = `${state.currentPage + 1}/${state.pages}`;
	const totalDegen = forceRefresh ? total : state.totalDegen;
	const groupedArray = forceRefresh ? grouped : state.items;

	return c.res({
		image: (
			<div
				style={{
					fontFamily: "Open Sans",
					alignItems: "center",
					background: "linear-gradient(to right, #231651, #17101F)",
					backgroundSize: "100% 100%",
					display: "flex",
					flexDirection: "column",
					flexWrap: "nowrap",
					height: "100%",
					justifyContent: "space-around"
				}}
			>
				<h1
					style={{
						flex: 1,
						fontFamily: "DM Serif Display",
						fontSize: "3rem",
						color: "#D6FFF6"
					}}
				>
					🎩 Who did I tip today? 🎩
				</h1>
				{state.pages > 0 && <p style={{ color: "white" }}>{page}</p>}

				{groupedArray.length > 1 && (
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-around",
							width: "50%"
						}}
					>
						{groupedArray[state.currentPage].length > 5 && (
							<>
								<div
									style={{
										display: "flex",
										flexDirection: "column"
									}}
								>
									{singlePayslipView(groupedArray, false, false, state)}
								</div>
								<div
									style={{
										display: "flex",
										flexDirection: "column"
									}}
								>
									{singlePayslipView(groupedArray, false, true, state)}
								</div>
							</>
						)}
						{groupedArray[state.currentPage].length < 6 && (
							<div
								style={{
									display: "flex",
									flexDirection: "column"
								}}
							>
								{singlePayslipView(groupedArray, true, false, state)}
							</div>
						)}
					</div>
				)}
				{groupedArray.length < 2 &&
					singlePayslipView(groupedArray, true, false, state)}
				{frameData !== undefined && groupedArray.length > 0 && (
					<div
						style={{
							display: "flex",
							flexDirection: "row",
							justifyContent: "space-around",
							alignItems: "center",
							width: "50%"
						}}
					>
						<h1
							style={{
								fontFamily: "Open Sans",
								fontWeight: 400,
								fontSize: 25,
								color: "#2CFA1F"
							}}
						>
							Today&apos;s allowance: {allowance}
						</h1>
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center"
							}}
						>
							<h1
								style={{
									fontFamily: "Open Sans",
									fontWeight: 400,
									fontSize: 25,
									color: "#2CFA1F"
								}}
							>
								REMAINING:
							</h1>
							<h1
								style={{
									fontFamily: "Open Sans",
									fontWeight: 700,
									fontSize: 35,
									color: "#2CFA1F",
									paddingLeft: 4
								}}
							>
								{`  ${Number(allowance) - totalDegen}`}
							</h1>
						</div>
					</div>
				)}
				{frameData !== undefined && groupedArray.length === 0 && (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							flex: 5,
							justifyContent: "center",
							width: "50%",
							alignItems: "center",
							alignContent: "center"
						}}
					>
						<h2 style={{ color: "#D6FFF6", fontWeight: 400 }}>
							You haven&apos;t tipped today
						</h2>
						<h2 style={{ color: "#D6FFF6", fontWeight: 400 }}>
							Tips on casts in the following channels
						</h2>
						<h2 style={{ color: "#D6FFF6", fontWeight: 400, marginTop: -16 }}>
							receive a 1.5x boost:{" "}
						</h2>
						<h2 style={{ color: "rgba(135, 206, 235, 1)", fontWeight: 700 }}>
							/farcastHER, /FarCon, /frames, /Base
						</h2>
						<h2
							style={{
								color: "rgba(135, 206, 235, 1)",
								fontWeight: 700,
								marginTop: -16
							}}
						>
							/Dev, /Design, /Frontend, /Founders
						</h2>
						<h2
							style={{
								color: "rgba(135, 206, 235, 1)",
								fontWeight: 700,
								marginTop: -16
							}}
						>
							/perl, /Product, and /Zora
						</h2>
						<p
							style={{
								fontFamily: "Open Sans",
								fontWeight: 700,
								fontSize: 25,
								color: "#2CFA1F"
							}}
						>
							Your allowance: {`${Number(allowance)}`}
						</p>
					</div>
				)}
			</div>
		),
		intents: generateIntents(state.pageState)
	});
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);

const singlePayslipView = (
	groupedArray: (FCUser | undefined)[][],
	isSingleView: boolean,
	isSecondaryView: boolean,
	state: State
): React.ReactNode => {
	const username = (username: string | undefined) => {
		if (isSingleView) {
			return username;
		} else {
			if (username && username.length > 9) {
				return `${username?.slice(0, 8)}..`;
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
			{groupedArray[state.currentPage] &&
				groupedArray[state.currentPage]
					.slice(0 + range, 5 + range)
					.map((u, index) => (
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
								>{`${10 * state.currentPage + index + range + 1}. @${username(u?.username)}`}</h2>
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
								{`${u?.degenValue}`}
							</h2>
						</div>
					))}
		</div>
	);
};
