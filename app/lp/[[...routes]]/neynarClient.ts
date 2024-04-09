import { isWithinTimeRangeLP } from "@/app/helper";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { CastParentAuthorAllOf, CastWithInteractions } from "@neynar/nodejs-sdk/build/neynar-api/v1";

export const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY || "");

interface CastWithTimestamp {
  author: CastParentAuthorAllOf;
  text: string;
  timestamp: string;
}

const castWithTimeFormatting = (cast: CastWithInteractions): CastWithTimestamp => {
  const castDate = new Date(cast.timestamp)
  const hours = castDate.getUTCHours()
  const minutes = castDate.getUTCMinutes()

  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  return {
    author: cast.parentAuthor,
    text: cast.text,
    timestamp: `${formattedTime}`
  }
}

const castWithMatchedHam = (cast: CastWithTimestamp) => {
  const pattern = /(\W*)(🍖)\s*x?\s*(\d+)/;
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
  const fetchAllCastsResult = await neynarClient.fetchAllCastsCreatedByUser(fid);
  const filteredAndFormattedCasts = fetchAllCastsResult.result.casts
    .filter(cast => isWithinTimeRangeLP(date, cast.timestamp))
    .map(cast => {
      const formattedCast = castWithTimeFormatting(cast);
      return castWithMatchedHam(formattedCast);
    })
    .filter(cast => cast !== undefined); // Assuming castWithMatchedHam can return undefined
  
  const usersInfo = await Promise.all(filteredAndFormattedCasts.map(async (cast) => {
    if (!cast) return;

    const response = await neynarClient.fetchBulkUsers([Number(cast.author)]);
    const user = response.users.find(user => user.username);

    return {
      username: user?.username || '',
      hamValue: cast.hamValue,
      timestamp: cast.timestamp
    };
  }));

  // Filter out any undefined values after async operations
  return usersInfo.filter(user => user !== undefined);
}