import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { blob } from "@/data/tenatBlob";
import { fmtINRC } from "@/lib/format";

const data = blob.topProducts_20.slice(0, 10).map(p => ({
  title: p.title, revenue: p.revenue, qty: p.quantitySold
}));

export default function TopProductsBar() {
  return (
    <Card className="border-neutral-800 bg-neutral-950">
      <CardHeader><CardTitle>Top Products (Revenue)</CardTitle></CardHeader>
      <CardContent className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4"/>
                <stop offset="100%" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a"/>
            <XAxis dataKey="title" tick={{ fill: "#aaa" }} interval={0} angle={-20} height={70}/>
            <YAxis tick={{ fill: "#aaa" }} width={100}/>
            <Tooltip contentStyle={{ background: "#0b0b0b", border: "1px solid #222" }}
                     formatter={(v) => fmtINRC.format(Number(v))}/>
            <Bar dataKey="revenue" fill="url(#grad)" radius={[8,8,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
