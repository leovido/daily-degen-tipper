import { kFormatter } from "@/app/numberFormattingKs";
import { FCUser } from "./client";

export const mockItems: FCUser[] = [
	{
		username: "nimaleo",
		degenValue: "100K",

		fid: 444444
	},
	{
		username: "test",
		degenValue: "100",

		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	}
];

export const mockItemsFiveItems = [
	{
		username: "test",
		degenValue: `${Math.floor(Math.random() * 10000)}`
	},
	{
		username: "test",
		degenValue: `${Math.floor(Math.random() * 10000)}`
	},
	{
		username: "test",
		degenValue: `${Math.floor(Math.random() * 10000)}`
	},
	{
		username: "test",
		degenValue: `${Math.floor(Math.random() * 10000)}`
	},
	{
		username: "test",
		degenValue: `${Math.floor(Math.random() * 10000)}`
	}
];
