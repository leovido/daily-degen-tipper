import { neynarClient } from '@/app/client'
import { type CastWithTimestamp, castWithTimeFormatting, isWithinTimeRangeLP } from '@/app/helper'

const castWithMatchedHam = (cast: CastWithTimestamp) => {
  const pattern = /(🍖)\s*x?\s*(\d+)/
  const match = cast.text.match(pattern)

  if (match !== null) {
    return {
      hamValue: match[0] || '',
      author: cast.author.fid || '',
      timestamp: cast.timestamp
    }
  }
}

export const client = async (fid: number, date: Date) => {
  const fetchAllCastsResult = await neynarClient.fetchAllCastsCreatedByUser(fid, {
    limit: 100
  })
  const filteredAndFormattedCasts = fetchAllCastsResult.result.casts
    .filter(cast => isWithinTimeRangeLP(date, cast.timestamp))
    .map(cast => {
      const formattedCast = castWithTimeFormatting(cast)
      return castWithMatchedHam(formattedCast)
    })
    .filter(cast => cast !== undefined)

  const usersInfo = await Promise.all(filteredAndFormattedCasts.map(async (cast) => {
    if (!cast) return

    const response = await neynarClient.fetchBulkUsers([Number(cast.author)])
    const user = response.users.find(user => user.username)

    return {
      username: user?.username || '',
      hamValue: cast.hamValue,
      timestamp: cast.timestamp
    }
  }))

  // Filter out any undefined values after async operations
  return usersInfo.filter(user => user !== undefined)
}
