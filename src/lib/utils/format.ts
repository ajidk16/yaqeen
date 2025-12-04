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
  }).format(date);
};