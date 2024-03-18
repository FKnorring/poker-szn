export function isTimeToPlay(date: Date) {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(6, 0, 0, 0);
  return Date.now() < nextDay.getTime();
}
