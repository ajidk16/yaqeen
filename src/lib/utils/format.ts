export const formatDate = (date: Date, locale: string = 'id-ID'): string => {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const hijriDate = (date: Date, locale: string = 'id-ID-u-ca-islamic'): string => {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export const formatTime = (date: Date, locale: string = 'id-ID'): string => {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date).replace('.', ':');
};

export const formatDateTime = (date: Date, locale: string = 'id-ID'): string => {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`;
}

export const formatTimeDiff = (diff: number): string => {
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};