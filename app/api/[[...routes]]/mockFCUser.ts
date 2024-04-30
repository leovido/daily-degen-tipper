import { kFormatter } from "@/app/numberFormattingKs";
import { FCUser } from "./client";

export const mockItems: FCUser[] = [
	{
		username: "nimaleophotos.eth",
		tipAmount: "100K",

		fid: 444444
	},
	{
		username: "test",
		tipAmount: "100",

		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "nimaleophotos.eth",
		tipAmount: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,

		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "nimaleophotos.eth",
		tipAmount: `${kFormatter(Math.floor(Math.random() * 10000).toString())}`,
		fid: Math.floor(Math.random() * 10000)
	}
];

export const mockItemsFiveItems = [
	{
		username: "test",
		tipAmount: `${Math.floor(Math.random() * 10000)}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "nimaleophotos.eth",
		tipAmount: `${Math.floor(Math.random() * 10000)}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${Math.floor(Math.random() * 10000)}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${Math.floor(Math.random() * 10000)}`,
		fid: Math.floor(Math.random() * 10000)
	},
	{
		username: "test",
		tipAmount: `${Math.floor(Math.random() * 10000)}`,
		fid: Math.floor(Math.random() * 10000)
	}
];
