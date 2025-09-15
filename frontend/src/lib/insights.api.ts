const BASE = "https://shopify-xeno-backend.onrender.com";

export type Summary = {
  totals: { customers: number; orders: number; products?: number; lineItems?: number };
  financials: { grossRevenue: number; netRevenue?: number; refunds?: number; discounts?: number; taxCollected?: number };
  rates?: { aov?: number; conversionRatePct?: number; repeatPurchaseRatePct?: number };
  last24h?: { revenue: number; orders: number; newCustomers: number };
};

export type OrdersByDatePoint = { date: string; revenue: number; orders: number };
export type OrdersByDate = OrdersByDatePoint[];

export type TopCustomer = { customerShopId: string; email?: string; firstName?: string; lastName?: string; totalSpent: number };
export type TopProduct  = { productId: string; title: string; revenue: number; quantity?: number; orders?: number };
export type RecentOrder = { orderId: string; name: string; totalPrice: number; financialStatus: string; createdAt: string };

export type DataSummary = {
  counts: { tenants?: number; products?: number; customers?: number; orders?: number; lineItems?: number };
  timestamp: string;
  samples?: unknown;
};

const opts: RequestInit = {
  credentials: "include",
  headers: { "Content-Type": "application/json" }
};

const toNum = (v: any, d = 0) => {
  const n = typeof v === "string" ? Number(v) : v;
  return Number.isFinite(n) ? n : d;
};

// period → from/to
export type Period = "1w" | "1m" | "6m" | "1y";
export function periodToRange(period: Period) {
  const to = new Date();
  const from = new Date();
  if (period === "1w") from.setDate(to.getDate() - 7);
  if (period === "1m") from.setMonth(to.getMonth() - 1);
  if (period === "6m") from.setMonth(to.getMonth() - 6);
  if (period === "1y") from.setFullYear(to.getFullYear() - 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

export async function getSummary(): Promise<Summary> {
  const r = await fetch(`${BASE}/insights/summary`, opts);
  if (!r.ok) throw new Error("summary failed");
  const j = await r.json();
  // API: { success, totals: { customers, orders, revenue } }
  const gross = toNum(j?.totals?.revenue);
  return {
    totals: {
      customers: toNum(j?.totals?.customers),
      orders: toNum(j?.totals?.orders),
      products: 0,
      lineItems: 0
    },
    financials: { grossRevenue: gross },
    rates: { aov: (toNum(j?.totals?.orders) ? Math.round(gross / toNum(j?.totals?.orders)) : 0) },
    last24h: { revenue: 0, orders: 0, newCustomers: 0 }
  };
}

export async function getOrdersByDate(period: Period): Promise<OrdersByDate> {
  const { from, to } = periodToRange(period);
  const r = await fetch(`${BASE}/insights/orders-by-date?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, opts);
  if (!r.ok) throw new Error("orders-by-date failed");
  const j = await r.json();
  const arr = Array.isArray(j?.data) ? j.data : [];
  return arr.map((x: any) => ({
    date: x?.day,
    revenue: toNum(x?.revenue),
    orders: toNum(x?.orders),
  }));
}

export async function getTopCustomers(limit = 5): Promise<TopCustomer[]> {
  const r = await fetch(`${BASE}/insights/top-customers?limit=${limit}`, opts);
  if (!r.ok) throw new Error("top-customers failed");
  const j = await r.json();
  const arr = Array.isArray(j?.data) ? j.data : [];
  return arr.map((c: any) => ({
    customerShopId: String(c?.customerShopId ?? ""),
    email: c?.email ?? "",
    firstName: c?.firstName ?? "",
    lastName: c?.lastName ?? "",
    totalSpent: toNum(c?.totalSpent)
  }));
}

export async function getTopProducts(limit = 10): Promise<TopProduct[]> {
  const r = await fetch(`${BASE}/insights/top-products?limit=${limit}`, opts);
  if (!r.ok) throw new Error("top-products failed");
  const j = await r.json();
  const arr = Array.isArray(j?.data) ? j.data : [];
  return arr.map((p: any) => ({
    productId: String(p?.productId ?? ""),
    title: p?.title ?? "Product",
    revenue: toNum(p?.revenue),
    quantity: toNum(p?.quantity),
    orders: toNum(p?.orders),
  }));
}

export async function getRecentOrders(limit = 8): Promise<RecentOrder[]> {
  const r = await fetch(`${BASE}/insights/recent-orders?limit=${limit}`, opts);
  if (!r.ok) throw new Error("recent-orders failed");
  const j = await r.json();
  const arr = Array.isArray(j?.data) ? j.data : [];
  return arr.map((o: any) => ({
    orderId: String(o?.orderId ?? ""),
    name: o?.name ?? "",
    totalPrice: toNum(o?.totalPrice),
    financialStatus: o?.financialStatus ?? "",
    createdAt: o?.createdAt ?? "",
  }));
}

export async function getDataSummary(): Promise<DataSummary> {
  const r = await fetch(`${BASE}/api/data-summary`, opts);
  if (!r.ok) throw new Error("data-summary failed");
  const j = await r.json();
  return {
    timestamp: j?.timestamp ?? new Date().toISOString(),
    counts: {
      tenants: toNum(j?.counts?.tenants),
      products: toNum(j?.counts?.products),
      customers: toNum(j?.counts?.customers),
      orders: toNum(j?.counts?.orders),
      lineItems: toNum(j?.counts?.lineItems),
    },
    samples: j?.samples
  };
}
