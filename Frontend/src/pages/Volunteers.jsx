import { useState, useCallback } from 'react';
import { getVolunteers, addVolunteer, updateVolunteer, getCenters } from '@/data/mockData';
import { Plus, X, MapPin } from 'lucide-react';
export default function Volunteers() {
    const [volunteers, setVolunteers] = useState(getVolunteers);
    const [showForm, setShowForm] = useState(false);
    const centers = getCenters();
    const refresh = useCallback(() => setVolunteers(getVolunteers()), []);
    const [form, setForm] = useState({ name: '', phone: '', location: '', availabilityStatus: 'Available', assignedCenter: '', assignedTask: '' });
    const handleAdd = (e) => {
        e.preventDefault();
        addVolunteer(form);
        setForm({ name: '', phone: '', location: '', availabilityStatus: 'Available', assignedCenter: '', assignedTask: '' });
        setShowForm(false);
        refresh();
    };
    const handleStatusChange = (id, status) => {
        updateVolunteer(id, { availabilityStatus: status });
        refresh();
    };
    const handleAssign = (id, centerId) => {
        updateVolunteer(id, { assignedCenter: centerId });
        refresh();
    };
    const centerName = (id) => centers.find(c => c.id === id)?.name || '—';
    const statusColor = (s) => s === 'Available' ? 'status-resolved' : s === 'Deployed' ? 'status-contained' : 'status-active';
    return (<div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="command-header">Volunteer Management</h1>
          <p className="system-label mt-1">{volunteers.length} PERSONNEL // {volunteers.filter(v => v.availabilityStatus === 'Available').length} AVAILABLE</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? <><X className="w-4 h-4 mr-1 inline"/>Cancel</> : <><Plus className="w-4 h-4 mr-1 inline"/>Register Volunteer</>}
        </button>
      </header>

      {showForm && (<form onSubmit={handleAdd} className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full block"/>
            REGISTER VOLUNTEER
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="system-label mb-1.5 block">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Location</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" required/>
            </div>
          </div>
          <button type="submit" className="btn-primary">Register</button>
        </form>)}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Location</th>
                <th className="table-header">Status</th>
                <th className="table-header">Assigned Center</th>
                <th className="table-header">Task</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {volunteers.map(v => (<tr key={v.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{v.name.charAt(0)}</div>
                      <span className="font-medium">{v.name}</span>
                    </div>
                  </td>
                  <td className="table-cell font-mono text-xs text-muted-foreground">{v.phone}</td>
                  <td className="table-cell text-muted-foreground text-xs">
                    <div className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{v.location}</div>
                  </td>
                  <td className="table-cell">
                    <select value={v.availabilityStatus} onChange={e => handleStatusChange(v.id, e.target.value)} className={`px-2 py-0.5 rounded text-xs font-medium border-0 outline-none cursor-pointer ${statusColor(v.availabilityStatus)}`}>
                      <option>Available</option><option>Deployed</option><option>Unavailable</option>
                    </select>
                  </td>
                  <td className="table-cell text-xs text-muted-foreground">{centerName(v.assignedCenter)}</td>
                  <td className="table-cell text-xs text-muted-foreground">{v.assignedTask || '—'}</td>
                  <td className="table-cell">
                    <select value={v.assignedCenter} onChange={e => handleAssign(v.id, e.target.value)} className="input-field text-xs py-1 px-2 w-32">
                      <option value="">Unassigned</option>
                      {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
