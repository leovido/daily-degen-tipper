/** @jsxImportSource frog/jsx */

import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { isWithinTimeRange } from "../../helper";
import { vars } from './ui'

interface FCUser {
  username: string,
  degenValue?: string,
  timestamp: string
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
  // Supply a Hub to enable frame verification.
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY || ""); 

app.frame('/', async (c) => {
  const { buttonIndex, frameData, deriveState } = c

  const allCasts = await client.fetchAllCastsCreatedByUser(frameData?.fid || 0, {
    limit: 100
  })

  const date = new Date()
  const fff = allCasts.result.casts.filter((cast) => {
    return isWithinTimeRange(date, cast.timestamp)
  })
  .map((cast) => {
    const castDate = new Date(cast.timestamp)
    const hours = castDate.getUTCHours()
    const minutes = castDate.getUTCMinutes()

    return {
      author: cast.parentAuthor,
      text: cast.text,
      timestamp: `${hours}:${minutes}`
    }
  })
  .map((cast) => {
    const pattern = /\b\d+ \$DEGEN\b/
    const match = cast.text.match(pattern)
  
    if (match !== null) {
      return {
        degenValue: match[0] || '',
        author: cast.author.fid || '',
        timestamp: cast.timestamp
      }
    }
  })
  .filter((value) => {
    return value !== undefined
  })
  .map(async (value) => {
    if (value) {
      const response = await client.fetchBulkUsers([Number(value.author)])

      const user = response.users.find((user) => {
        return user.username
      })

      const val: FCUser = {
        username: user?.username || '',
        degenValue: value?.degenValue,
        timestamp: value?.timestamp
      }

      return val
    }
  })
  .map(async (user) => {
    const u: FCUser | undefined = await user
    
    return u
  })

  const requestUser = await Promise.all(
    fff
  )

  const items = await requestUser
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

  const state = deriveState(previousState => {
    if (buttonIndex === 3) previousState.count++
    if (buttonIndex === 2) previousState.count - 1
  })

  return c.res({
    image: (
      <div
        style={{
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
        <h1 style={{fontSize: 70, color: '#D6FFF6'}}>Who did I tip today?</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {groupedArray.length > 0 && groupedArray[state.count].map((u, index) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p key={index} style={{fontFamily: "AvenirNext", fontSize: 35, color: '#D6FFF6'}}>
            {`${(5 * state.count) + index + 1}. @${u?.username} - ${u?.degenValue} at ${u?.timestamp} UTC`}
            </p>
          </div>
        ))}
        {frameData !== undefined && <p style={{fontSize: 45, color: '#D6FFF6'}}>TOTAL: {totalDegen} $DEGEN</p>}
        </div>
      </div>
    ),
    intents: [
      frameData === undefined && <Button value="check">Check</Button>,
      frameData !== undefined && <Button.Link href="https://warpcast.com/leovido">Made by @leovido</Button.Link>,
      frameData !== undefined && groupedArray.length > 5 && <Button value="dec">←</Button>,
      frameData !== undefined && groupedArray.length > 5 && <Button value="inc">→</Button>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
