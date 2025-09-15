import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { blob } from "@/data/tenatBlob";

const maxRevenue = Math.max(...blob.revenueByCategory.map(c => c.revenue));
const data = blob.revenueByCategory.map(c => ({
  category: c.category,
  score: Number(((c.revenue / maxRevenue) * 100).toFixed(1))
}));

export default function CategoryRadar() {
  return (
    <Card className="border-neutral-800 bg-neutral-950">
      <CardHeader><CardTitle>Category Strength (Indexed)</CardTitle></CardHeader>
      <CardContent className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="80%">
            <PolarGrid stroke="#2a2a2a" />
            <PolarAngleAxis dataKey="category" tick={{ fill: "#aaa" }}/>
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#777" }}/>
            <Tooltip contentStyle={{ background: "#0b0b0b", border: "1px solid #222" }}/>
            <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.35}/>
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
