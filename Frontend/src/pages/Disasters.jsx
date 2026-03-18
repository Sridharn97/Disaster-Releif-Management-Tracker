import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import CenterLocationPicker from '@/components/CenterLocationPicker';
import { Plus, X, AlertTriangle, MapPin } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const createEmptyForm = () => ({
    type: '',
    severity: 'Medium',
    description: '',
    latitude: '',
    longitude: '',
    locationName: '',
});

export default function Disasters() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [disasters, setDisasters] = useState([]);
    const isPublicUser = !user;
    const [showForm, setShowForm] = useState(isPublicUser || searchParams.get('report') === 'true');
    const [form, setForm] = useState(createEmptyForm());
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [selectedDisaster, setSelectedDisaster] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchDisasters = useCallback(async () => {
        if (isPublicUser) {
            setLoading(false);
            return;
        }
        try {
            setPageError('');
            const response = await api.get('/disasters');
            setDisasters(response.data.data || []);
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to load disasters');
        }
        finally {
            setLoading(false);
        }
    }, [isPublicUser]);

    useEffect(() => {
        fetchDisasters();
    }, [fetchDisasters]);

    useEffect(() => {
        if (isPublicUser || searchParams.get('report') === 'true') {
            setShowForm(true);
        }
    }, [isPublicUser, searchParams]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (form.latitude === '' || form.longitude === '') {
            setPageError('Please select the disaster location on the map');
            return;
        }
        try {
            setPageError('');
            await api.post('/disasters', {
                type: form.type,
                severity: form.severity,
                description: form.description,
                latitude: Number(form.latitude),
                longitude: Number(form.longitude),
                locationName: form.locationName,
            });
            setForm(createEmptyForm());
            setShowForm(isPublicUser);
            setSearchParams({});
            fetchDisasters();
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to create disaster');
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            setPageError('');
            await api.put(`/disasters/${id}`, { status });
            setDisasters((current) => current.map((disaster) => disaster._id === id ? { ...disaster, status } : disaster));
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to update disaster status');
        }
    };

    const handleViewDetails = async (id) => {
        setPageError('');
        setDetailLoading(true);
        try {
            const response = await api.get(`/disasters/${id}`);
            setSelectedDisaster(response.data.data);
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to load disaster details');
        }
        finally {
            setDetailLoading(false);
        }
    };

    const canCreate = true;
    const canResolve = user?.role === 'admin';

    return (<div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="command-header">{isPublicUser ? 'Report Disaster' : 'Disaster Events'}</h1>
          <p className="system-label mt-1">{isPublicUser ? 'SUBMIT A NEW INCIDENT REPORT' : `MONITORING ${disasters.length} EVENTS`}</p>
        </div>
        {!isPublicUser && canCreate && (<button onClick={() => {
            const nextValue = !showForm;
            setShowForm(nextValue);
            if (!nextValue) {
                setSearchParams({});
            }
        }} className={showForm ? 'btn-secondary' : 'btn-primary'}>
            {showForm ? <><X className="w-4 h-4 mr-1 inline"/>Cancel</> : <><Plus className="w-4 h-4 mr-1 inline"/>Report Disaster</>}
          </button>)}
      </header>

      {pageError && (<div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
          {pageError}
        </div>)}

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
              <label className="system-label mb-1.5 block">Severity</label>
              <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className="input-field">
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </select>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" placeholder="Brief description"/>
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
          <button type="submit" className="btn-destructive">Submit Disaster Report</button>
        </form>)}

      {!isPublicUser && <div className="bg-card border border-border rounded-lg overflow-hidden">
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
                {canResolve && <th className="table-header">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading && (<tr>
                  <td className="table-cell text-muted-foreground" colSpan={canResolve ? 7 : 6}>Loading disasters...</td>
                </tr>)}
              {!loading && disasters.length === 0 && (<tr>
                  <td className="table-cell text-muted-foreground" colSpan={canResolve ? 7 : 6}>No disasters found</td>
                </tr>)}
              {disasters.map(d => (<tr key={d._id} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => handleViewDetails(d._id)}>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`w-3.5 h-3.5 ${d.status === 'active' ? 'text-destructive' : 'text-muted-foreground'}`}/>
                      <span className="font-medium">{d.type}</span>
                    </div>
                  </td>
                  <td className="table-cell text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3"/>{d.locationName || d.location}
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
                  {canResolve && (<td className="table-cell" onClick={e => e.stopPropagation()}>
                      <select value={d.status} onChange={e => handleStatusChange(d._id, e.target.value)} className="input-field text-xs py-1 px-2">
                        <option value="active">active</option>
                        <option value="resolved">resolved</option>
                      </select>
                    </td>)}
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>}

      <Sheet open={!!selectedDisaster} onOpenChange={(open) => {
            if (!open) {
                setSelectedDisaster(null);
            }
        }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detailLoading ? 'Loading incident...' : selectedDisaster?.type || 'Incident Details'}</SheetTitle>
            <SheetDescription>
              {selectedDisaster ? `${selectedDisaster.locationName || selectedDisaster.location} // ${selectedDisaster.severity} severity` : 'Incident details and field notes'}
            </SheetDescription>
          </SheetHeader>

          {selectedDisaster && (<div className="space-y-5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailCard label="Status" value={selectedDisaster.status}/>
                <DetailCard label="Reported On" value={new Date(selectedDisaster.createdAt).toLocaleString()}/>
                <DetailCard label="Coordinates" value={`${selectedDisaster.latitude.toFixed(4)}, ${selectedDisaster.longitude.toFixed(4)}`}/>
                <DetailCard label="Reported By" value={selectedDisaster.reportedBy?.name || 'Public user'}/>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Location</h3>
                </div>
                <div className="px-4 py-4 text-sm text-foreground flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                  <span>{selectedDisaster.locationName || selectedDisaster.location}</span>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Description</h3>
                </div>
                <div className="px-4 py-4 text-sm text-muted-foreground leading-6 whitespace-pre-wrap">
                  {selectedDisaster.description || 'No additional description provided for this incident.'}
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
