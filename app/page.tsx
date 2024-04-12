import { getFrameMetadata } from 'frog/next'
import type { Metadata } from 'next'
import Image from 'next/image'

import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata(
    `${process.env.VERCEL_URL || 'http://localhost:3000'}/api`,
  )
  return {
    other: frameTags,
  }
}

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <h1>Daily degen tipper</h1>
        <a href="https://warpcast.com/leovido.eth/0xd6e20741">
          $DEGEN and LP editons of "Who did I tip today?"
        </a>
      </div>
    </main>
  )
}
