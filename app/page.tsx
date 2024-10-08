import React from "react";
import { getFrameMetadata } from "frog/next";
import type { Metadata } from "next";

import styles from "./page.module.css";

export async function generateMetadata(): Promise<Metadata> {
	const frameTags = await getFrameMetadata(
		`${process.env.VERCEL_URL || "http://localhost:3000"}/api`
	);
	return {
		title: "Who did I tip?",
		description: "FC frames for $DEGEN and LP Ham",
		authors: [
			{
				name: "@leovido.eth",
				url: "https://github.com/leovido"
			}
		],
		applicationName: "Who did I tip? FC frames",
		creator: "@leovido.eth",
		other: frameTags
	};
}

export default function Home() {
	return (
		<main className={styles.main}>
			<h1 style={{ color: "white" }}>
				$DEGEN and LP editons of &quot;Who did I tip today?&quot;
			</h1>
			<button className={styles.button}>
				<a
					href="https://warpcast.com/leovido.eth/0xd6e20741"
					target="_blank"
					rel="noreferrer"
				>
					Check it out on Warpcast
				</a>
			</button>
		</main>
	);
}
