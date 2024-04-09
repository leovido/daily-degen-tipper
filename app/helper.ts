export const isWithinTimeRange = (today: Date = new Date(), timestamp: string) => {
    const date = new Date(timestamp);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); 

    const deadlineToday = (today.getUTCHours() <= 7) && (today.getUTCMinutes() < 35);

    if (today.getUTCHours() >= 0 && today.getUTCHours() <= 8) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setUTCHours(7, 35, 0, 0);

      const todayEnd = new Date(tomorrow);
      todayEnd.setUTCHours(7, 34, 59, 999);
 
      return date >= yesterday && date <= todayEnd
    } else {
      const todayStart = new Date(today);
      todayStart.setUTCHours(7, 35, 0, 0);

      const todayEnd = new Date(tomorrow);
      todayEnd.setUTCHours(7, 34, 59, 999);

      const isTodayInRange = date >= todayStart && date <= todayEnd;
      const nextDayStart = new Date(tomorrow);
      nextDayStart.setUTCHours(0, 0, 0, 0);
      const nextDayEnd = new Date(tomorrow);
      nextDayEnd.setUTCHours(7, 34, 59, 999);
      const isNextDayInRange = date >= nextDayStart && date <= nextDayEnd;

      return isTodayInRange || isNextDayInRange;    
    }
}

export const isWithinTimeRangeLP = (today: Date = new Date(), timestamp: string) => {
    const date = new Date(timestamp);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); 
     
    const deadlineToday = (today.getUTCHours() <= 4) && (today.getUTCMinutes() < 29);

    if (today.getUTCHours() >= 0 && deadlineToday) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setUTCHours(4, 30, 0, 0);

      const todayEnd = new Date(tomorrow);
      todayEnd.setUTCHours(4, 29, 59, 999);
 
      return date >= yesterday && date <= todayEnd
    } else {
      const todayStart = new Date(today);
      todayStart.setUTCHours(4, 30, 0, 0);

      const todayEnd = new Date(tomorrow);
      todayEnd.setUTCHours(4, 29, 59, 999);

      const isTodayInRange = date >= todayStart && date <= todayEnd;
      const nextDayStart = new Date(tomorrow);
      nextDayStart.setUTCHours(0, 0, 0, 0);
      const nextDayEnd = new Date(tomorrow);
      nextDayEnd.setUTCHours(4, 29, 59, 999);
      const isNextDayInRange = date >= nextDayStart && date <= nextDayEnd;

      return isTodayInRange || isNextDayInRange;    
    }
}

export function findMatches(text: string) {
  const pattern = /(🍖+)(?:\s*x\s*(\d+))?/;

  const matches = text.match(pattern);

  console.warn(matches, 'the matches')
  if (matches) {
    // Extract the matched emoji group
    const emojis = matches[1];
    // Extract the number if present; it'll be `undefined` if not
    const number = matches[2];

    return [emojis, number]; // Returns the format [emojis, 'number'] or [emojis, undefined]
  }
  return []; // Return an empty array if no match is found
}
export const calculateHamAmount = (text: string) => {
  const pattern = /(🍖+)(?:\s*x\s*(\d+))?/;
  const match = text.match(pattern)

  console.warn(match, 'the match here')
  if (match !== null) {
    if (match[1]) {
      const amount: number = Array(match[1]).reduce((acc, item) => {
        if (item === "🍖") {
          return acc + 1
        } else {
          return acc
        }
      }, 0)

      if (match[2]) {
        const hamMultiplier = Number(match[2])
        const totalMultiplied = hamMultiplier * 10

        return totalMultiplied + amount - 1
      } else {
        return amount
      }

    }
  }
}
