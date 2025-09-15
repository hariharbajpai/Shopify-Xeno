import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fmtIN, fmtINRC } from "@/lib/format";
import { blob } from "@/data/tenatBlob";

export default function KpiRow() {
  const t = blob.kpis;
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card className="bg-gradient-to-br from-neutral-900 to-black border-neutral-800">
        <CardHeader><CardTitle className="text-sm text-neutral-400">Customers</CardTitle></CardHeader>
        <CardContent className="text-2xl font-semibold">{fmtIN.format(t.totals.customers)}</CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-neutral-900 to-black border-neutral-800">
        <CardHeader><CardTitle className="text-sm text-neutral-400">Orders</CardTitle></CardHeader>
        <CardContent className="text-2xl font-semibold">{fmtIN.format(t.totals.orders)}</CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-neutral-900 to-black border-neutral-800">
        <CardHeader><CardTitle className="text-sm text-neutral-400">Gross Revenue</CardTitle></CardHeader>
        <CardContent className="text-2xl font-semibold">{fmtINRC.format(t.financials.grossRevenue)}</CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-neutral-900 to-black border-neutral-800">
        <CardHeader><CardTitle className="text-sm text-neutral-400">AOV</CardTitle></CardHeader>
        <CardContent className="text-2xl font-semibold">{fmtINRC.format(t.rates.aov)}</CardContent>
      </Card>
    </div>
  );
}
