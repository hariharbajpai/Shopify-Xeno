import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { blob } from "@/data/tenatBlob";
import { fmtINRC } from "@/lib/format";

export default function RecentOrdersTable() {
  const rows = blob.recentOrders_20;
  return (
    <Card className="border-neutral-800 bg-neutral-950">
      <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-neutral-300 border-b border-neutral-800">
            <tr>
              <th className="py-2">Order</th>
              <th>Customer</th>
              <th>Channel</th>
              <th>Total</th>
              <th>Created</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="[&_tr:hover]:bg-neutral-900/50">
            {rows.map(r => (
              <tr key={r.id} className="border-b border-neutral-900">
                <td className="py-2">{r.name}</td>
                <td>{r.customer}</td>
                <td>{r.channel}</td>
                <td>{fmtINRC.format(r.totalPrice)}</td>
                <td>{new Date(r.createdAt).toLocaleString("en-IN")}</td>
                <td className="uppercase text-xs tracking-wide">{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
