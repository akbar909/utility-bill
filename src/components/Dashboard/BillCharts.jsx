import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const BillCharts = ({ data }) => {
  const breakdownData = [
    { name: 'Base Cost', value: data.breakdown.base, color: '#0ea5e9' }, // primary-500
    { name: 'Tax', value: data.breakdown.tax, color: '#ef4444' }, // red-500
    { name: 'Extra Charges', value: data.breakdown.extras, color: '#f59e0b' }, // amber-500
  ].filter(item => item.value > 0);

  // Simulation data (since we only have one bill, we mock a comparison)
  const comparisonData = [
      { name: 'Previous', amount: data.total * 0.85 },
      { name: 'Current', amount: data.total },
      { name: 'Average', amount: data.total * 0.9 },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 h-full">
      <div className="h-64">
        <h4 className="text-sm font-medium text-slate-500 mb-4 text-center">Cost Breakdown</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={breakdownData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {breakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `PKR ${value.toLocaleString()}`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="h-64">
        <h4 className="text-sm font-medium text-slate-500 mb-4 text-center">Comparison (Estimated)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <Tooltip 
              formatter={(value) => `PKR ${value.toLocaleString()}`}
              cursor={{fill: '#f1f5f9'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="amount" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BillCharts;
