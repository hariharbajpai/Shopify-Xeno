import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from "recharts";
import { blob } from "@/data/tenatBlob";
import { d, fmtINRC } from "@/lib/format";

const data = blob.ordersByDate_30d.map(x => ({ ...x, label: d(x.date) }));

export default function OrdersLine() {
  return (
    <Card className="border-neutral-800 bg-neutral-950">
      <CardHeader><CardTitle>Daily Orders & Revenue (30d)</CardTitle></CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
            <defs>
              <linearGradient id="revGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="white" stopOpacity={0.25}/>
                <stop offset="100%" stopColor="white" stopOpacity={0}/>
              </linearGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="3.2"/></filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a"/>
            <XAxis dataKey="label" tick={{ fill: "#aaa" }}/>
            <YAxis yAxisId="left" tick={{ fill: "#aaa" }} width={70}/>
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#aaa" }} width={90}/>
            <Tooltip
              contentStyle={{ background: "#0b0b0b", border: "1px solid #222" }}
              formatter={(val, name) => name === "revenue" ? fmtINRC.format(Number(val)) : val}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area type="monotone" yAxisId="right" dataKey="revenue" stroke="transparent" fill="url(#revGlow)"/>
            <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2}/>
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}