/** @jsxImportSource frog/jsx */

import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { isWithinTimeRangeLP } from "../../helper";
import { vars } from '../../api/[[...routes]]/ui'

interface FCUser {
  username: string,
  hamValue?: string,
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
  basePath: '/lp',
  ui: { vars },
  imageOptions: {
    fonts: [
      {
        name: 'VT323',
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

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY || "");

app.frame('/', async (c) => {
  const { buttonIndex, frameData, deriveState } = c

  const fid = frameData?.fid || 0
  const allCasts = await client.fetchAllCastsCreatedByUser(fid, {
    limit: 100
  })

  const fetchAllowance = await fetch(`https://farcaster.dep.dev/lp/tips/${fid}`)

  const {allowance} = await fetchAllowance.json()
  
  const date = new Date()
  const fff = allCasts.result.casts.filter((cast) => {
    return isWithinTimeRangeLP(date, cast.timestamp)
  })
  .map((cast) => {
    const castDate = new Date(cast.timestamp)
    const hours = castDate.getUTCHours()
    const minutes = castDate.getUTCMinutes()

    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return {
      author: cast.parentAuthor,
      text: cast.text,
      timestamp: `${formattedTime}`
    }
  })
  .map((cast) => {
    const pattern = /(\W*)(🍖)\s*x?\s*(\d+)/;

    const match = cast.text.match(pattern)
  
    if (match !== null) {
      return {
        hamValue: match[0] || '',
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
        hamValue: value?.hamValue,
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
  const totalHam = items.reduce((acc, item) => {
    if (item) {
      const amount = (item.hamValue?.match(/\d+/) ?? [0])[0] ?? 0;

      return acc + Number(amount) * 10
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
          fontFamily: "VT323",
          alignItems: 'center',
          background: 'linear-gradient(to right, #0049f7, #000000)',
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
        {frameData === undefined && <h1 style={{fontSize: 50, color: '#D6FFF6'}}>LP Ham edition</h1>} 
        {frameData === undefined && <h4 style={{fontSize: 35, color: '#D6FFF6'}}>by @leovido.eth</h4>} 

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {groupedArray.length > 0 && groupedArray[state.count].map((u, index) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p key={index} style={{fontSize: 35, color: '#D6FFF6'}}>
            {`${(5 * state.count) + index + 1}. @${u?.username} - ${u?.hamValue} at ${u?.timestamp} UTC`}
            </p>
          </div>
        ))}
        {frameData !== undefined && groupedArray.length > 0 && <p style={{fontSize: 45, color: '#D6FFF6'}}>TOTAL: {totalHam}/{Math.trunc(allowance)} $TN100X</p>}
        {frameData !== undefined && groupedArray.length === 0 && <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <p style={{fontSize: 45, color: '#D6FFF6'}}>You haven't tipped 🍖 today</p>
          <p style={{fontSize: 45, color: '#D6FFF6'}}>Tip artists, musicians, devs, leaders, etc.</p>
          </div>
        }
        </div>
      </div>
    ),
    intents: [
      frameData === undefined && <Button value="check">Check</Button>,
      frameData !== undefined && groupedArray.length > 5 && <Button value="dec">←</Button>,
      frameData !== undefined && groupedArray.length > 5 && <Button value="inc">→</Button>,
      frameData !== undefined && <Button.Link href="https://warpcast.com/leovido.eth">Made by @leovido.eth</Button.Link>,
      frameData !== undefined && <Button.Link href="https://warpcast.com/~/compose?text=Check%20who%20you%20tipped%20today%0A%0A&embeds[]=https://daily-degen-tipper.vercel.app/api">Share frame</Button.Link>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
