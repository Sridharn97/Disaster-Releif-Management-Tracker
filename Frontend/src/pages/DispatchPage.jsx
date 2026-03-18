import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Truck, Package, AlertTriangle, MapPin, ArrowRightLeft } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const createEmptyResource = () => ({
    itemName: '',
    quantity: '',
});

const createEmptyForm = () => ({
    fromInventorySpace: '',
    toType: 'reliefCenter',
    toId: '',
    resources: [createEmptyResource()],
});

export default function DispatchPage() {
    const { user } = useAuth();
    const [dispatches, setDispatches] = useState([]);
    const [inventorySpaces, setInventorySpaces] = useState([]);
    const [centers, setCenters] = useState([]);
    const [disasters, setDisasters] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(createEmptyForm());
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedDispatch, setSelectedDispatch] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setError('');
            const [dispatchResponse, inventoryResponse, centersResponse, disastersResponse] = await Promise.all([
                api.get('/dispatch'),
                api.get('/inventory-spaces'),
                api.get('/centers'),
                api.get('/disasters'),
            ]);
            setDispatches(dispatchResponse.data.data || []);
            setInventorySpaces(inventoryResponse.data.data || []);
            setCenters(centersResponse.data.data || []);
            setDisasters((disastersResponse.data.data || []).filter((item) => item.status === 'active'));
        }
        catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to load dispatch data');
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const selectedInventorySpace = inventorySpaces.find((space) => space._id === form.fromInventorySpace);
    const destinationOptions = form.toType === 'reliefCenter' ? centers : disasters;

    const updateResource = (index, updates) => {
        setForm((current) => ({
            ...current,
            resources: current.resources.map((resource, resourceIndex) =>
                resourceIndex === index ? { ...resource, ...updates } : resource
            ),
        }));
    };

    const addResourceRow = () => {
        setForm((current) => ({
            ...current,
            resources: [...current.resources, createEmptyResource()],
        }));
    };

    const removeResourceRow = (index) => {
        setForm((current) => ({
            ...current,
            resources: current.resources.length === 1
                ? current.resources
                : current.resources.filter((_, resourceIndex) => resourceIndex !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            await api.post('/dispatch', {
                fromInventorySpace: form.fromInventorySpace,
                toType: form.toType,
                toId: form.toId,
                resources: form.resources
                    .filter((resource) => resource.itemName && resource.quantity)
                    .map((resource) => ({
                        itemName: resource.itemName,
                        quantity: Number(resource.quantity),
                    })),
            });
            setForm(createEmptyForm());
            setShowForm(false);
            fetchData();
        }
        catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to create dispatch');
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            setError('');
            await api.patch(`/dispatch/${id}`, { status });
            setDispatches((current) => current.map((dispatch) => dispatch._id === id ? { ...dispatch, status } : dispatch));
        }
        catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to update dispatch status');
        }
    };

    const canCreate = user?.role === 'admin';

    return (<div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="command-header">Dispatch Operations</h1>
          <p className="system-label mt-1">{dispatches.length} MISSIONS // {dispatches.filter(d => d.status === 'in-transit').length} IN TRANSIT</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="system-label mb-1.5 block">Inventory Space</label>
              <select value={form.fromInventorySpace} onChange={e => setForm({ ...form, fromInventorySpace: e.target.value, resources: [createEmptyResource()] })} className="input-field" required>
                <option value="">Select source...</option>
                {inventorySpaces.map(space => <option key={space._id} value={space._id}>{space.name}</option>)}
              </select>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Destination Type</label>
              <select value={form.toType} onChange={e => setForm({ ...form, toType: e.target.value, toId: '' })} className="input-field">
                <option value="reliefCenter">Relief Center</option>
                <option value="disasterZone">Disaster Zone</option>
              </select>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Destination</label>
              <select value={form.toId} onChange={e => setForm({ ...form, toId: e.target.value })} className="input-field" required>
                <option value="">Select destination...</option>
                {destinationOptions.map(option => <option key={option._id} value={option._id}>{option.name || option.locationName || option.type}</option>)}
              </select>
            </div>
          </div>

          <div className="p-4 bg-background border border-dashed border-border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-muted-foreground">RESOURCES</h4>
              <button type="button" onClick={addResourceRow} className="btn-secondary text-xs py-1 px-2">Add Item</button>
            </div>
            {form.resources.map((resource, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select value={resource.itemName} onChange={e => updateResource(index, { itemName: e.target.value })} className="input-field">
                  <option value="">Select item...</option>
                  {(selectedInventorySpace?.resources || []).map(item => <option key={`${item.itemName}-${item._id || item.unit}`} value={item.itemName}>{item.itemName} ({item.quantity} {item.unit})</option>)}
                </select>
                <input type="number" min="1" value={resource.quantity} onChange={e => updateResource(index, { quantity: e.target.value })} className="input-field font-mono" placeholder="Quantity"/>
                <button type="button" onClick={() => removeResourceRow(index)} className="btn-secondary text-xs py-1 px-2">Remove</button>
              </div>
            ))}
          </div>

          <button type="submit" className="btn-success w-full font-bold">
            AUTHORIZE & DISPATCH
          </button>
        </form>)}

      {error && !showForm && (<div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md flex items-center gap-1">
          <AlertTriangle className="w-3 h-3"/>{error}
        </div>)}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="table-header">From</th>
                <th className="table-header">To</th>
                <th className="table-header">Resources</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                {canCreate && <th className="table-header">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (<tr>
                  <td className="table-cell text-muted-foreground" colSpan={canCreate ? 6 : 5}>Loading dispatches...</td>
                </tr>)}
              {!loading && dispatches.length === 0 && (<tr>
                  <td className="table-cell text-muted-foreground" colSpan={canCreate ? 6 : 5}>No dispatches found</td>
                </tr>)}
              {dispatches.map(d => (<tr key={d._id} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedDispatch(d)}>
                  <td className="table-cell text-xs text-muted-foreground">{d.fromInventorySpace?.name || '-'}</td>
                  <td className="table-cell text-xs text-muted-foreground">{d.toName}</td>
                  <td className="table-cell text-xs text-muted-foreground">
                    {d.resources.map(resource => `${resource.itemName} x${resource.quantity}`).join(', ')}
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${d.status === 'delivered' ? 'status-resolved' : 'status-contained'}`}>
                      <Truck className="w-3 h-3 inline mr-1"/>{d.status}
                    </span>
                  </td>
                  <td className="table-cell font-mono text-xs text-muted-foreground">{new Date(d.dispatchedAt).toLocaleDateString()}</td>
                  {canCreate && (<td className="table-cell" onClick={e => e.stopPropagation()}>
                      {d.status !== 'delivered' && (<select value={d.status} onChange={e => handleStatusUpdate(d._id, e.target.value)} className="input-field text-xs py-1 px-2 w-28">
                          <option value="in-transit">in-transit</option>
                          <option value="delivered">delivered</option>
                        </select>)}
                    </td>)}
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!selectedDispatch} onOpenChange={(open) => { if (!open)
            setSelectedDispatch(null); }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedDispatch?.toName || 'Dispatch Mission'}</SheetTitle>
            <SheetDescription>
              {selectedDispatch ? `${selectedDispatch.toType === 'reliefCenter' ? 'Relief Center' : 'Disaster Zone'} destination // ${selectedDispatch.status}` : 'Dispatch mission details'}
            </SheetDescription>
          </SheetHeader>

          {selectedDispatch && (<div className="space-y-5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailCard label="Status" value={selectedDispatch.status}/>
                <DetailCard label="Dispatched On" value={new Date(selectedDispatch.dispatchedAt).toLocaleString()}/>
                <DetailCard label="Destination Type" value={selectedDispatch.toType}/>
                <DetailCard label="Authorized By" value={selectedDispatch.dispatchedBy?.name || 'Unknown'}/>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Route</h3>
                </div>
                <div className="px-4 py-4 space-y-3 text-sm text-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                    <span>From {selectedDispatch.fromInventorySpace?.name || 'Unknown inventory space'}</span>
                  </div>
                  <div className="pl-6 text-xs text-muted-foreground">
                    {selectedDispatch.fromInventorySpace?.locationName || 'Location not available'}
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRightLeft className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                    <span>To {selectedDispatch.toName}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Dispatched Resources</h3>
                </div>
                <div className="px-4 py-4 space-y-2">
                  {selectedDispatch.resources.map((resource, index) => (
                    <div key={`${selectedDispatch._id}-${index}`} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Package className="w-4 h-4 text-muted-foreground"/>
                        <span>{resource.itemName}</span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">x{resource.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Brief Description</h3>
                </div>
                <div className="px-4 py-4 text-sm text-muted-foreground">
                  This dispatch mission transfers supplies from {selectedDispatch.fromInventorySpace?.name || 'the selected inventory space'} to {selectedDispatch.toName} for active relief support.
                </div>
              </div>
            </div>)}
        </SheetContent>
      </Sheet>
    </div>);
}

function DetailCard({ label, value }) {
    return (<div className="stat-card space-y-1">
      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">{label}</p>
      <p className="text-base font-mono font-bold text-foreground break-words">{value}</p>
    </div>);
}
