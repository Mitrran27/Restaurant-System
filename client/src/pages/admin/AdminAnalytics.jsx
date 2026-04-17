import { useState, useEffect } from 'react';
import { analyticsAPI, branchAPI } from '../../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#8B5E3C', '#C4956A', '#E8C98A', '#F5E9CC', '#d4a853'];

export default function AdminAnalytics() {
  const [peakHours, setPeakHours] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [orderTypes, setOrderTypes] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    branchAPI.getAll().then(res => setBranches(res.data.data));
  }, []);

  useEffect(() => {
    const p = branchId ? { branchId } : {};
    setLoading(true);
    Promise.all([
      analyticsAPI.getPeakHours(p),
      analyticsAPI.getBestSellers({ limit: 10, ...p }),
      analyticsAPI.getRevenue({ days: 30, ...p }),
      analyticsAPI.getOrderTypes(p),
    ]).then(([ph, bs, rev, ot]) => {
      setPeakHours(ph.data.data);
      setBestSellers(bs.data.data);
      setRevenue(rev.data.data);
      setOrderTypes(ot.data.data);
    }).finally(() => setLoading(false));
  }, [branchId]);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="page-title">Analytics</h1>
        {branches.length > 1 && (
          <select value={branchId} onChange={e => setBranchId(e.target.value)} className="input w-auto text-sm">
            <option value="">All Branches</option>
            {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-6">
          {Array(4).fill(0).map((_, i) => <div key={i} className="card h-72 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Revenue 30d */}
          <div className="card p-6">
            <h2 className="section-title mb-5">Revenue (Last 30 Days)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E9CC" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#C4956A' }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#C4956A' }} tickFormatter={v => `$${v}`} />
                <Tooltip formatter={v => [`$${parseFloat(v).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ fontFamily: '"DM Sans"', borderRadius: 12, border: '1px solid #E8C98A' }} />
                <Line type="monotone" dataKey="revenue" stroke="#8B5E3C" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Peak Hours */}
            <div className="card p-6">
              <h2 className="section-title mb-5">Peak Hours (Last 30 Days)</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={peakHours.filter(h => h.orders > 0 || h.hour % 4 === 0)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5E9CC" />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#C4956A' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#C4956A' }} />
                  <Tooltip contentStyle={{ fontFamily: '"DM Sans"', borderRadius: 12, border: '1px solid #E8C98A' }} />
                  <Bar dataKey="orders" fill="#8B5E3C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Order Types */}
            <div className="card p-6">
              <h2 className="section-title mb-5">Orders by Type</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={orderTypes} dataKey="count" nameKey="type" cx="50%" cy="50%"
                    outerRadius={95} label={({ type, percent }) => `${type.replace('_',' ')} ${(percent*100).toFixed(0)}%`}
                    labelLine={{ stroke: '#C4956A' }}>
                    {orderTypes.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontFamily: '"DM Sans"', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Best Sellers */}
          <div className="card p-6">
            <h2 className="section-title mb-5">Top 10 Best Sellers</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bestSellers} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5E9CC" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#C4956A' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#2C1810' }} width={160} />
                <Tooltip contentStyle={{ fontFamily: '"DM Sans"', borderRadius: 12, border: '1px solid #E8C98A' }} />
                <Bar dataKey="totalSold" fill="#C4956A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
