import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDisasters, getDispatches, getInventory, getVolunteers, getCenters } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
const chartAxisStroke = 'hsl(var(--muted-foreground))';
const chartGridStroke = 'hsl(var(--border))';
const chartTooltipStyle = {
    backgroundColor: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    color: 'hsl(var(--popover-foreground))',
    fontSize: '12px',
};
export default function Dashboard() {
    const { user } = useAuth();
    if (user?.role === 'volunteer')
        return <VolunteerDashboard />;
    if (user?.role === 'coordinator')
        return <CoordinatorDashboard />;
    return <AdminDashboard />;
}
function AdminDashboard() {
    const data = useMemo(() => {
        const disasters = getDisasters();
        const inventory = getInventory();
        const volunteers = getVolunteers();
        const dispatches = getDispatches();
        const centers = getCenters();
        const activeDisasters = disasters.filter(d => d.status === 'Active').length;
        const deployedVols = volunteers.filter(v => v.availabilityStatus === 'Deployed').length;
        const pendingDispatches = dispatches.filter(d => d.status === 'Pending').length;
        const lowStockItems = inventory.filter(i => i.quantity <= i.threshold).length;
        const inventoryByCenter = centers.map(c => ({
            name: c.name.split(' ')[0],
            stock: inventory.filter(i => i.centerId === c.id).reduce((sum, i) => sum + i.quantity, 0),
        }));
        const severityData = [
            { name: 'Critical', value: disasters.filter(d => d.severity === 'Critical').length, color: '#ef4444' },
            { name: 'High', value: disasters.filter(d => d.severity === 'High').length, color: '#f97316' },
            { name: 'Medium', value: disasters.filter(d => d.severity === 'Medium').length, color: '#eab308' },
            { name: 'Low', value: disasters.filter(d => d.severity === 'Low').length, color: '#22c55e' },
        ].filter(d => d.value > 0);
        const dispatchTrend = [
            { day: 'Mon', dispatches: 3 },
            { day: 'Tue', dispatches: 5 },
            { day: 'Wed', dispatches: 2 },
            { day: 'Thu', dispatches: 7 },
            { day: 'Fri', dispatches: 4 },
            { day: 'Sat', dispatches: 6 },
            { day: 'Sun', dispatches: 1 },
        ];
        return { activeDisasters, deployedVols, pendingDispatches, lowStockItems, inventoryByCenter, severityData, dispatchTrend, totalVols: volunteers.length, totalCenters: centers.length };
    }, []);
    return (<div className="space-y-6">
      <header>
        <h1 className="command-header">Command Overview</h1>
        <p className="system-label mt-1">SYSTEM_STATUS: OPERATIONAL // ADMIN DASHBOARD</p>
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Events" value={data.activeDisasters}/>
        <StatCard label="Deployed Personnel" value={`${data.deployedVols}/${data.totalVols}`}/>
        <StatCard label="Pending Dispatches" value={data.pendingDispatches}/>
        <StatCard label="Low Stock Alerts" value={data.lowStockItems}/>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory by center */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="system-label mb-4">Resource Allocation</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.inventoryByCenter}>
                <XAxis dataKey="name" stroke={chartAxisStroke} fontSize={11}/>
                <YAxis stroke={chartAxisStroke} fontSize={11}/>
                <Tooltip contentStyle={chartTooltipStyle}/>
                <Bar dataKey="stock" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity distribution */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="system-label mb-4">Severity Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {data.severityData.map((entry, i) => (<Cell key={i} fill={entry.color}/>))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {data.severityData.map(d => (<div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}/>
                {d.name} ({d.value})
              </div>))}
          </div>
        </div>

        {/* Dispatch trend */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="system-label mb-4">Dispatch Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.dispatchTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke}/>
                <XAxis dataKey="day" stroke={chartAxisStroke} fontSize={11}/>
                <YAxis stroke={chartAxisStroke} fontSize={11}/>
                <Tooltip contentStyle={chartTooltipStyle}/>
                <Line type="monotone" dataKey="dispatches" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ fill: 'hsl(142 71% 45%)' }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent disasters */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="system-label">Recent Disaster Events</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="table-header">Type</th>
                <th className="table-header">Location</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody>
              {getDisasters().slice(0, 5).map(d => (<tr key={d.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="table-cell font-medium">{d.type}</td>
                  <td className="table-cell text-muted-foreground">{d.location}</td>
                  <td className="table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border severity-${d.severity.toLowerCase()}`}>
                      {d.severity}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium status-${d.status.toLowerCase()}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
function VolunteerDashboard() {
    const { user } = useAuth();
    const disasters = getDisasters().filter(d => d.status === 'Active');
    const dispatches = getDispatches();
    // Find assignments related to this volunteer (mock: show all for demo)
    const myDispatches = dispatches.filter(d => d.status !== 'Delivered').slice(0, 3);
    return (<div className="space-y-6">
      <header>
        <h1 className="command-header">Volunteer Dashboard</h1>
        <p className="system-label mt-1">WELCOME, {user?.name?.toUpperCase()} // FIELD STATUS</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Active Disasters" value={disasters.length}/>
        <StatCard label="My Assignments" value={myDispatches.length}/>
        <StatCard label="Status" value="Available"/>
      </div>

      {/* Active Disasters */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="system-label">Active Disaster Zones</h3>
        </div>
        <div className="divide-y divide-border">
          {disasters.map(d => (<div key={d.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{d.type}</span>
                <span className="text-muted-foreground text-sm ml-2">— {d.location}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold border severity-${d.severity.toLowerCase()}`}>{d.severity}</span>
            </div>))}
        </div>
      </div>

      {/* My assignments */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="system-label">Current Assignments</h3>
        </div>
        <div className="divide-y divide-border">
          {myDispatches.length === 0 && <div className="px-4 py-6 text-center text-sm text-muted-foreground">No active assignments</div>}
          {myDispatches.map(d => (<div key={d.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <span className="font-medium text-sm">{d.itemName} × {d.quantity}</span>
                <span className="text-muted-foreground text-sm ml-2">→ {d.destination}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${d.status === 'Pending' ? 'status-active' : 'status-contained'}`}>{d.status}</span>
            </div>))}
        </div>
      </div>
    </div>);
}
function CoordinatorDashboard() {
    const { user } = useAuth();
    const disasters = getDisasters();
    const dispatches = getDispatches();
    const activeCount = disasters.filter(d => d.status === 'Active').length;
    const inTransit = dispatches.filter(d => d.status === 'In Transit').length;
    const delivered = dispatches.filter(d => d.status === 'Delivered').length;
    return (<div className="space-y-6">
      <header>
        <h1 className="command-header">Coordinator Dashboard</h1>
        <p className="system-label mt-1">WELCOME, {user?.name?.toUpperCase()} // FIELD COORDINATION</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard label="Active Disasters" value={activeCount}/>
        <StatCard label="Relief Centers" value={getCenters().length}/>
        <StatCard label="In Transit" value={inTransit}/>
        <StatCard label="Delivered" value={delivered}/>
      </div>

      {/* Dispatch tracking */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="system-label">Dispatch Tracking</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="table-header">Item</th>
                <th className="table-header">Qty</th>
                <th className="table-header">Destination</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
              </tr>
            </thead>
            <tbody>
              {dispatches.map(d => (<tr key={d.id} className="hover:bg-secondary/20">
                  <td className="table-cell font-medium">{d.itemName}</td>
                  <td className="table-cell font-mono">{d.quantity}</td>
                  <td className="table-cell text-muted-foreground">{d.destination}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${d.status === 'Delivered' ? 'status-resolved' :
                d.status === 'In Transit' ? 'status-contained' : 'status-active'}`}>{d.status}</span>
                  </td>
                  <td className="table-cell font-mono text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
function StatCard({ label, value }) {
    return (<div className="stat-card space-y-1">
      <div>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">{label}</p>
        <p className="text-2xl font-mono font-bold text-foreground">{value}</p>
      </div>
    </div>);
}
