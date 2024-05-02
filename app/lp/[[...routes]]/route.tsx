/** @jsxImportSource frog/jsx */

import React from "react";
import { Button, Frog, TextInput } from "frog";
import { devtools } from "frog/dev";
import { handle } from "frog/next";
import { serveStatic } from "frog/serve-static";
import { vars } from "../../api/[[...routes]]/ui";
import { client, fetchUserInfo } from "./neynarClient";
import { FCUser } from "@/app/api/[[...routes]]/client";
import { Image } from "../../api/[[...routes]]/ui";

interface State {
	currentPage: number;
	pages: number;
	pageState: PageState;
	isSearchMode: boolean;
	items: Array<Array<FCUser | undefined>>;
}

const initialState = {
	currentPage: 0,
	isSearchMode: false
};

enum PageState {
	EMPTY,
	BEGINNING,
	MIDDLE,
	END
}

const backgroundColor = "#F5F5DC";
const foregroundColor = "#8E021f";
const bodyColor = "#6B4E31";
const footerColor = "#593E23";

const app = new Frog<{ State: State }>({
	initialState: initialState,
	imageAspectRatio: "1:1",
	assetsPath: "/",
	basePath: "/lp",
	ui: { vars },
	imageOptions: {
		fonts: [
			{
				name: "Montserrat",
				source: "google",
				weight: 400
			},
			{
				name: "Roboto Slab",
				source: "google",
				weight: 400
			},
			{
				name: "Montserrat",
				source: "google",
				weight: 700
			},
			{
				name: "Open Sans",
				source: "google"
			},
			{
				name: "Lato",
				source: "google",
				weight: 400
			},
			{
				name: "Lato",
				source: "google",
				weight: 700
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

app.frame("/check", async (c) => {
	const { buttonValue, frameData, deriveState, verified, inputText } = c;
	const forceRefresh = buttonValue === "myTips" || buttonValue === "check";

	const searchFID =
		inputText && buttonValue === "check" ? Number(inputText) : 0;
	const currentFID = frameData?.fid || 0;
	const fid = searchFID > 0 ? searchFID : currentFID;

	if (!verified) {
		console.log(`Frame verification failed for ${frameData?.fid}`);
		return c.res({
			image: (
				<div
					key={"unverified-div"}
					style={{
						fontFamily: "Open Sans",
						alignItems: "center",
						backgroundColor,
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
							color: foregroundColor
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

	const fetchAllowance = await fetch(
		`https://farcaster.dep.dev/lp/tips/${fid}`,
		{
			headers: {
				"Content-Type": "application/json",
				"Content-Encoding": "gzip"
			}
		}
	).catch((e) => {
		console.error(`fetchAllowance: ${e}`);

		throw new Error(`fetchAllowance: ${e}`);
	});

	const { allowance: allowanceResponse, used } = await fetchAllowance
		.json()
		.catch((e) => {
			console.error(`fetchAllowance: ${e}`);

			throw new Error(`allowance: ${e}`);
		});

	if (allowanceResponse === 0) {
		return c.res({
			image: (
				<div
					style={{
						fontFamily: "Roboto Slab",
						alignItems: "center",
						backgroundColor,
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
							color: foregroundColor
						}}
					>
						🍖 Who did I tip today? 🍖
					</h1>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center"
						}}
					>
						<h1 style={{ fontFamily: "Roboto Slab", color: foregroundColor }}>
							Sorry, FID: {fid} is not eligible
						</h1>
						<h1
							style={{
								fontFamily: "Robot Slab",
								color: foregroundColor,
								marginTop: -16
							}}
						>
							for HAM tipping
						</h1>
					</div>
					<h3 style={{ color: foregroundColor }}>
						Visit https://based.thelp.xyz for more info
					</h3>
				</div>
			),
			intents: [
				<Button key={"restart"} action="/" value={"restart"}>
					Restart
				</Button>,
				<Button.Link key={"visit-lp"} href="https://based.thelp.xyz">
					Website
				</Button.Link>
			]
		});
	}

	const date = new Date();

	const { pfpURL, username } = await fetchUserInfo(fid);
	const { groupedArray: grouped } = await firstRun(fid, date, forceRefresh);

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
			case "check":
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
	const allowance = Math.trunc(allowanceResponse);
	const groupedArray = forceRefresh ? grouped : state.items;
	const remainingHam = allowance - used;

	return c.res({
		image: (
			<div
				style={{
					fontFamily: "Roboto Slab",
					fontWeight: 700,
					alignItems: "center",
					background: `linear-gradient(to bottom, #FEBE81, ${backgroundColor})`,
					backgroundSize: "100% 100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-around",
					flexWrap: "nowrap",
					height: "100%",
					textAlign: "center",
					width: "100%"
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center"
					}}
				>
					<Image
						borderRadius={"20"}
						src={pfpURL}
						width={"40"}
						height={"40"}
					></Image>
					<h1
						style={{
							fontSize: 55,
							color: foregroundColor,
							padding: 8
						}}
					>
						@{username}
					</h1>
				</div>

				{state.pages > 0 && <p style={{ color: "black" }}>{page}</p>}

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
									{singlePayslipView(
										groupedArray,
										false,
										false,
										state.currentPage
									)}
								</div>
								<div
									style={{
										display: "flex",
										flexDirection: "column"
									}}
								>
									{singlePayslipView(
										groupedArray,
										false,
										true,
										state.currentPage
									)}
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
								{singlePayslipView(
									groupedArray,
									true,
									false,
									state.currentPage
								)}
							</div>
						)}
					</div>
				)}

				{frameData !== undefined && groupedArray.length > 0 && (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center"
						}}
					>
						<p
							style={{
								fontSize: "1.8rem",
								color: footerColor,
								fontFamily: "Lato"
							}}
						>
							TOTAL🍖: {allowance} - REMAINING: {`${remainingHam}`}
						</p>
					</div>
				)}
				{frameData !== undefined && groupedArray.length === 0 && (
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							alignItems: "center",
							fontFamily: "Montserrat"
						}}
					>
						<p style={{ fontSize: 25, color: foregroundColor }}>
							You haven&apos;t tipped 🍖 today
						</p>
						<p
							style={{
								fontSize: 25,
								fontWeight: 700,
								color: foregroundColor,
								fontFamily: "Roboto Slab"
							}}
						>
							Your allowance: {allowance} 🍖
						</p>
					</div>
				)}
			</div>
		),
		intents: generateIntents(state.pageState, state.isSearchMode)
	});
});

app.frame("/", async (c) => {
	const { deriveState } = c;

	deriveState((previousState) => {
		previousState.items = [];
	});

	return c.res({
		image: (
			<div
				style={{
					fontFamily: "Roboto Slab",
					alignItems: "center",
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
				<Image height={"100%"} src="/ham-frame.png"></Image>
			</div>
		),
		intents: [
			textInput(),
			<Button key={"check"} action="/check" value="myTips">
				My tips
			</Button>,
			// shareButton(),
			tipButton(),
			<Button.Link key={"ham-fun"} href="https://ham.fun">
				ham.fun
			</Button.Link>,
			<Button key={"check"} action="/check" value="check">
				🔍
			</Button>
		]
	});
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);

const singlePayslipView = (
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
						fontFamily: "Lato",
						color: bodyColor
					}}
				>{`${10 * page + index + range + 1}. @${username(u?.username)}`}</h2>
				<h2
					key={index}
					style={{
						color: "rgb(0,0,0, 0.7)",
						fontWeight: 200,
						marginTop: -20,
						fontFamily: "Lato"
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
					fontFamily: "Lato",
					color: bodyColor,
					paddingLeft: 16
				}}
			>
				{`${u?.tipAmount}`}
			</h2>
		</div>
	));
};

const tipButton = () => {
	return (
		<Button.Link key={"tip"} href="https://warpcast.com/leovido.eth/0x3dacd8c6">
			Tip here
		</Button.Link>
	);
};

const firstRun = async (fid: number, date: Date, forceRefresh: boolean) => {
	const willRun = forceRefresh && process.env.CONFIG !== "DEV";
	const items: (FCUser | undefined)[] = willRun
		? await client(fid, date).catch((e) => {
				console.error(`client items error: ${e}`);

				throw new Error(`client items error: ${e}`);
			})
		: [];

	const totalHam = items.reduce((acc, item) => {
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

	return {
		totalHam,
		groupedArray
	};
};

const textInput = () => {
	return (
		<TextInput key={"text-input"} placeholder="Search any FID, e.g. 203666" />
	);
};

const generateIntents = (pageState: PageState, isSearchMode: boolean) => {
	switch (pageState) {
		case PageState.EMPTY: {
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
				<Button.Link key={"ham-fun"} href="https://ham.fun">
					ham.fun
				</Button.Link>,
				<Button.Link
					key={"l3-news"}
					href="https://warpcast.com/deployer/0x388a831b"
				>
					L3 🍖 news
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
				<Button key={"inc"} value="inc">
					→
				</Button>
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

const shareButton = () => {
	return (
		<Button.Redirect
			key={"share"}
			location="https://warpcast.com/~/compose?text=Check%20who%20you%20ham%20tipped%21%0A%0AFrame%20by%20@leovido.eth&embeds[]=https%3A%2F%2Fham-me.leovido.xyz%2Flp"
		>
			Share
		</Button.Redirect>
	);
};
