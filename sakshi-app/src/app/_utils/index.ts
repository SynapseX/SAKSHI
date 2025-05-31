export const minutes = [1, 5, 15, 30, 60];

export function formatDateTime(dateTime: string): string {
  const dt = new Date(dateTime);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-IN', options).format(dt);
}

export function formatDuration(duration: number): string {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;
  return `${hours} hr ${minutes} min`;
}
