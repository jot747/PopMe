export const formatDate = (isoDate: string | null) => {
  if (!isoDate) return 'No due date';
  const date = new Date(isoDate);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export const toIsoDate = (date: Date) => date.toISOString();
