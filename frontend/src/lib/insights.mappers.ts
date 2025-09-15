import type { Summary, OrdersByDate, TopProduct } from "./insights.api";

 
const toNum = (v: unknown, d = 0) => {
  if (v == null) return d;
  const n = typeof v === "string" ? Number(v) : (typeof v === "number" ? v : NaN);
  return Number.isFinite(n) ? n : d;
};

 
function normalizeArray<T = any>(input: any): T[] {
  if (Array.isArray(input)) return input as T[];
  if (Array.isArray(input?.data)) return input.data as T[];
  if (Array.isArray(input?.items)) return input.items as T[];
  if (Array.isArray(input?.results)) return input.results as T[];
  if (Array.isArray(input?.orders)) return input.orders as T[];
  try {
    if (typeof input === "string") {
      const parsed = JSON.parse(input);
      return normalizeArray<T>(parsed);
    }
  } catch {}
  return [];
}

export function mapSummaryToKpis(s: Summary) {
  const gross = toNum(s?.financials?.grossRevenue);
  const totalOrders = toNum(s?.totals?.orders);
  const aov = s?.rates?.aov ?? (totalOrders ? Math.round(gross / totalOrders) : 0);

  return {
    totals: {
      customers: toNum(s?.totals?.customers),
      orders: toNum(s?.totals?.orders),
      products: toNum(s?.totals?.products),
      lineItems: toNum(s?.totals?.lineItems),
     
      liveVariants: toNum((s as any)?.totals?.liveVariants),
    },
    financials: {
      grossRevenue: gross,
      netRevenue: toNum(s?.financials?.netRevenue),
      refunds: toNum(s?.financials?.refunds),
      discounts: toNum(s?.financials?.discounts),
      taxCollected: toNum(s?.financials?.taxCollected),
      shippingCollected: toNum((s as any)?.financials?.shippingCollected),
    },
    rates: {
      aov,
      conversionRatePct: toNum(s?.rates?.conversionRatePct),
      repeatPurchaseRatePct: toNum(s?.rates?.repeatPurchaseRatePct),
    },
    last24h: {
      revenue: toNum(s?.last24h?.revenue),
      orders: toNum(s?.last24h?.orders),
      newCustomers: toNum(s?.last24h?.newCustomers),
    },
  };
}

export function mapOrdersToTimeSeries(resp: OrdersByDate | any) {

  const raw = normalizeArray<any>(resp);
  return raw.map((d: any) => {
    const dateIso = d?.date ?? d?.day ?? "";
    const revenue = toNum(d?.revenue);
    const orders  = toNum(d?.orders);
    return {
      date: dateIso,
      dateFormatted: dateIso ? new Date(dateIso).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "",
      revenue,
      orders,
      revenueInCrores: +(revenue / 10_000_000).toFixed(2),
      ordersInK: +(orders / 1_000).toFixed(2),
    };
  });
}

export function productsToPseudoCategories(top: TopProduct[] | any) {
  const data = normalizeArray<TopProduct>(top);
  return data.slice(0, 8).map(p => ({
    name: (p?.title || "").split(" ").slice(0, 2).join(" ") || "Product",
    value: toNum((p as any)?.revenue),
    percentage: "0",
  }));
}
