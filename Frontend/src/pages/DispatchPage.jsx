import { useState, useCallback, useMemo } from 'react';
import { getDispatches, createDispatch, updateDispatchStatus, getInventory, getCenters, getVolunteers, getDisasters } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Truck, Package, AlertTriangle } from 'lucide-react';
export default function DispatchPage() {
    const { user } = useAuth();
    const [dispatches, setDispatches] = useState(getDispatches);
    const [showForm, setShowForm] = useState(false);
    const centers = getCenters();
    const disasters = getDisasters().filter(d => d.status === 'Active');
    const volunteers = getVolunteers().filter(v => v.availabilityStatus === 'Available');
    const [error, setError] = useState('');
    const refresh = useCallback(() => setDispatches(getDispatches()), []);
    const [form, setForm] = useState({
        fromCenter: '',
        destinationDisaster: '',
        itemName: '',
        quantity: '',
        selectedVolunteers: [],
    });
    // Get available items for selected center
    const availableItems = useMemo(() => {
        if (!form.fromCenter)
            return [];
        return getInventory().filter(i => i.centerId === form.fromCenter && i.quantity > 0);
    }, [form.fromCenter]);
    const maxQty = useMemo(() => {
        const item = availableItems.find(i => i.itemName === form.itemName);
        return item?.quantity || 0;
    }, [availableItems, form.itemName]);
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        const qty = parseInt(form.quantity);
        if (qty > maxQty) {
            setError(`Only ${maxQty} available`);
            return;
        }
        const disaster = disasters.find(d => d.id === form.destinationDisaster);
        if (!disaster) {
            setError('Select a destination');
            return;
        }
        const result = createDispatch({
            fromCenter: form.fromCenter,
            destination: disaster.location,
            destinationLat: disaster.latitude,
            destinationLng: disaster.longitude,
            itemName: form.itemName,
            quantity: qty,
            assignedVolunteers: form.selectedVolunteers,
        });
        if (!result) {
            setError('Insufficient inventory');
            return;
        }
        setForm({ fromCenter: '', destinationDisaster: '', itemName: '', quantity: '', selectedVolunteers: [] });
        setShowForm(false);
        refresh();
    };
    const handleStatusUpdate = (id, status) => {
        updateDispatchStatus(id, status);
        refresh();
    };
    const toggleVolunteer = (vId) => {
        setForm(f => ({
            ...f,
            selectedVolunteers: f.selectedVolunteers.includes(vId)
                ? f.selectedVolunteers.filter(id => id !== vId)
                : [...f.selectedVolunteers, vId],
        }));
    };
    const centerName = (id) => centers.find(c => c.id === id)?.name || id;
    const canCreate = user?.role === 'admin';
    return (<div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="command-header">Dispatch Operations</h1>
          <p className="system-label mt-1">{dispatches.length} MISSIONS // {dispatches.filter(d => d.status === 'In Transit').length} IN TRANSIT</p>
        </div>
        {canCreate && (<button onClick={() => setShowForm(!showForm)} className={showForm ? 'btn-secondary' : 'btn-success'}>
            {showForm ? <><X className="w-4 h-4 mr-1 inline"/>Cancel</> : <><Plus className="w-4 h-4 mr-1 inline"/>New Dispatch</>}
          </button>)}
      </header>

      {showForm && (<form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-success rounded-full block"/>
            NEW DISPATCH MISSION
          </h3>

          {error && (<div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md flex items-center gap-1">
              <AlertTriangle className="w-3 h-3"/>{error}
            </div>)}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="system-label mb-1.5 block">Source Center</label>
              <select value={form.fromCenter} onChange={e => setForm({ ...form, fromCenter: e.target.value, itemName: '', quantity: '' })} className="input-field" required>
                <option value="">Select center...</option>
                {centers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Target Disaster Zone</label>
              <select value={form.destinationDisaster} onChange={e => setForm({ ...form, destinationDisaster: e.target.value })} className="input-field" required>
                <option value="">Select disaster...</option>
                {disasters.map(d => <option key={d.id} value={d.id}>{d.type} — {d.location}</option>)}
              </select>
            </div>
          </div>

          {/* Item selection */}
          <div className="p-4 bg-background border border-dashed border-border rounded-lg space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground">MANIFEST</h4>
            {form.fromCenter ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="system-label mb-1.5 block">Item</label>
                  <select value={form.itemName} onChange={e => setForm({ ...form, itemName: e.target.value, quantity: '' })} className="input-field" required>
                    <option value="">Select item...</option>
                    {availableItems.map(i => <option key={i.id} value={i.itemName}>{i.itemName} ({i.quantity} {i.unit} available)</option>)}
                  </select>
                </div>
                <div>
                  <label className="system-label mb-1.5 block">Quantity {maxQty > 0 && `(max: ${maxQty})`}</label>
                  <input type="number" min="1" max={maxQty} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="input-field font-mono" required/>
                </div>
              </div>) : (<p className="text-xs text-muted-foreground">Select a source center to view available items</p>)}
          </div>

          {/* Volunteer assignment */}
          {volunteers.length > 0 && (<div>
              <label className="system-label mb-2 block">Assign Volunteers (optional)</label>
              <div className="flex flex-wrap gap-2">
                {volunteers.map(v => (<button key={v.id} type="button" onClick={() => toggleVolunteer(v.id)} className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${form.selectedVolunteers.includes(v.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border hover:border-primary/30'}`}>
                    {v.name}
                  </button>))}
              </div>
            </div>)}

          <button type="submit" className="btn-success w-full font-bold">
            AUTHORIZE & DISPATCH
          </button>
        </form>)}

      {/* Dispatch history */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="table-header">ID</th>
                <th className="table-header">Item</th>
                <th className="table-header">Qty</th>
                <th className="table-header">From</th>
                <th className="table-header">Destination</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                {canCreate && <th className="table-header">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {dispatches.map(d => (<tr key={d.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="table-cell font-mono text-xs text-muted-foreground">{d.id}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-muted-foreground"/>
                      <span className="font-medium">{d.itemName}</span>
                    </div>
                  </td>
                  <td className="table-cell font-mono font-bold">{d.quantity}</td>
                  <td className="table-cell text-xs text-muted-foreground">{centerName(d.fromCenter)}</td>
                  <td className="table-cell text-xs text-muted-foreground">{d.destination}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${d.status === 'Delivered' ? 'status-resolved' :
                d.status === 'In Transit' ? 'status-contained' :
                    d.status === 'Cancelled' ? 'text-muted-foreground bg-muted' : 'status-active'}`}>
                      <Truck className="w-3 h-3 inline mr-1"/>{d.status}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-xs text-muted-foreground">{new Date(d.createdAt).toLocaleDateString()}</td>
                  {canCreate && (<td className="table-cell">
                      {d.status !== 'Delivered' && d.status !== 'Cancelled' && (<select value={d.status} onChange={e => handleStatusUpdate(d.id, e.target.value)} className="input-field text-xs py-1 px-2 w-28">
                          <option>Pending</option>
                          <option>In Transit</option>
                          <option>Delivered</option>
                          <option>Cancelled</option>
                        </select>)}
                    </td>)}
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>);
}
