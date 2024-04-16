/** @jsxImportSource frog/jsx */

import { Button, Frog } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { vars } from '../../api/[[...routes]]/ui'
import { client } from './neynarClient'

interface State {
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
        source: 'google'
      },
      {
        name: 'Open Sans',
        source: 'google'
      }
    ]
  },
  hub: {
    apiUrl: 'https://hubs.airstack.xyz',
    fetchOptions: {
      headers: {
        'x-airstack-hubs': process.env.AIRSTACK_API_KEY || ''
      }
    }
  }
})

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame('/check', async (c) => {
  const { buttonIndex, buttonValue, frameData, deriveState, verified } = c

  const fid = frameData?.fid || 0

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
          width: '100%'
        }}
      >
        <p style={{ fontFamily: 'Open Sans', fontWeight: 700, fontSize: 45, color: '#D6FFF6' }}>Something went wrong</p>
      </div>
      ),
      intents: [
        <Button action="/">Restart</Button>
      ]
    })
  }

  const state = deriveState(previousState => {
    if (buttonIndex === 2 && buttonValue !== 'check') previousState.count++
    if (buttonIndex === 1 && buttonValue !== 'check') previousState.count--
  })

  const fetchAllowance = await fetch(
    `https://farcaster.dep.dev/lp/tips/${fid}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip'
      }
    }
  ).catch((e) => {
    console.error(`fetchAllowance: ${e}`)

    throw new Error(`fetchAllowance: ${e}`)
  })

  const { allowance: allowanceResponse } = await fetchAllowance
    .json()
    .catch((e) => {
      console.error(`fetchAllowance: ${e}`)

      throw new Error(`allowance: ${e}`)
    })

  if (allowanceResponse === 0) {
    return c.res({
      image: (
        <div
        style={{
          fontFamily: 'VT323',
          alignItems: 'center',
          background: 'linear-gradient(to right, #000000, #0049f7)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%'
        }}
      >
        <h1 style={{ fontFamily: 'DM Serif Display', fontSize: 70, color: '#D6FFF6' }}>Sorry, your FID: {fid} is not eligible for ham tipping</h1>
        <p style={{ fontSize: 45, color: '#D6FFF6' }}>Visit https://based.thelp.xyz for more info</p>
      </div>
      ),
      intents: [
        <Button.Link href="https://based.thelp.xyz">Visit website</Button.Link>
      ]
    })
  }

  const date = new Date()

  const items = await client(fid, date)
    .catch((e) => {
      console.error(`client items: ${e}`)

      throw new Error(`client items: ${e}`)
    })

  const totalHam = items.reduce((acc, item) => {
    if (item) {
      const amount = (item.hamValue?.match(/\d+/) ?? [0])[0] ?? 0

      return acc + Number(amount) * 10
    } else {
      return acc + 0
    }
  }, 0)

  const allowance = Math.trunc(allowanceResponse)
  const remainingHam = allowance - totalHam

  const groupedArray = Array.from({ length: Math.ceil(items.length / 5) }, (_, index) =>
    items.slice(index * 5, index * 5 + 5)
  )

  return c.res({
    image: (
      <div
        style={{
          fontFamily: 'VT323',
          alignItems: 'center',
          background: 'linear-gradient(to right, #000000, #0049f7)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%'
        }}
      >
        <h1 style={{ fontSize: 85, color: '#D6FFF6' }}>Who did I tip today?</h1>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {groupedArray.length > 0 && groupedArray[state.count].map((u, index) => (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <p key={index} style={{ fontFamily: 'Open Sans', fontSize: 35, color: '#D6FFF6' }}>
              {`${(5 * state.count) + index + 1}. @${u?.username} - ${u?.hamValue} at ${u?.timestamp} UTC`}
            </p>
          </div>
          ))}
        {groupedArray.length > 0 &&
          <p style={{ fontSize: 55, color: '#2CFA1F' }}>TOTAL🍖: {`${totalHam}`}/{allowance} - REMAINING: {`${remainingHam}`}</p>
        }
        {groupedArray.length === 0 &&
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ fontSize: 45, color: '#D6FFF6' }}>You haven't tipped 🍖 today</p>
          <p style={{ fontSize: 45, color: '#D6FFF6' }}>Tip artists, musicians, devs, leaders, etc.</p>
          <p style={{ fontSize: 45, color: '#2CFA1F', fontWeight: 700 }}>Your allowance: {allowance} 🍖</p>
          </div>
        }
        </div>
      </div>
    ),
    intents: [
      frameData !== undefined && groupedArray.length > 1 && <Button value="dec">←</Button>,
      frameData !== undefined && groupedArray.length > 1 && <Button value="inc">→</Button>,
      frameData !== undefined && groupedArray.length <= 1 && <Button action='/check' value="check">Refresh</Button>,
      frameData !== undefined && groupedArray.length <= 1 && <Button.Link href="https://warpcast.com/deployer/0x388a831b">L3 🍖 news</Button.Link>,
      frameData !== undefined && <Button.Link href="https://ham.fun">Visit ham.fun</Button.Link>
    ]
  })
})

app.frame('/', async (c) => {
  return c.res({
    image: (
      <div
        style={{
          fontFamily: 'VT323',
          alignItems: 'center',
          background: 'linear-gradient(to right, #000000, #0049f7)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%'
        }}
      >
        <h1 style={{ fontSize: 85, color: '#D6FFF6' }}>Who did I tip today?</h1>
        <h1 style={{ fontSize: 55, color: '#D6FFF6' }}>🍖 LP Ham edition 🍖</h1>
        <h4 style={{ fontFamily: 'Open Sans', fontSize: 35, color: '#D6FFF6' }}>by @leovido.eth</h4>
      </div>
    ),
    intents: [
      <Button action="/check" value="check">Check</Button>
    ]
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
