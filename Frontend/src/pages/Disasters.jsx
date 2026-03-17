import { useState, useCallback } from 'react';
import { getDisasters, addDisaster, updateDisaster } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, AlertTriangle, MapPin } from 'lucide-react';
export default function Disasters() {
    const { user } = useAuth();
    const [disasters, setDisasters] = useState(getDisasters);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ type: '', location: '', latitude: '', longitude: '', severity: 'Medium', description: '' });
    const refresh = useCallback(() => setDisasters(getDisasters()), []);
    const handleAdd = (e) => {
        e.preventDefault();
        addDisaster({
            type: form.type,
            location: form.location,
            latitude: parseFloat(form.latitude) || 0,
            longitude: parseFloat(form.longitude) || 0,
            severity: form.severity,
            status: 'Active',
            description: form.description,
        });
        setForm({ type: '', location: '', latitude: '', longitude: '', severity: 'Medium', description: '' });
        setShowForm(false);
        refresh();
    };
    const handleStatusChange = (id, status) => {
        updateDisaster(id, { status });
        refresh();
    };
    const canCreate = user?.role === 'admin' || user?.role === 'coordinator';
    return (<div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="command-header">Disaster Events</h1>
          <p className="system-label mt-1">MONITORING {disasters.length} EVENTS</p>
        </div>
        {canCreate && (<button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
            {showForm ? <><X className="w-4 h-4 mr-1 inline"/>Cancel</> : <><Plus className="w-4 h-4 mr-1 inline"/>Report Disaster</>}
          </button>)}
      </header>

      {/* Add form */}
      {showForm && (<form onSubmit={handleAdd} className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-destructive rounded-full block"/>
            NEW DISASTER REPORT
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="system-label mb-1.5 block">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field" required>
                <option value="">Select type...</option>
                <option>Flood</option><option>Earthquake</option><option>Cyclone</option><option>Fire</option><option>Landslide</option><option>Tsunami</option>
              </select>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Location</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="City, Region" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Severity</label>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="input-field">
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="input-field font-mono" placeholder="0.0000" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="input-field font-mono" placeholder="0.0000" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Brief description"/>
            </div>
          </div>
          <button type="submit" className="btn-destructive">Submit Disaster Report</button>
        </form>)}

      {/* Disasters table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="table-header">Type</th>
                <th className="table-header">Location</th>
                <th className="table-header">Coordinates</th>
                <th className="table-header">Severity</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                {user?.role === 'admin' && <th className="table-header">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {disasters.map(d => (<tr key={d.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-3.5 h-3.5 ${d.status === 'Active' ? 'text-destructive' : 'text-muted-foreground'}`}/>
                      <span className="font-medium">{d.type}</span>
                    </div>
                  </td>
                  <td className="table-cell text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3"/>{d.location}
                    </div>
                  </td>
                  <td className="table-cell font-mono text-xs text-muted-foreground">{d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border severity-${d.severity.toLowerCase()}`}>{d.severity}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium status-${d.status.toLowerCase()}`}>{d.status}</span>
                  </td>
                  <td className="table-cell font-mono text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                  {user?.role === 'admin' && (<td className="table-cell">
                      <select value={d.status} onChange={e => handleStatusChange(d.id, e.target.value)} className="input-field text-xs py-1 px-2">
                        <option>Active</option><option>Contained</option><option>Resolved</option>
                      </select>
                    </td>)}
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
