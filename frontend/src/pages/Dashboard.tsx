import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { blob } from "@/data/tenatBlob";
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Treemap, FunnelChart, Funnel, LabelList, ScatterChart, Scatter
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Target, 
  Zap, Award, Calendar, RefreshCw, 
  BarChart3, PieChart as PieChartIcon, TrendingUp as TrendingUpIcon, Brain,
  Clock, FileDown, Printer, Star, Heart, Shield, Sparkles, Crown, Gem, Bolt,
  Rocket, Trophy, Medal, Layers, Package
} from 'lucide-react';

const fmtINRC = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 });
const fmtIN = new Intl.NumberFormat('en-IN');
const fmtPct = new Intl.NumberFormat('en-IN', { style: 'percent', minimumFractionDigits: 1 });

const COLORS = {
  cyan: '#06b6d4',
  yellow: '#eab308', 
  green: '#22c55e',
  black: '#0f172a',
  gray: '#64748b',
  lightGray: '#f1f5f9',
  white: '#ffffff',
  blue: '#3b82f6',
  indigo: '#6366f1',
  purple: '#8b5cf6',
  pink: '#ec4899',
  red: '#ef4444',
  orange: '#f97316',
  gradient: ['#06b6d4', '#eab308', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899']
};

function generateTimeBasedData(period: string) {
  const baseData = blob.ordersByDate_30d;
  const now = new Date();
  switch (period) {
    case '1w':
      return baseData.slice(-7).map(item => ({
        ...item,
        dateFormatted: new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        revenueInCrores: item.revenue / 10000000,
        ordersInK: item.orders / 1000
      }));
    case '1m':
      return baseData.map(item => ({
        ...item,
        dateFormatted: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenueInCrores: item.revenue / 10000000,
        ordersInK: item.orders / 1000
      }));
    case '6m':
      return Array.from({ length: 26 }, (_, i) => {
        const date = new Date(now.getTime() - (25 - i) * 7 * 24 * 60 * 60 * 1000);
        const revenue = 45_00_00_000 + (Math.random() * 15_00_00_000);
        const orders = 50000 + (Math.random() * 25000);
        return {
          date: date.toISOString().split('T')[0],
          dateFormatted: `W${Math.floor(i/4) + 1}-${date.toLocaleDateString('en-IN', { month: 'short' })}`,
          revenue,
          orders,
          revenueInCrores: revenue / 10000000,
          ordersInK: orders / 1000
        };
      });
    case '1y':
      return Array.from({ length: 12 }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const revenue = 120_00_00_000 + (Math.random() * 50_00_00_000);
        const orders = 800000 + (Math.random() * 400000);
        return {
          date: date.toISOString().split('T')[0],
          dateFormatted: date.toLocaleDateString('en-IN', { month: 'long', year: '2-digit' }),
          revenue,
          orders,
          revenueInCrores: revenue / 10000000,
          ordersInK: orders / 1000
        };
      });
    default:
      return baseData.slice(-14).map(item => ({
        ...item,
        dateFormatted: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenueInCrores: item.revenue / 10000000,
        ordersInK: item.orders / 1000
      }));
  }
}

function exportToPDF(dashboardRef: React.RefObject<HTMLDivElement>, period: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  const timeBasedData = generateTimeBasedData(period);
  const categoryData = blob.revenueByCategory;
  const channelData = blob.channels;
  const currentDate = new Date();
  const reportTitle = `Business Analytics Report - ${period.toUpperCase()}`;
  const totalRevenue = timeBasedData.reduce((s, i) => s + i.revenue, 0);
  const avgDailyRevenue = totalRevenue / timeBasedData.length;
  const growthRate = timeBasedData.length > 1 ? 
    ((timeBasedData[timeBasedData.length - 1].revenue - timeBasedData[0].revenue) / timeBasedData[0].revenue * 100) : 0;

  printWindow.document.write(`
    <!DOCTYPE html><html><head><title>${reportTitle}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#1a1a1a;background:#fff}
      .container{max-width:1200px;margin:0 auto;padding:40px}
      .header{background:linear-gradient(135deg,#06b6d4,#0891b2);color:#fff;padding:60px 40px;text-align:center;border-radius:16px;margin-bottom:40px;box-shadow:0 20px 40px rgba(6,182,212,.2)}
      .header h1{font-size:48px;font-weight:800;margin-bottom:16px;letter-spacing:-1px}
      .meta-info{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;margin-bottom:50px}
      .meta-card{background:#f8fafc;padding:30px;border-radius:12px;border-left:6px solid #06b6d4;box-shadow:0 4px 12px rgba(0,0,0,.05)}
      .meta-card h3{color:#0f172a;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
      .meta-card .value{font-size:28px;font-weight:800;color:#06b6d4}
      .section-title{font-size:32px;font-weight:700;color:#0f172a;margin:30px 0 20px;padding-bottom:15px;border-bottom:3px solid #e2e8f0;display:flex;align-items:center;gap:12px}
      .kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:30px;margin-bottom:30px}
      .kpi-card{background:linear-gradient(135deg,#fff,#f8fafc);border:2px solid #e2e8f0;padding:35px;border-radius:16px;text-align:center;position:relative;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,.08)}
      .kpi-card::before{content:'';position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#06b6d4,#eab308,#22c55e)}
      .data-table{width:100%;border-collapse:collapse;margin:20px 0;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,.08)}
      .data-table th{background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;padding:20px;text-align:left;font-weight:600;font-size:14px;text-transform:uppercase;letter-spacing:1px}
      .data-table td{padding:18px 20px;border-bottom:1px solid #e2e8f0;font-size:15px}
      .footer{margin-top:40px;text-align:center;padding:30px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#fff;border-radius:16px}
      @media print{body{print-color-adjust:exact}}
    </style></head><body>
    <div class="container">
      <div class="header"><h1>📊 ${reportTitle}</h1>
        <div>Generated: ${currentDate.toLocaleString('en-IN')} • Period: ${period.toUpperCase()} • Status: Live Data</div>
      </div>
      <div class="meta-info">
        <div class="meta-card"><h3>Report Period</h3><div class="value">${period.toUpperCase()}</div></div>
        <div class="meta-card"><h3>Data Points</h3><div class="value">${timeBasedData.length}</div></div>
        <div class="meta-card"><h3>Growth Rate</h3><div class="value">${growthRate.toFixed(1)}%</div></div>
        <div class="meta-card"><h3>Report Score</h3><div class="value">A+</div></div>
      </div>
      <h2 class="section-title">Executive Summary</h2>
      <div class="kpi-grid">
        <div class="kpi-card"><div class="kpi-value">${fmtIN.format(blob.kpis.totals.customers)}</div><div>Total Customers</div></div>
        <div class="kpi-card"><div class="kpi-value">${fmtIN.format(blob.kpis.totals.orders)}</div><div>Total Orders</div></div>
        <div class="kpi-card"><div class="kpi-value">${fmtINRC.format(blob.kpis.financials.grossRevenue)}</div><div>Gross Revenue</div></div>
        <div class="kpi-card"><div class="kpi-value">${fmtINRC.format(blob.kpis.rates.aov)}</div><div>Average Order Value</div></div>
      </div>
      <h2 class="section-title">Detailed Metrics</h2>
      <table class="data-table"><thead><tr><th>Product Category</th><th>Revenue</th><th>Orders</th><th>Units</th><th>Share</th></tr></thead>
      <tbody>
        ${categoryData.map(cat => `
          <tr>
            <td><strong>${cat.category}</strong></td>
            <td>${fmtINRC.format(cat.revenue)}</td>
            <td>${fmtIN.format(cat.orders)}</td>
            <td>${fmtIN.format(cat.units)}</td>
            <td>${((cat.revenue / blob.kpis.financials.grossRevenue) * 100).toFixed(1)}%</td>
          </tr>`).join('')}
      </tbody></table>
      <div class="footer"><div>Projected 30-day revenue: <strong>${fmtINRC.format(avgDailyRevenue * 30 * 1.15)}</strong></div></div>
    </div></body></html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
}

function ChartSkeleton({ height = "h-80" }: { height?: string }) {
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


function TopControls({
  selectedPeriod,
  onPeriodChange,
  isLoading,
  onExport,
  selectedDashboard,
  onDashboardChange,
}: {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  isLoading: boolean;
  onExport: () => void;
  selectedDashboard: string;
  onDashboardChange: (db: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Time Period */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-600" />
        <span className="text-gray-700 font-medium">Time Period:</span>
      </div>
      <Select value={selectedPeriod} onValueChange={onPeriodChange} disabled={isLoading}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="1w">1 Week</SelectItem>
          <SelectItem value="1m">1 Month</SelectItem>
          <SelectItem value="6m">6 Months</SelectItem>
          <SelectItem value="1y">1 Year</SelectItem>
        </SelectContent>
      </Select>

      {/* Dashboards Toggle — same UI & right next to time period */}
      <div className="flex items-center gap-2 ml-2">
        <Calendar className="h-5 w-5 text-gray-600" />
        <span className="text-gray-700 font-medium">Dashboards:</span>
      </div>
      <Select value={selectedDashboard} onValueChange={onDashboardChange} disabled={isLoading}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DummyDB">DummyDB</SelectItem>
          <SelectItem value="BackendDB">BackendDB</SelectItem>
        </SelectContent>
      </Select>

      {isLoading && <RefreshCw className="h-4 w-4 text-cyan-500 animate-spin" />}
      <div className="ml-auto flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 hover:bg-cyan-50 hover:border-cyan-300 transition-colors"
          onClick={onExport}
          disabled={isLoading}
        >
          <FileDown className="h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="outline" size="sm" className="gap-2 hover:bg-green-50 hover:border-green-300 transition-colors">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>
    </div>
  );
}

// KPI Row
function KpiRow({ isLoading }: { isLoading: boolean }) {
  const kpis = blob.kpis;
  const last7Days = blob.ordersByDate_30d.slice(-7).map((item, index) => ({
    ...item,
    day: index + 1
  }));
  
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white border-2 border-gray-100 shadow-lg">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-12 w-full mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid gap-6 md:grid-cols-4 mb-8">
      <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-500" />
              <CardTitle className="text-sm font-semibold text-black">Total Customers</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 animate-pulse">
              <TrendingUp className="h-3 w-3 mr-1" />+12.3%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-black mb-2">{fmtIN.format(kpis.totals.customers)}</div>
          <div className="h-12 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <Line type="monotone" dataKey="orders" stroke={COLORS.cyan} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-600">🚀 Growing customer base with 12.3% increase this month</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-sm font-semibold text-black">Total Orders</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 animate-pulse">
              <TrendingUp className="h-3 w-3 mr-1" />+8.7%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-black mb-2">{fmtIN.format(kpis.totals.orders)}</div>
          <div className="h-12 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={last7Days}>
                <defs>
                  <linearGradient id="orderGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.yellow} stopOpacity={0.8}/>
                    <stop offset="100%" stopColor={COLORS.yellow} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="orders" stroke={COLORS.yellow} fill="url(#orderGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-600">📈 Consistent order growth across all channels</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <CardTitle className="text-sm font-semibold text-black">Gross Revenue</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 animate-pulse">
              <TrendingUp className="h-3 w-3 mr-1" />+15.2%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-black mb-2">{fmtINRC.format(kpis.financials.grossRevenue)}</div>
          <div className="h-12 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <Line type="monotone" dataKey="revenue" stroke={COLORS.green} strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-600">🚀 Revenue hitting new peaks with strong Q3 performance</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-black" />
              <CardTitle className="text-sm font-semibold text-black">Average Order Value</CardTitle>
            </div>
            <Badge variant="outline" className="border-yellow-400 text-yellow-600 animate-pulse">
              <TrendingDown className="h-3 w-3 mr-1" />-2.1%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-black mb-2">{fmtINRC.format(kpis.rates.aov)}</div>
          <div className="h-12 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last7Days.slice(-4)}>
                <Bar dataKey="orders" fill={COLORS.black} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-600">📉 Slight dip due to promotional campaigns, recovering next month</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Insight Card
function InsightCard({ icon: Icon, title, insight, trend, color }: {
  icon: React.ComponentType<{ className?: string; }>;
  title: string;
  insight: string;
  trend?: string;
  color: string;
}) {
  return (
    <div className={`p-4 rounded-lg border-l-4 border-${color}-400 bg-gradient-to-r from-${color}-50 to-white mb-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-6 w-6 text-${color}-500 mt-1`} />
        <div className="flex-1">
          <h4 className="font-bold text-black mb-1">{title}</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <TrendingUp className={`h-4 w-4 text-${color}-500`} />
              <span className={`text-xs font-semibold text-${color}-600`}>{trend}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Main Dashboard
export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'1w' | '1m' | '6m' | '1y'>('1m');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<'DummyDB' | 'BackendDB'>('DummyDB');
  const dashboardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
      setIsLoading(false);
    };
    loadData();
  }, []);

  const handlePeriodChange = async (period: '1w' | '1m' | '6m' | '1y') => {
    setRefreshing(true);
    setSelectedPeriod(period);
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    setRefreshing(false);
  };

  // NEW: dashboards toggle handler
  const handleDashboardChange = (db: string) => {
    const val = (db === 'BackendDB') ? 'BackendDB' : 'DummyDB';
    setSelectedDashboard(val);
    if (val === 'BackendDB') {
      navigate('/backend');
    } else {
      navigate('/dashboard');
    }
  };

  const handleExport = () => {
    exportToPDF(dashboardRef, selectedPeriod);
  };

  const timeBasedData = generateTimeBasedData(selectedPeriod);
  const categoryData = blob.revenueByCategory.map(cat => ({
    name: cat.category,
    value: cat.revenue,
    percentage: ((cat.revenue / blob.kpis.financials.grossRevenue) * 100).toFixed(1)
  }));
  const salesFunnelData = [
    { name: 'Website Visitors', value: 145000, fill: '#06b6d4' },
    { name: 'Product Views', value: 89000, fill: '#0891b2' },
    { name: 'Add to Cart', value: 34000, fill: '#0e7490' },
    { name: 'Checkout Started', value: 28000, fill: '#155e75' },
    { name: 'Orders Completed', value: 23500, fill: '#164e63' }
  ];
  const hourlyPerformanceData = Array.from({ length: 24 }, (_, hour) => {
    const baseTraffic = 1000 + Math.sin((hour - 6) * Math.PI / 12) * 800;
    const peakMultiplier = hour >= 10 && hour <= 22 ? 1.8 : 1;
    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      traffic: Math.max(200, Math.floor(baseTraffic * peakMultiplier + Math.random() * 300)),
      conversion: 2.1 + Math.random() * 1.8 + (hour >= 20 && hour <= 23 ? 0.5 : 0),
    };
  });
  const productPerformanceData = blob.topProducts_20.slice(0, 8).map(product => ({
    name: product.title.split(' ').slice(0, 2).join(' '),
    revenue: product.revenue,
    units: product.quantitySold,
  }));
  const cohortRetentionData = blob.cohorts_monthly_6m.map(cohort => ({
    month: cohort.cohort,
    newCustomers: cohort.customers,
    month1: cohort.repeatPct_30d,
    month2: cohort.repeatPct_60d,
    month3: cohort.repeatPct_90d,
    ltv: cohort.ltv90d
  }));

  return (
    <div className='min-h-screen bg-gray-50' ref={dashboardRef}>
      {/* Header */}
      <div className='w-full px-8 py-6 bg-white shadow-sm border-b'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <img
              src={user?.picture ?? 'https://i.pravatar.cc/80?img=3'}
              alt='avatar'
              className='w-12 h-12 rounded-full border-2 border-cyan-200'
            />
            <div>
              <h1 className='text-3xl font-bold text-black'> Analytics Dashboard</h1>
              <div className='text-sm text-gray-600'>
                Welcome back, <span className="font-semibold text-cyan-600">{user?.name ?? 'Guest'}</span> • 
                <span className="text-green-600 ml-1">Enterprise Plan</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="bg-green-100 text-green-700 px-3 py-1 text-sm animate-pulse">
              🔴 Live Data • {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </Badge>
            <button 
              onClick={logout} 
              className='px-4 py-2 rounded-lg border-2 border-gray-200 text-black hover:bg-gray-50 transition-colors font-medium'
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='w-full px-8 py-8'>
        {/* Intro */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-2 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            Business Performance Overview
          </h2>
          <p className="text-gray-600 text-lg">Real-time insights into your e-commerce empire • 
            <span className="font-semibold text-cyan-600">September 2025</span>
          </p>
        </div>

        {/* Time Period + Dashboards Toggle (beside each other) */}
        <TopControls
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          isLoading={refreshing}
          onExport={handleExport}
          selectedDashboard={selectedDashboard}
          onDashboardChange={handleDashboardChange}
        />

        {/* KPI Row */}
        <KpiRow isLoading={isLoading} />

        {/* Insights */}
        <div className="mb-8 grid md:grid-cols-3 gap-4">
          <InsightCard 
            icon={TrendingUpIcon}
            title="Growth Momentum"
            insight="Your revenue is accelerating at 15.2% month-over-month, outpacing industry average of 8.3%"
            trend="+23.5% vs last month"
            color="green"
          />
          <InsightCard 
            icon={Users}
            title="Customer Acquisition"
            insight="New customer acquisition cost decreased by 18% while lifetime value increased by 12%"
            trend="+2,340 new customers today"
            color="cyan"
          />
          <InsightCard 
            icon={Target}
            title="Market Opportunity"
            insight="Equipment category showing 45% higher margins. Consider expanding inventory in this segment"
            trend="₹4.2Cr potential revenue"
            color="yellow"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue & Orders */}
          {isLoading || refreshing ? (
            <ChartSkeleton height="h-96" />
          ) : (
            <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-cyan-500" />
                    <CardTitle className="text-lg font-bold text-black">Revenue & Orders Trend</CardTitle>
                  </div>
                  <Badge className="bg-cyan-100 text-cyan-700">Time Series</Badge>
                </div>
                <p className="text-gray-600 text-sm">Track revenue and order patterns over {selectedPeriod}</p>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={timeBasedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="dateFormatted" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="revenueInCrores" fill={COLORS.cyan} name="Revenue (₹Cr)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="ordersInK" stroke={COLORS.yellow} strokeWidth={3} name="Orders (K)" dot={{ r: 6, fill: COLORS.yellow }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Category Distribution */}
          {isLoading || refreshing ? (
            <ChartSkeleton height="h-96" />
          ) : (
            <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg font-bold text-black">Revenue by Category</CardTitle>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Distribution</Badge>
                </div>
                <p className="text-gray-600 text-sm">Product category performance breakdown</p>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.gradient[index % COLORS.gradient.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [fmtINRC.format(value), 'Revenue']}
                      contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Advanced Analytics */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-500" />
            Ultra-Advanced Business Intelligence
          </h3>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Customer Segments */}
            {isLoading || refreshing ? (
              <ChartSkeleton />
            ) : (
              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      <CardTitle className="text-sm font-bold text-black">Customer Segments</CardTitle>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700 text-xs">Premium</Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <Treemap data={[
                      { name: 'VIP Platinum', value: 89000000 },
                      { name: 'Gold Members', value: 156000000 },
                      { name: 'Silver Members', value: 98000000 },
                      { name: 'Regular Customers', value: 91000000 }
                    ]} dataKey="value" aspectRatio={4/3} />
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Sales Funnel */}
            {isLoading || refreshing ? (
              <ChartSkeleton />
            ) : (
              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-sm font-bold text-black">Conversion Funnel</CardTitle>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 text-xs">Analytics</Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <FunnelChart>
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                      <Funnel
                        dataKey="value"
                        data={[
                          { name: 'Website Visitors', value: 145000 },
                          { name: 'Product Views', value: 89000 },
                          { name: 'Add to Cart', value: 34000 },
                          { name: 'Checkout Started', value: 28000 },
                          { name: 'Orders Completed', value: 23500 }
                        ]}
                        isAnimationActive
                      >
                        <LabelList position="center" fill="#fff" stroke="none" fontSize={12} />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* 24h Performance */}
            {isLoading || refreshing ? (
              <ChartSkeleton />
            ) : (
              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-sm font-bold text-black">24h Performance</CardTitle>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 text-xs">Real-time</Badge>
                  </div>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={hourlyPerformanceData.filter((_, i) => i % 3 === 0)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                      <YAxis yAxisId="left" stroke="#64748b" fontSize={10} />
                      <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '8px' }} />
                      <Bar yAxisId="left" dataKey="traffic" fill={COLORS.cyan} opacity={0.7} />
                      <Line yAxisId="right" type="monotone" dataKey="conversion" stroke={COLORS.yellow} strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Product Performance */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-500" />
            Product Performance Intelligence
          </h3>
          <div className="grid lg:grid-cols-2 gap-6">
            {isLoading || refreshing ? (
              <ChartSkeleton height="h-96" />
            ) : (
              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gem className="h-5 w-5 text-indigo-500" />
                      <CardTitle className="text-lg font-bold text-black">Revenue vs Units Matrix</CardTitle>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700">Advanced</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">Product performance correlation analysis</p>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={productPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="units" name="Units Sold" stroke="#64748b" fontSize={12} />
                      <YAxis dataKey="revenue" name="Revenue" stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'revenue' ? fmtINRC.format(value) : fmtIN.format(value),
                          name === 'revenue' ? 'Revenue' : 'Units'
                        ]}
                        labelFormatter={(name) => `Product: ${name}`}
                        contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Scatter fill={COLORS.cyan} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {isLoading || refreshing ? (
              <ChartSkeleton height="h-96" />
            ) : (
              <Card className="bg-white border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-red-500" />
                      <CardTitle className="text-lg font-bold text-black">Customer Retention</CardTitle>
                    </div>
                    <Badge className="bg-red-100 text-red-700">Behavioral</Badge>
                  </div>
                  <p className="text-gray-600 text-sm">Monthly cohort retention patterns</p>
                </CardHeader>
                <CardContent className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cohortRetentionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retention']}
                        contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '8px' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="month1" stroke="#22c55e" strokeWidth={2} name="Month 1" />
                      <Line type="monotone" dataKey="month2" stroke="#eab308" strokeWidth={2} name="Month 2" />
                      <Line type="monotone" dataKey="month3" stroke="#ef4444" strokeWidth={2} name="Month 3" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            <Medal className="h-5 w-5 text-gold-500" />
            Executive Summary & Strategic Recommendations
          </h3>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-br from-slate-50 to-gray-100 border-2 border-slate-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Business Health Score: A+
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Revenue Growth</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-5/6"></div>
                      </div>
                      <span className="text-sm font-bold text-green-600">92%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Customer Retention</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full w-4/5"></div>
                      </div>
                      <span className="text-sm font-bold text-blue-600">87%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Operational Efficiency</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full w-11/12"></div>
                      </div>
                      <span className="text-sm font-bold text-purple-600">95%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Market Competitiveness</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full w-5/6"></div>
                      </div>
                      <span className="text-sm font-bold text-orange-600">89%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-green-100 border-2 border-emerald-200 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-black flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-500" />
                  Strategic Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-emerald-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-sm text-black">Expand Equipment Category</div>
                      <div className="text-xs text-gray-600">45% higher margins - potential ₹5.2Cr additional revenue</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-sm text-black">Optimize Mobile Experience</div>
                      <div className="text-xs text-gray-600">68% mobile traffic - A/B test checkout flow improvements</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-sm text-black">International Expansion</div>
                      <div className="text-xs text-gray-600">23% new customers from emerging markets - scale operations</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-semibold text-sm text-black">AI-Powered Personalization</div>
                      <div className="text-xs text-gray-600">Implement ML recommendations - estimated +₹890 AOV increase</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 p-8 bg-gradient-to-r from-slate-100 to-gray-100 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-shadow">
          <div className="text-center mb-6">
            <h4 className="text-2xl font-bold text-black mb-2 flex items-center justify-center gap-2">
              🎯 Today's Mission Status
              <Badge className="bg-green-100 text-green-700 animate-bounce">LIVE</Badge>
            </h4>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="font-bold text-cyan-600 text-2xl">{fmtINRC.format(blob.kpis.last24h.revenue)}</div>
              <div className="text-gray-600 text-sm">24h Revenue</div>
              <div className="text-xs text-green-600 mt-1">+18% vs yesterday</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="font-bold text-yellow-600 text-2xl">{fmtIN.format(blob.kpis.last24h.orders)}</div>
              <div className="text-gray-600 text-sm">24h Orders</div>
              <div className="text-xs text-green-600 mt-1">+12% vs yesterday</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="font-bold text-green-600 text-2xl">{fmtIN.format(blob.kpis.last24h.newCustomers)}</div>
              <div className="text-gray-600 text-sm">New Customers</div>
              <div className="text-xs text-green-600 mt-1">+25% vs yesterday</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="font-bold text-black text-2xl">₹{(blob.kpis.last24h.revenue/blob.kpis.last24h.orders).toFixed(0)}</div>
              <div className="text-gray-600 text-sm">24h AOV</div>
              <div className="text-xs text-green-600 mt-1">+5% vs yesterday</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
