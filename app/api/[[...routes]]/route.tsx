/** @jsxImportSource frog/jsx */

import React from "react";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { vars } from "./ui";
import { type FCUser, client } from "./client";
import { type DegenResponse } from "./types";
import { boostedChannels } from "./pill";
import { kv } from "@vercel/kv";

interface State {
	currentPage: number;
	pages: number;
	pageState: PageState;
	isSearchMode: boolean;
	items: Array<Array<FCUser | undefined>>;
	itemsLength: number;
	totalDegen: number;
	currentFIDSearch: number;
}

enum PageState {
	EMPTY,
	BEGINNING,
	MIDDLE,
	END
}

const initialState = {
	currentPage: 0,
	pages: 0,
	isSearchMode: false,
	pageState: PageState.EMPTY,
	items: [],
	itemsLength: 0,
	totalDegen: 0
};

const firstRun = async (fid: number, date: Date, forceRefresh: boolean) => {
	const willRun = forceRefresh && process.env.CONFIG !== "DEV";
	if (!willRun) {
		const response = await fetchExistingItems(fid).catch((e) => {
			console.error(`fetchExistingItems error: ${e}`);

			throw new Error(`fetchExistingItems error: ${e}`);
		});

		return {
			totalDegen: response.totalDegen,
			groupedArray: response.items
		};
	}
	const items: (FCUser | undefined)[] = willRun
		? await client(fid, date).catch((e) => {
				console.error(`client items error: ${e}`);

				throw new Error(`client items error: ${e}`);
			})
		: [];

	const totalDegen = items.reduce((acc, item) => {
		if (item) {
			const amount = item.tipAmount ?? 0;

			return acc + Number(amount);
		} else {
			return acc + 0;
		}
	}, 0);

	const groupedArray = Array.from(
		{ length: Math.ceil(items.length / 10) },
		(_, index) => items.slice(index * 10, index * 10 + 10)
	);

	if (willRun) {
		await kv.set(`${fid}-degen`, JSON.stringify({ groupedArray }));
	}

	return {
		totalDegen,
		groupedArray
	};
};

const fetchExistingItems = async (fid: number) => {
	const responseItems: { groupedArray: (FCUser | undefined)[][] } | null =
		await kv.get(`${fid}-degen`);

	const items = responseItems?.groupedArray ?? [];

	const totalDegen = items.flat().reduce((acc, item) => {
		if (item) {
			const amount = item.tipAmount ?? 0;

			return acc + Number(amount);
		} else {
			return acc + 0;
		}
	}, 0);

	return {
		totalDegen,
		items
	};
};

const textInput = () => {
	return (
		<TextInput key={"text-input"} placeholder="Search any FID, e.g. 203666" />
	);
};

const generateIntents = (
	pageState: PageState,
	isSearchMode: boolean,
	itemsLength: number
) => {
	switch (pageState) {
		case PageState.EMPTY: {
			const url = "https://warpcast.com/~/channel";

			const randomChannel =
				boostedChannels[Math.floor(Math.random() * boostedChannels.length)];

			const updatedURL = `${url}${randomChannel.toLowerCase()}`;

			return [
				isSearchMode ? (
					<Button key={"restart"} action="/" value="restart">
						Restart
					</Button>
				) : (
					<Button key={"check"} action="/check" value="check">
						Refresh
					</Button>
				),
				<Button.Link key={"degen-tips"} href="https://degen.tips">
					Visit degen.tips
				</Button.Link>,
				<Button.Link key={"boosted-channel"} href={updatedURL}>
					Visit random boosted channel
				</Button.Link>,
				tipButton()
			];
		}
		case PageState.BEGINNING:
			return [
				isSearchMode ? (
					<Button key={"restart"} action="/" value="restart">
						Restart
					</Button>
				) : (
					<Button key={"check"} action="/check" value="check">
						Refresh
					</Button>
				),
				shareButton(),
				tipButton(),
				itemsLength > 10 && (
					<Button key={"inc"} value="inc">
						→
					</Button>
				)
			];
		case PageState.MIDDLE:
			return [
				isSearchMode ? (
					<Button key={"restart"} action="/" value="restart">
						Restart
					</Button>
				) : (
					<Button key={"check"} action="/check" value="check">
						Refresh
					</Button>
				),
				tipButton(),
				<Button key={"dec"} value="dec">
					←
				</Button>,
				<Button key={"inc"} value="inc">
					→
				</Button>
			];
		case PageState.END:
			return [
				isSearchMode ? (
					<Button key={"restart"} action="/" value="restart">
						Restart
					</Button>
				) : (
					<Button key={"check"} action="/check" value="check">
						Refresh
					</Button>
				),
				shareButton(),
				tipButton(),
				<Button key={"pageOne"} value="pageOne">
					Page 1
				</Button>
			];
	}
};

const app = new Frog<{ State: State }>({
	verify: process.env.CONFIG === "PROD",
	initialState: initialState,
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

const shareButton = () => {
	return (
		<Button.Redirect
			key={"share"}
			location="https://warpcast.com/~/compose?text=Check%20who%20you%20tipped%21%0A%0AFrame%20by%20@leovido.eth&embeds[]=https%3A%2F%2Fdegen-me.leovido.xyz%2Fapi"
		>
			Share
		</Button.Redirect>
	);
};

const tipButton = () => {
	return (
		<Button.Link key={"tip"} href="https://warpcast.com/leovido.eth/0x9812de51">
			Tip @leovido.eth
		</Button.Link>
	);
};

app.frame("/", async (c) => {
	const { deriveState } = c;

	deriveState((previousState) => {
		previousState.items = [];
	});

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
			textInput(),
			<Button key={"check"} action="/check" value="myTips">
				My tips
			</Button>,
			// shareButton(),
			tipButton(),
			<Button key={"check"} action="/check" value="check">
				🔍
			</Button>
		]
	});
});

app.frame("/check", async (c) => {
	const { buttonValue, frameData, deriveState, verified, inputText } = c;
	const forceRefresh = buttonValue === "myTips" || buttonValue === "check";

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

	const searchFID =
		inputText && buttonValue === "check" ? Number(inputText) : 0;
	const currentFID = frameData?.fid || 0;

	const fid = searchFID > 0 ? searchFID : currentFID;
	const state2 = deriveState((previousState) => {
		if (forceRefresh) {
			previousState.currentFIDSearch = searchFID > 0 ? searchFID : currentFID;
		}
	});
	const request = await fetch(
		`https://www.degentip.me/api/get_allowance?fid=${fid}`,
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

	const json: DegenResponse = !isDevEnvironment
		? await request.json().catch((e) => {
				console.error(`degen.tips json: ${e}`);

				throw new Error(`degen.tips json: ${e}`);
			})
		: [];

	const allowance = json.allowance.tip_allowance;

	const date = new Date();
	const { totalDegen: total, groupedArray: grouped } = await firstRun(
		state2.currentFIDSearch,
		date,
		forceRefresh
	);

	const state = deriveState((previousState) => {
		if (searchFID !== 0) {
			previousState.isSearchMode = true;
		} else {
			previousState.isSearchMode = false;
		}
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
			case "myTips":
			case "check":
				previousState.totalDegen = total;
				previousState.pages = grouped.length;
				previousState.currentFIDSearch = searchFID > 0 ? searchFID : currentFID;
				// previousState.items = grouped;
				break;
			default:
				break;
		}

		if (previousState.pages === 0) {
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
	const groupedArray = grouped;

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

				{groupedArray.length > 0 && (
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
		intents: generateIntents(
			state.pageState,
			state.isSearchMode,
			state.pages * 10
		)
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
								{`${u?.tipAmount}`}
							</h2>
						</div>
					))}
		</div>
	);
};
