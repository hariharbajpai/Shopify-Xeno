import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { blob } from "@/data/tenatBlob";
import { fmtIN } from "@/lib/format";

const data = blob.funnel.last7d.map((x, i, arr) => {
  const base = arr[0].count;
  return {
    stage: x.stage,
    count: x.count,
    dropFromStart: Number(((1 - x.count/base) * 100).toFixed(1))
  };
});

export default function FunnelBars() {
  return (
    <Card className="border-neutral-800 bg-neutral-950">
      <CardHeader><CardTitle>Acquisition Funnel (Last 7d)</CardTitle></CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data} margin={{ left: 24, right: 24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a"/>
            <XAxis type="number" tick={{ fill: "#aaa" }}/>
            <YAxis dataKey="stage" type="category" tick={{ fill: "#aaa" }} width={140}/>
            <Tooltip
              contentStyle={{ background: "#0b0b0b", border: "1px solid #222" }}
              formatter={(v, n) => n === "count" ? fmtIN.format(Number(v)) : `${v}%`}
            />
            <Bar dataKey="count" fill="#22d3ee" radius={[8,8,8,8]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
