/** @jsxImportSource frog/jsx */

import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { vars } from './ui'
import {client} from './client'

interface DegenResponse {
  snapshot_date: string,
  user_rank: string,
  wallet_address: string,
  avatar_url: string,
  display_name: string,
  tip_allowance: string,
  remaining_allowance: string
}

type State = {
  count: number
}

const app = new Frog<{ State: State }>({
  initialState: {
    count: 0
  },
  assetsPath: '/',
  basePath: '/api',
  ui: { vars },
  imageOptions: {
    fonts: [
      {
        name: 'Open Sans',
        source: 'google',
        weight: 700
      },
      {
        name: 'Open Sans',
        source: 'google',
        weight: 400
      },
      {
        name: 'DM Serif Display',
        source: 'google',
      },
    ],
  },
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": process.env.AIRSTACK_API_KEY || "",
      }
    }
  }
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame('/', async (c) => {
  return c.res({
    image: (
      <div
        style={{
          fontFamily: 'Open Sans',
          alignItems: 'center',
          background: 'linear-gradient(to right, #231651, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <h1 style={{fontFamily: 'DM Serif Display', fontSize: 80, color: '#D6FFF6'}}>Who did I tip today?</h1>
        <h1 style={{fontFamily: 'DM Serif Display', fontSize: 65, color: '#D6FFF6'}}>🎩 $DEGEN edition 🎩</h1>
        <h4 style={{fontSize: 35, color: '#D6FFF6'}}>by @leovido.eth</h4>
      </div>
    ),
    intents: [
      <Button action="/check" value="check">Check</Button>,
    ],
  })
})

app.frame('/check', async (c) => {
  const { buttonValue, buttonIndex, frameData, deriveState, verified } = c

  if (!verified) {
    console.log(`Frame verification failed for ${frameData?.fid}`)
    return c.res({
      image: (
        <div
        style={{
          fontFamily: 'Open Sans',
          alignItems: 'center',
          background: 'linear-gradient(to right, #231651, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <p style={{fontFamily: 'Open Sans', fontWeight: 700, fontSize: 45, color: '#D6FFF6'}}>Something went wrong</p>
      </div>
      ),
      intents: [
        <Button action="/">Restart</Button>,
      ],
    })
  }

  const state = deriveState(previousState => {
    if (buttonIndex === 2 && buttonValue !== "check") previousState.count++
    if (buttonIndex === 1 && buttonValue !== "check") previousState.count--
  })

  const fid = frameData?.fid || 0;

  const request = await fetch(
    `https://www.degen.tips/api/airdrop2/tip-allowance?fid=${fid}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'
      },
    }
  ).catch((e) => {
    console.error(`degen.tips: ${e}`)

    throw new Error(`degen.tips: ${e}`)
  })

  const json: DegenResponse[] = await request.json()
    .catch((e) => {
      console.error(`degen.tips json: ${e}`)

      throw new Error(`degen.tips json: ${e}`)
    })

  if (json.length === 0) {
    return c.res({
      image: (
        <div
        style={{
          fontFamily: 'Open Sans',
          alignItems: 'center',
          background: 'linear-gradient(to right, #231651, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <h1 style={{fontFamily: 'DM Serif Display', fontSize: 70, color: '#D6FFF6'}}>Sorry, your FID: {fid} is not eligible for S3 DEGEN tipping</h1> 
        <p style={{fontSize: 45, color: '#D6FFF6'}}>Visit https://degen.tips for more info</p>        
      </div>
      )
    })
  }

  const allowance = json.find((value) => {
    return value.tip_allowance
  })?.tip_allowance || 0

  const date = new Date()
  const items = await client(fid, date)
  .catch((e) => {
    console.error(`client items error: ${e}`)

    throw new Error(`client items error: ${e}`)
  })

  const totalDegen = items.reduce((acc, item) => {
    if (item) {
      const amount = (item.degenValue?.match(/\d+/) ?? [0])[0] ?? 0;

      return acc + Number(amount) 
    } else {
      return acc + 0
    }
  }, 0);

  const groupedArray = Array.from({ length: Math.ceil(items.length / 5) }, (_, index) =>
    items.slice(index * 5, index * 5 + 5)
  );

  return c.res({
    image: (
      <div
        style={{
          fontFamily: 'Open Sans',
          alignItems: 'center',
          background: 'linear-gradient(to right, #231651, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <h1 style={{fontFamily: 'DM Serif Display', fontSize: 70, color: '#D6FFF6'}}>Who did I tip today?</h1>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {groupedArray.length > 0 && groupedArray[state.count].map((u, index) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p key={index} style={{fontFamily: "AvenirNext", fontSize: 35, color: '#D6FFF6'}}>
            {`${(5 * state.count) + index + 1}. @${u?.username} - ${u?.degenValue} at ${u?.timestamp} UTC`}
            </p>
          </div>
        ))}
        {frameData !== undefined && groupedArray.length > 0 && 
          <p style={{fontFamily: 'Open Sans', fontWeight: 700, fontSize: 45, color: '#2CFA1F'}}>TOTAL: {totalDegen}/{allowance} $DEGEN - REMAINING: {Number(allowance) - totalDegen}</p>
        }
        {frameData !== undefined && groupedArray.length === 0 && 
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <p style={{fontSize: 45, color: '#D6FFF6'}}>You haven't tipped today</p>
            <p style={{fontSize: 45, color: '#D6FFF6'}}>Tip artists, musicians, devs, leaders, etc.</p>
          </div>
        }
        </div>
      </div>
    ),
    intents: [
      frameData !== undefined && groupedArray.length > 1 && <Button value="dec">←</Button>,
      frameData !== undefined && groupedArray.length > 1 && <Button value="inc">→</Button>,
      frameData !== undefined && <Button action='/check' value="check">Refresh</Button>,
      frameData !== undefined && <Button.Link href="https://warpcast.com/leovido.eth/0xd6e20741">Tip 🎩</Button.Link>
    ],
  })
})


devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
