export function DashboardOverview() {
  return (
    <section className="p-4 md:p-6 space-y-6">
      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Today Sales" value="LKR 245,300" sub="↑ 12% vs yesterday" />
        <KpiCard title="Transactions" value="128" sub="Avg basket LKR 1,916" />
        <KpiCard title="Low Stock" value="14 items" sub="3 critical" />
        <KpiCard title="Active Repairs" value="9" sub="2 awaiting parts" />
      </div>

      {/* Main grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: charts / trends placeholder */}
        <div className="lg:col-span-2 rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Sales Trend</h2>
            <select className="text-sm border rounded-xl px-2 py-1">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>This month</option>
            </select>
          </div>

          <div className="mt-4 h-[260px] rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
            Chart placeholder (line/bar)
          </div>
        </div>

        {/* Right: alerts */}
        <div className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold">Alerts</h2>
          <div className="mt-3 space-y-3">
            <AlertItem title="Low stock: iPhone 13 screen" meta="2 left • reorder suggested" />
            <AlertItem title="Refund pending approval" meta="INV-00921 • LKR 12,500" />
            <AlertItem title="Repair overdue" meta="IMEI 356… • 3 days" />
          </div>

          <button className="mt-4 w-full py-2 rounded-xl border hover:bg-gray-50 text-sm">
            View all alerts
          </button>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Activity</h2>
          <button className="text-sm px-3 py-2 rounded-xl border hover:bg-gray-50">
            Export
          </button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="text-gray-500">
              <tr className="border-b">
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Reference</th>
                <th className="text-left py-2">User</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <Row time="10:42" type="Sale" reference="INV-01024" user="Cashier A" amount="LKR 18,900" />
              <Row time="10:10" type="Stock Adj" reference="PROD-331" user="Manager" amount="—" />
              <Row time="09:55" type="Repair" reference="REP-1120" user="Tech B" amount="LKR 6,500" />
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function KpiCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{sub}</div>
    </div>
  );
}

function AlertItem({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="rounded-xl border p-3 hover:bg-gray-50">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-gray-500 mt-1">{meta}</div>
    </div>
  );
}

function Row({
  time,
  type,
  reference,
  user,
  amount,
}: {
  time: string;
  type: string;
  reference: string;
  user: string;
  amount: string;
}) {
  return (
    <tr className="border-b last:border-b-0">
      <td className="py-2">{time}</td>
      <td className="py-2">{type}</td>
      <td className="py-2">{reference}</td>
      <td className="py-2">{user}</td>
      <td className="py-2 text-right">{amount}</td>
    </tr>
  );
}
