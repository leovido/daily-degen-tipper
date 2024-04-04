export const isWithinTimeRange = (today: Date = new Date(), timestamp: string) => {
    const date = new Date(timestamp);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); 

    if (today.getUTCHours() >= 0 && today.getUTCHours() < 9) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setUTCHours(8, 0, 0, 0);

      const todayEnd = new Date(tomorrow);
      todayEnd.setUTCHours(7, 59, 59, 999);
 
      return date >= yesterday && date <= todayEnd
    } else {
      const todayStart = new Date(today);
      todayStart.setUTCHours(8, 0, 0, 0);

      const todayEnd = new Date(tomorrow);
      todayEnd.setUTCHours(7, 59, 59, 999);

      const isTodayInRange = date >= todayStart && date <= todayEnd;
      const nextDayStart = new Date(tomorrow);
      nextDayStart.setUTCHours(0, 0, 0, 0);
      const nextDayEnd = new Date(tomorrow);
      nextDayEnd.setUTCHours(7, 59, 59, 999);
      const isNextDayInRange = date >= nextDayStart && date <= nextDayEnd;

      return isTodayInRange || isNextDayInRange;    
    }
}
