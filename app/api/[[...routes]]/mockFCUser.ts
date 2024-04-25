import { kFormatter } from "@/app/numberFormattingKs";

export const mockItems = [
	{
		username: "nimaleo",
		degenValue: "100K",

		fid: "444444"
	},
	{
		username: "test",
		degenValue: "100",

		fid: `${Math.floor(Math.random() * 10000).toFixed(0)}`
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: `${Math.floor(Math.random() * 10000).toFixed(0)}`
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: `${Math.floor(Math.random() * 10000).toFixed(0)}`
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: `${Math.floor(Math.random() * 10000).toFixed(0)}`
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: `${Math.floor(Math.random() * 10000).toFixed(0)}`
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		timestamp: "09:00"
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		timestamp: "09:00"
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: `${Math.floor(Math.random() * 10000).toFixed(0)}`
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: `${Math.floor(Math.random() * 10000).toFixed(0)}`
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: `${Math.floor(Math.random() * 10000).toFixed(0)}`
	},
	{
		username: "test",
		degenValue: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: `${Math.floor(Math.random() * 10000).toFixed(0)}`
	}
];

export const mockItemsFiveItems = [
	{
		username: "test",
		degenValue: `${Math.floor(Math.random() * 10000).toFixed(0)}`,
		timestamp: "09:00"
	},
	{
		username: "test",
		degenValue: `${Math.floor(Math.random() * 10000).toFixed(0)}`,
		timestamp: "09:00"
	},
	{
		username: "test",
		degenValue: `${Math.floor(Math.random() * 10000).toFixed(0)}`,
		timestamp: "09:00"
	},
	{
		username: "test",
		degenValue: `${Math.floor(Math.random() * 10000).toFixed(0)}`,
		timestamp: "09:00"
	},
	{
		username: "test",
		degenValue: `${Math.floor(Math.random() * 10000).toFixed(0)}`,
		timestamp: "09:00"
	}
];
