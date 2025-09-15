import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { blob } from "@/data/tenatBlob";
import { fmtINRC } from "@/lib/format";

const data = blob.channels.map(c => ({ name: c.name, value: c.revenue }));

// Tailwind-friendly neutral palette
const COLORS = ["#22d3ee", "#8b5cf6", "#f472b6", "#10b981", "#f59e0b"];

export default function ChannelsPie() {
  return (
    <Card className="border-neutral-800 bg-neutral-950">
      <CardHeader><CardTitle>Revenue by Channel</CardTitle></CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius="80%">
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={{ background: "#0b0b0b", border: "1px solid #222" }}
                     formatter={(v, n) => [fmtINRC.format(Number(v)), n as string]}/>
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
