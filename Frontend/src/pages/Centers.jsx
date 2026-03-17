import { useState, useCallback } from 'react';
import { getCenters, addCenter, updateCenter } from '@/data/mockData';
import { Plus, X } from 'lucide-react';
export default function Centers() {
    const [centers, setCenters] = useState(getCenters);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ name: '', location: '', latitude: '', longitude: '', contactPerson: '', phone: '' });
    const refresh = useCallback(() => setCenters(getCenters()), []);
    const handleAdd = (e) => {
        e.preventDefault();
        if (editId) {
            updateCenter(editId, { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) });
            setEditId(null);
        }
        else {
            addCenter({ ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude) });
        }
        setForm({ name: '', location: '', latitude: '', longitude: '', contactPerson: '', phone: '' });
        setShowForm(false);
        refresh();
    };
    const handleEdit = (c) => {
        setForm({ name: c.name, location: c.location, latitude: String(c.latitude), longitude: String(c.longitude), contactPerson: c.contactPerson, phone: c.phone });
        setEditId(c.id);
        setShowForm(true);
    };
    return (<div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="command-header">Relief Centers</h1>
          <p className="system-label mt-1">{centers.length} CENTERS OPERATIONAL</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', location: '', latitude: '', longitude: '', contactPerson: '', phone: '' }); }} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? <><X className="w-4 h-4 mr-1 inline"/>Cancel</> : <><Plus className="w-4 h-4 mr-1 inline"/>Add Center</>}
        </button>
      </header>

      {showForm && (<form onSubmit={handleAdd} className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full block"/>
            {editId ? 'EDIT CENTER' : 'NEW RELIEF CENTER'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="system-label mb-1.5 block">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Location</label>
              <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Contact Person</label>
              <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="input-field" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Latitude</label>
              <input type="number" step="any" value={form.latitude} onChange={e => setForm({ ...form, latitude: e.target.value })} className="input-field font-mono" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Longitude</label>
              <input type="number" step="any" value={form.longitude} onChange={e => setForm({ ...form, longitude: e.target.value })} className="input-field font-mono" required/>
            </div>
          </div>
          <button type="submit" className="btn-primary">{editId ? 'Update Center' : 'Create Center'}</button>
        </form>)}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {centers.map(c => (<div key={c.id} className="stat-card space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-sm">{c.name}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.location}</div>
                </div>
              </div>
              <button onClick={() => handleEdit(c)} className="text-xs text-primary hover:underline">Edit</button>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div>Contact: {c.contactPerson}</div>
              <div>Phone: {c.phone}</div>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
            </div>
          </div>))}
      </div>
    </div>);
}
