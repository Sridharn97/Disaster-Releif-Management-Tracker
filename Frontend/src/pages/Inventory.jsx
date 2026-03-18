import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import CenterLocationPicker from '@/components/CenterLocationPicker';
import { Plus, X, Package, MapPin, Phone, User } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const createEmptyResource = () => ({
    itemName: '',
    quantity: '',
    unit: 'units',
});

const createEmptyForm = () => ({
    name: '',
    manager: '',
    phone: '',
    latitude: '',
    longitude: '',
    locationName: '',
    resources: [createEmptyResource()],
});

export default function Inventory() {
    const [inventorySpaces, setInventorySpaces] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(createEmptyForm());
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [selectedInventory, setSelectedInventory] = useState(null);

    const fetchInventorySpaces = useCallback(async () => {
        try {
            setPageError('');
            const response = await api.get('/inventory-spaces');
            setInventorySpaces(response.data.data || []);
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to load inventory spaces');
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventorySpaces();
    }, [fetchInventorySpaces]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (form.latitude === '' || form.longitude === '') {
            setPageError('Please select the inventory space location on the map');
            return;
        }
        try {
            setPageError('');
            const payload = {
                name: form.name,
                manager: form.manager,
                phone: form.phone,
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                locationName: form.locationName,
                resources: form.resources
                    .filter((resource) => resource.itemName && resource.quantity)
                    .map((resource) => ({
                        itemName: resource.itemName,
                        quantity: Number(resource.quantity),
                        unit: resource.unit,
                    })),
            };
            if (editId) {
                await api.put(`/inventory-spaces/${editId}`, payload);
                setEditId(null);
            }
            else {
                await api.post('/inventory-spaces', payload);
            }
            setForm(createEmptyForm());
            setShowForm(false);
            fetchInventorySpaces();
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to save inventory space');
        }
    };

    const handleDelete = async (id) => {
        try {
            setPageError('');
            await api.delete(`/inventory-spaces/${id}`);
            setInventorySpaces((current) => current.filter((space) => space._id !== id));
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to delete inventory space');
        }
    };

    const handleEdit = (space) => {
        setForm({
            name: space.name,
            manager: space.manager,
            phone: space.phone || '',
            latitude: String(space.latitude),
            longitude: String(space.longitude),
            locationName: space.locationName || space.location || '',
            resources: space.resources?.length
                ? space.resources.map((resource) => ({
                    itemName: resource.itemName,
                    quantity: String(resource.quantity),
                    unit: resource.unit || 'units',
                }))
                : [createEmptyResource()],
        });
        setEditId(space._id);
        setShowForm(true);
    };

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

    return (<div className="space-y-6">
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="command-header">Inventory Spaces</h1>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(createEmptyForm()); }} className={showForm ? 'btn-secondary' : 'btn-primary'}>
          {showForm ? <><X className="w-4 h-4 mr-1 inline"/>Cancel</> : <><Plus className="w-4 h-4 mr-1 inline"/>Add Inventory Space</>}
        </button>
      </header>

      {pageError && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">{pageError}</div>}

      {showForm && (<form onSubmit={handleAdd} className="bg-card border border-border rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary rounded-full block"/>
            {editId ? 'EDIT INVENTORY SPACE' : 'NEW INVENTORY SPACE'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="system-label mb-1.5 block">Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Manager</label>
              <input value={form.manager} onChange={e => setForm({ ...form, manager: e.target.value })} className="input-field" required/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" required/>
            </div>
          </div>
          <CenterLocationPicker
            value={{ latitude: form.latitude, longitude: form.longitude }}
            locationName={form.locationName}
            onChange={({ latitude, longitude, locationName }) =>
                setForm((current) => ({
                    ...current,
                    latitude,
                    longitude,
                    locationName,
                }))
            }
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="system-label">Resources</h4>
              <button type="button" onClick={addResourceRow} className="btn-secondary text-xs py-1 px-2">Add Resource</button>
            </div>
            {form.resources.map((resource, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input value={resource.itemName} onChange={e => updateResource(index, { itemName: e.target.value })} className="input-field" placeholder="Item name"/>
                <input type="number" value={resource.quantity} onChange={e => updateResource(index, { quantity: e.target.value })} className="input-field font-mono" placeholder="Quantity"/>
                <select value={resource.unit} onChange={e => updateResource(index, { unit: e.target.value })} className="input-field">
                  <option>units</option><option>kg</option><option>liters</option><option>packets</option>
                </select>
                <button type="button" onClick={() => removeResourceRow(index)} className="btn-secondary text-xs py-1 px-2">Remove</button>
              </div>
            ))}
          </div>
          <button type="submit" className="btn-primary">{editId ? 'Update Inventory Space' : 'Create Inventory Space'}</button>
        </form>)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <div className="stat-card text-sm text-muted-foreground">Loading inventory spaces...</div>}
        {!loading && inventorySpaces.length === 0 && <div className="stat-card text-sm text-muted-foreground">No inventory spaces found</div>}
        {inventorySpaces.map(space => (<div key={space._id} className="stat-card space-y-3 cursor-pointer hover:bg-secondary/20 transition-colors" onClick={() => setSelectedInventory(space)}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm">{space.name}</h3>
                <div className="text-xs text-muted-foreground mt-0.5">{space.locationName || space.location}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); handleEdit(space); }} className="text-xs text-primary hover:underline">Edit</button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(space._id); }} className="text-xs text-destructive hover:underline">Delete</button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div>Manager: {space.manager}</div>
              <div>Phone: {space.phone || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              {(space.resources || []).map((resource, index) => (
                <div key={`${space._id}-${index}`} className="text-xs text-muted-foreground flex items-center gap-2">
                  <Package className="w-3 h-3"/>{resource.itemName}: {resource.quantity} {resource.unit}
                </div>
              ))}
            </div>
          </div>))}
      </div>

      <Sheet open={!!selectedInventory} onOpenChange={(open) => { if (!open)
            setSelectedInventory(null); }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedInventory?.name || 'Inventory Space'}</SheetTitle>
            <SheetDescription>
              {(selectedInventory?.locationName || selectedInventory?.location) ? `${selectedInventory?.locationName || selectedInventory?.location} // Storage hub details` : 'Storage hub details'}
            </SheetDescription>
          </SheetHeader>

          {selectedInventory && (<div className="space-y-5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailCard label="Manager" value={selectedInventory.manager}/>
                <DetailCard label="Phone" value={selectedInventory.phone || 'N/A'}/>
                <DetailCard label="Resource Types" value={String((selectedInventory.resources || []).length)}/>
                <DetailCard label="Total Stock" value={String((selectedInventory.resources || []).reduce((total, resource) => total + (resource.quantity || 0), 0))}/>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Location</h3>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                    <span>{selectedInventory.locationName || selectedInventory.location}</span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {selectedInventory.latitude.toFixed(4)}, {selectedInventory.longitude.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Stored Resources</h3>
                </div>
                <div className="px-4 py-4 space-y-2">
                  {(selectedInventory.resources || []).length === 0 && <div className="text-sm text-muted-foreground">No resources recorded.</div>}
                  {(selectedInventory.resources || []).map((resource, index) => (
                    <div key={`${selectedInventory._id}-${index}`} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm">
                      <div className="flex items-center gap-2 text-foreground">
                        <Package className="w-4 h-4 text-muted-foreground"/>
                        <span>{resource.itemName}</span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">{resource.quantity} {resource.unit}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Brief Description</h3>
                </div>
                <div className="px-4 py-4 text-sm text-muted-foreground space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                    <span>Managed by {selectedInventory.manager}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                    <span>Operations contact: {selectedInventory.phone || 'Not provided'}</span>
                  </div>
                  <p>This inventory space acts as a storage hub for relief materials and outbound dispatch readiness.</p>
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
