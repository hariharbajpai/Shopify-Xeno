export const fmtIN = new Intl.NumberFormat('en-IN');
export const fmtINRC = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

export function d(label: string) {
  // Accepts "YYYY-MM-DD" and returns short label like "15 Aug"
  const dt = new Date(label + 'T00:00:00');
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}