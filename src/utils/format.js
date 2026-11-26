// "2026-09-11T21:00:00.000Z" -> "11.09.2026" (yerel saat dilimine göre)
export const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('tr-TR');
};

// 45000 -> "45.000,00 ₺"
export const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  return `${Number(value).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
};

// "2026-11-26T13:35:00.000Z" -> "26.11.2026 16:35"
export const formatDateTime = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
};