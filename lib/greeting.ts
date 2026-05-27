/** Time-of-day greeting based on local device time. */
export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Good night';
}

export function formatGreeting(name: string, date: Date = new Date()): string {
  const trimmed = name.trim() || 'there';
  return `${getTimeGreeting(date)}, ${trimmed}`;
}
