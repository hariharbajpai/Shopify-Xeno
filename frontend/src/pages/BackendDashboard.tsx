import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import {
  BarChart3, PieChart as PieChartIcon, TrendingUp, Users, ShoppingCart,
  DollarSign, Target, RefreshCw, FileDown, Printer, MoveLeft, Package, PackageSearch
} from 'lucide-react';

import {
  ResponsiveContainer, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend,
  Bar, Line, PieChart, Pie, Cell
} from 'recharts';

import {
  getSummary, getOrdersByDate, getTopProducts, getRecentOrders, getTopCustomers, getDataSummary,
  type Period, type Summary, type OrdersByDate, type TopProduct, type RecentOrder
} from '@/lib/insights.api';

import {
  mapSummaryToKpis, mapOrdersToTimeSeries, productsToPseudoCategories
} from '@/lib/insights.mappers';

const fmtINRC = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });
const fmtIN   = new Intl.NumberFormat('en-IN');

const COLORS = {
  cyan: '#06b6d4',
  yellow: '#eab308',
  green: '#22c55e',
  gradient: ['#06b6d4', '#eab308', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899']
};

const toNum = (v: unknown, d = 0) => {
  if (v == null) return d;
  const n = typeof v === 'string' ? Number(v) : (typeof v === 'number' ? v : NaN);
  return Number.isFinite(n) ? n : d;
};

function ChartSkeleton({ height = 'h-80' }: { height?: string }) {
  return (
    <Card className="bg-white border-2 border-gray-100 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className={height}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-cyan-500 animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading analytics data...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimePeriodSelector({
  selectedPeriod, onPeriodChange, isLoading, onExport
}: {
  selectedPeriod: Period;
  onPeriodChange: (p: Period) => void;
  isLoading: boolean;
  onExport: () => void;
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex items-center gap-2">
        <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#64748b" d="M7 11h10v2H7zM5 4h2v2h10V4h2v2h2v14H3V6h2zm0 6h16V8H5v2zm0 8h16v-6H5v6z"/></svg>
        <span className="text-gray-700 font-medium">Time Period:</span>
      </div>
      <select
        className="w-32 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
        value={selectedPeriod}
        disabled={isLoading}
        onChange={(e)=>onPeriodChange(e.target.value as Period)}
      >
        <option value="1w">1 Week</option>
        <option value="1m">1 Month</option>
        <option value="6m">6 Months</option>
        <option value="1y">1 Year</option>
      </select>
      {isLoading && <RefreshCw className="h-4 w-4 text-cyan-500 animate-spin" />}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-cyan-50 hover:border-cyan-300"
          onClick={onExport}
          disabled={isLoading}
        >
          <FileDown className="h-4 w-4" /> Export PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-green-50 hover:border-green-300"
          onClick={()=>window.print()}
        >
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>
    </div>
  );
}

export default function BackendDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const [period, setPeriod] = useState<Period>('1m');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

 
  const [kpis, setKpis] = useState(() =>
    ({
      totals: { customers: 0, orders: 0, products: 0, lineItems: 0, liveVariants: 0 },
      financials: { grossRevenue: 0, netRevenue: 0, refunds: 0, discounts: 0, taxCollected: 0, shippingCollected: 0 },
      rates: { aov: 0 },
      last24h: { revenue: 0, orders: 0, newCustomers: 0 }
    })
  );
  const [inventory, setInventory] = useState({ products: 0, lineItems: 0, unitsSoldTop10: 0 });

 
  const [timeSeries, setTimeSeries] = useState<Array<{ dateFormatted: string; revenueInCrores: number; ordersInK: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number; percentage?: string }>>([]);
  const [recent, setRecent] = useState<RecentOrder[]>([]);
  const [topCustomers, setTopCustomers] = useState<Array<{ name: string; email: string; totalSpent: number }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{ title: string; revenue: number; quantity?: number; orders?: number }>>([]);

  const pageRef = useRef<HTMLDivElement>(null);

  async function fetchAll(p: Period) {
    const [
      summaryRes,
      seriesRes,
      topProductsRes,
      recentRes,
      topCustomersRes,
      dataSummaryRes
    ] = await Promise.allSettled([
      getSummary(),
      getOrdersByDate(p),
      getTopProducts(10),
      getRecentOrders(8),
      getTopCustomers(5),
      getDataSummary()
    ]);
 
    let summaryKpis = mapSummaryToKpis((summaryRes.status === 'fulfilled' ? summaryRes.value : undefined) as Summary);
   
    if (dataSummaryRes.status === 'fulfilled') {
      const counts = dataSummaryRes.value.counts || {};
      summaryKpis = {
        ...summaryKpis,
        totals: {
          ...summaryKpis.totals,
          products: summaryKpis.totals.products || toNum(counts.products),
          lineItems: summaryKpis.totals.lineItems || toNum(counts.lineItems),
        }
      };
    }
    setKpis(summaryKpis);

    
    if (seriesRes.status === 'fulfilled') {
      const ts = mapOrdersToTimeSeries({ data: seriesRes.value });
      setTimeSeries(ts.map(x => ({ dateFormatted: x.dateFormatted, revenueInCrores: x.revenueInCrores, ordersInK: x.ordersInK })));
      const last = ts[ts.length - 1];
      setKpis(prev => ({
        ...prev,
        last24h: {
          revenue: Math.round((last?.revenue ?? 0)),
          orders: Math.round((last?.orders ?? 0)),
          newCustomers: prev.last24h.newCustomers  
        }
      }));
    }
 
    if (topProductsRes.status === 'fulfilled') {
      const p = topProductsRes.value || [];
      setTopProducts(p.map(t => ({ title: t.title, revenue: t.revenue, quantity: t.quantity, orders: t.orders })));
      const pc = productsToPseudoCategories(p);
      const total = pc.reduce((s, x: any) => s + (x?.value ?? 0), 0) || 1;
      setCategoryData(pc.map((x: any) => ({ ...x, percentage: (((x?.value ?? 0)/total)*100).toFixed(1) })));

      const unitsSoldTop10 = p.reduce((s, x) => s + toNum(x.quantity), 0);
      setInventory(prev => ({
        ...prev,
        unitsSoldTop10
      }));
    }
 
    if (recentRes.status === 'fulfilled') {
      setRecent(recentRes.value);
    } else {
      setRecent([]);
    }

     
    if (topCustomersRes.status === 'fulfilled') {
      const arr = topCustomersRes.value || [];
      setTopCustomers(arr.map(c => ({
        name: [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Customer',
        email: c.email || '',
        totalSpent: toNum(c.totalSpent)
      })));
    }

     
    if (dataSummaryRes.status === 'fulfilled') {
      const counts = dataSummaryRes.value.counts || {};
      setInventory(prev => ({
        ...prev,
        products: toNum(counts.products),
        lineItems: toNum(counts.lineItems)
      }));
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { await fetchAll(period); } finally { setLoading(false); }
    })();
  
  }, []);

  const handlePeriod = async (p: Period) => {
    setPeriod(p);
    setRefreshing(true);
    try { await fetchAll(p); } finally { setRefreshing(false); }
  };

  const handleExport = () => window.print();

  return (
    <div className="min-h-screen bg-gray-50" ref={pageRef}>
      
      <div className="w-full px-8 py-6 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user?.picture ?? 'https://i.pravatar.cc/80?img=3'}
              alt="avatar"
              className="w-12 h-12 rounded-full border-2 border-cyan-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-black">Live Analytics</h1>
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold text-cyan-600">{user?.name ?? 'Guest'}</span> • <span className="text-green-600 ml-1">Enterprise Plan</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-green-100 text-green-700 px-3 py-1 text-sm">🟢 Live • {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</Badge>
            <Button variant="outline" className="gap-2" onClick={() => nav('/dashboard')}>
              <MoveLeft className="h-4 w-4" /> Mock Data
            </Button>
            <button onClick={logout} className="px-4 py-2 rounded-lg border-2 border-gray-200 text-black hover:bg-gray-50 font-medium">Logout</button>
          </div>
        </div>
      </div>

      
      <div className="w-full px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-2 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Business Performance Overview
          </h2>
          <p className="text-gray-600 text-lg">Real-time insights from your backend APIs</p>
        </div>

        <TimePeriodSelector
          selectedPeriod={period}
          onPeriodChange={handlePeriod}
          isLoading={refreshing || loading}
          onExport={handleExport}
        />

       
        {loading ? (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {[1,2,3,4].map(i => <ChartSkeleton key={i} height="h-40" />)}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-500" />
                  <CardTitle className="text-sm font-semibold text-black">Total Customers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black mb-2">{fmtIN.format(kpis.totals.customers)}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-sm font-semibold text-black">Total Orders</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black mb-2">{fmtIN.format(kpis.totals.orders)}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-sm font-semibold text-black">Gross Revenue</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black mb-2">{fmtINRC.format(kpis.financials.grossRevenue)}</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-black" />
                  <CardTitle className="text-sm font-semibold text-black">Average Order Value</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black mb-2">{fmtINRC.format(kpis.rates.aov)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Inventory Snapshot */}
        {!loading && (
          <div className="grid gap-6 md:grid-cols-3 mb-10">
            <Card className="bg-white border-2 border-gray-100 shadow-lg">
              <CardHeader className="pb-2 flex items-center gap-2">
                <Package className="h-5 w-5 text-black" />
                <CardTitle className="text-sm font-semibold text-black">Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{fmtIN.format(inventory.products)}</div>
                <p className="text-gray-500 text-sm mt-1">Total active products in database</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-gray-100 shadow-lg">
              <CardHeader className="pb-2 flex items-center gap-2">
                <PackageSearch className="h-5 w-5 text-cyan-600" />
                <CardTitle className="text-sm font-semibold text-black">Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{fmtIN.format(inventory.lineItems)}</div>
                <p className="text-gray-500 text-sm mt-1">Historical SKU-level entries</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-2 border-gray-100 shadow-lg">
              <CardHeader className="pb-2 flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-green-600" />
                <CardTitle className="text-sm font-semibold text-black">Units Sold (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-black">{fmtIN.format(inventory.unitsSoldTop10)}</div>
                <p className="text-gray-500 text-sm mt-1">Sum of quantities from top products</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {loading || refreshing ? (
            <ChartSkeleton height="h-96" />
          ) : (
            <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-cyan-500" />
                    <CardTitle className="text-lg font-bold text-black">Revenue &amp; Orders Trend</CardTitle>
                  </div>
                  <Badge className="bg-cyan-100 text-cyan-700">Time Series</Badge>
                </div>
                <p className="text-gray-600 text-sm">Track revenue and order patterns over {period}</p>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="dateFormatted" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: 8 }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenueInCrores" fill={COLORS.cyan} name="Revenue (₹Cr)" radius={[4,4,0,0]} />
                    <Line yAxisId="right" type="monotone" dataKey="ordersInK" stroke={COLORS.yellow} strokeWidth={3} name="Orders (K)" dot={{ r: 5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {loading || refreshing ? (
            <ChartSkeleton height="h-96" />
          ) : (
            <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg font-bold text-black">Revenue by Category</CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Distribution</Badge>
                </div>
                <p className="text-gray-600 text-sm">Derived from top products (pseudo-categories)</p>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      labelLine={false}
                      label={(d: any) => `${d.name} ${d.percentage}%`}
                      dataKey="value"
                    >
                      {categoryData.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS.gradient[i % COLORS.gradient.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [fmtINRC.format(v), 'Revenue']} contentStyle={{ backgroundColor: '#fff', border: '2px solid #e2e8f0', borderRadius: 8 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top Customers + Top Products + Recent Orders */}
        {!loading && (
          <div className="grid xl:grid-cols-3 gap-8">
            {/* Top Customers */}
            <Card className="bg-white border-2 border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Top Customers</CardTitle>
                <p className="text-gray-600 text-sm">Highest total spend</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-2">Name</th>
                        <th className="py-2">Email</th>
                        <th className="py-2 text-right">Total Spent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCustomers.length === 0 && (
                        <tr><td colSpan={3} className="py-4 text-center text-gray-500">No data</td></tr>
                      )}
                      {topCustomers.map((c, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2">{c.name}</td>
                          <td className="py-2">{c.email || '—'}</td>
                          <td className="py-2 text-right">{fmtINRC.format(c.totalSpent)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="bg-white border-2 border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Top Products</CardTitle>
                <p className="text-gray-600 text-sm">Revenue, quantity, orders</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-2">Title</th>
                        <th className="py-2 text-right">Revenue</th>
                        <th className="py-2 text-right">Qty</th>
                        <th className="py-2 text-right">Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.length === 0 && (
                        <tr><td colSpan={4} className="py-4 text-center text-gray-500">No data</td></tr>
                      )}
                      {topProducts.map((p, i) => (
                        <tr key={i} className="border-t">
                          <td className="py-2">{p.title}</td>
                          <td className="py-2 text-right">{fmtINRC.format(p.revenue)}</td>
                          <td className="py-2 text-right">{fmtIN.format(toNum(p.quantity))}</td>
                          <td className="py-2 text-right">{fmtIN.format(toNum(p.orders))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Recent Orders */}
            <Card className="bg-white border-2 border-gray-100 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black">Recent Orders</CardTitle>
                <p className="text-gray-600 text-sm">Latest activity</p>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="py-2">Order</th>
                        <th className="py-2">Date</th>
                        <th className="py-2">Status</th>
                        <th className="py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.length === 0 && (
                        <tr><td colSpan={4} className="py-4 text-center text-gray-500">No data</td></tr>
                      )}
                      {recent.map((o) => (
                        <tr key={o.orderId} className="border-t">
                          <td className="py-2">{o.name}</td>
                          <td className="py-2">{new Date(o.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                          <td className="py-2">{o.financialStatus}</td>
                          <td className="py-2 text-right">{fmtINRC.format(o.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Today strip */}
        {!loading && (
          <div className="mt-12 p-8 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-center mb-6">
              <h4 className="text-2xl font-bold text-black mb-2 flex items-center justify-center gap-2">
                🎯 Today&apos;s Mission Status
                <Badge className="bg-green-100 text-green-700 animate-bounce">LIVE</Badge>
              </h4>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="font-bold text-cyan-600 text-2xl">{fmtINRC.format(kpis.last24h.revenue)}</div>
                <div className="text-gray-600 text-sm">24h Revenue</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="font-bold text-yellow-600 text-2xl">{fmtIN.format(kpis.last24h.orders)}</div>
                <div className="text-gray-600 text-sm">24h Orders</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="font-bold text-green-600 text-2xl">{fmtIN.format(kpis.last24h.newCustomers)}</div>
                <div className="text-gray-600 text-sm">New Customers</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="font-bold text-black text-2xl">
                  ₹{((kpis.last24h.revenue) / Math.max(1, kpis.last24h.orders)).toFixed(0)}
                </div>
                <div className="text-gray-600 text-sm">24h AOV</div>
              </div>
            </div>
          </div>
        )}
                {/* Note / Limitations */}
        {!loading && (
          <div className="mt-12 p-6 bg-white border-2 border-red-200 rounded-xl shadow-sm">
            <h4 className="text-lg font-bold text-red-600 mb-3">⚠️ Known Limitations</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
              <li>
                The dataset ingested is <strong>very small</strong>, so charts and KPIs don’t reflect realistic scale.  
                → Trends may appear flat or inconsistent.
              </li>
              <li>
                Shopify <strong>development stores don’t allow real checkout/order placement</strong>.  
                → This makes it difficult to generate real revenue insights.
              </li>
              <li>
                Revenue values shown are based only on manually created test orders or dummy data.  
                → Actual sales performance can’t be simulated.
              </li>
              <li>
                Customer repeat rate, abandoned cart events, and other advanced insights are not visible.  
                → These require production-like data or paid test plans.
              </li>
              <li>
                Since this is a <strong>multi-tenant demo</strong>, tenant isolation works, but overlapping tenant data is limited to sample inputs.
              </li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              These limitations are expected when using a Shopify Dev Store for an internship assignment, 
              and would not exist in a live merchant environment.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
