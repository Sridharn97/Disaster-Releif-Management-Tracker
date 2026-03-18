import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import CenterLocationPicker from '@/components/CenterLocationPicker';
import { Plus, X, MapPin, Phone, User } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';

const createEmptyForm = () => ({
    name: '',
    contactPerson: '',
    phone: '',
    latitude: '',
    longitude: '',
    locationName: '',
});

export default function Centers() {
    const { user } = useAuth();
    const canManage = user?.role === 'admin';
    const [centers, setCenters] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(createEmptyForm());
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [selectedCenter, setSelectedCenter] = useState(null);

    const fetchCenters = useCallback(async () => {
        try {
            setPageError('');
            const response = await api.get('/centers');
            setCenters(response.data.data || []);
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to load centers');
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCenters();
    }, [fetchCenters]);

    useEffect(() => {
        if (!canManage) {
            setShowForm(false);
            setEditId(null);
        }
    }, [canManage]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!canManage)
            return;
        if (form.latitude === '' || form.longitude === '') {
            setPageError('Please select the relief center location on the map');
            return;
        }
        try {
            setPageError('');
            const payload = {
                latitude: parseFloat(form.latitude),
                longitude: parseFloat(form.longitude),
                name: form.name,
                contactPerson: form.contactPerson,
                phone: form.phone,
                locationName: form.locationName,
            };
            if (editId) {
                await api.put(`/centers/${editId}`, payload);
                setEditId(null);
            }
            else {
                await api.post('/centers', payload);
            }
            setForm(createEmptyForm());
            setShowForm(false);
            fetchCenters();
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to save center');
        }
    };

    const handleEdit = (c) => {
        if (!canManage)
            return;
        setForm({
            name: c.name,
            contactPerson: c.contactPerson,
            phone: c.phone || '',
            latitude: String(c.latitude),
            longitude: String(c.longitude),
            locationName: c.locationName || c.location || '',
        });
        setEditId(c._id);
        setShowForm(true);
    };

    return (<div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="command-header">Relief Centers</h1>
          <p className="system-label mt-1">{centers.length} CENTERS OPERATIONAL</p>
        </div>
        {canManage && (<button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(createEmptyForm()); }} className={showForm ? 'btn-secondary' : 'btn-primary'}>
            {showForm ? <><X className="w-4 h-4 mr-1 inline"/>Cancel</> : <><Plus className="w-4 h-4 mr-1 inline"/>Add Center</>}
          </button>)}
      </header>

      {pageError && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">{pageError}</div>}

      {canManage && showForm && (<form onSubmit={handleAdd} className="bg-card border border-border rounded-lg p-5 space-y-4">
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
              <label className="system-label mb-1.5 block">Contact Person</label>
              <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="input-field" required/>
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
          <button type="submit" className="btn-primary">{editId ? 'Update Center' : 'Create Center'}</button>
        </form>)}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading && <div className="stat-card text-sm text-muted-foreground">Loading centers...</div>}
        {!loading && centers.length === 0 && <div className="stat-card text-sm text-muted-foreground">No centers found</div>}
        {centers.map(c => (<div key={c._id} className="stat-card space-y-3 cursor-pointer hover:bg-secondary/20 transition-colors" onClick={() => setSelectedCenter(c)}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="font-semibold text-sm">{c.name}</h3>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.locationName || c.location}</div>
                </div>
              </div>
              {canManage && (<button onClick={(e) => { e.stopPropagation(); handleEdit(c); }} className="text-xs text-primary hover:underline">Edit</button>)}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div>Contact: {c.contactPerson}</div>
              <div>Phone: {c.phone || 'N/A'}</div>
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
            </div>
          </div>))}
      </div>

      <Sheet open={!!selectedCenter} onOpenChange={(open) => { if (!open)
            setSelectedCenter(null); }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedCenter?.name || 'Relief Center'}</SheetTitle>
            <SheetDescription>
              {(selectedCenter?.locationName || selectedCenter?.location) ? `${selectedCenter?.locationName || selectedCenter?.location} // Relief center details` : 'Relief center details'}
            </SheetDescription>
          </SheetHeader>

          {selectedCenter && (<div className="space-y-5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailCard label="Contact Person" value={selectedCenter.contactPerson}/>
                <DetailCard label="Phone" value={selectedCenter.phone || 'N/A'}/>
                <DetailCard label="Latitude" value={selectedCenter.latitude.toFixed(4)}/>
                <DetailCard label="Longitude" value={selectedCenter.longitude.toFixed(4)}/>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Location</h3>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                    <span>{selectedCenter.locationName || selectedCenter.location}</span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {selectedCenter.latitude.toFixed(4)}, {selectedCenter.longitude.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Brief Description</h3>
                </div>
                <div className="px-4 py-4 text-sm text-muted-foreground space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                    <span>Managed by {selectedCenter.contactPerson}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                    <span>Primary support line: {selectedCenter.phone || 'Not provided'}</span>
                  </div>
                  <p>This relief center is available as an operational support location for response coordination and assistance.</p>
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
