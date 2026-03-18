import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';
import { MapPin } from 'lucide-react';
import DetailCard from '@/components/DetailCard';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function Volunteers() {
    const [volunteers, setVolunteers] = useState([]);
    const [centers, setCenters] = useState([]);
    const [disasters, setDisasters] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState('');
    const [selectedVolunteer, setSelectedVolunteer] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setPageError('');
            const [volunteersResponse, centersResponse, disastersResponse] = await Promise.all([
                api.get('/volunteers'),
                api.get('/centers'),
                api.get('/disasters'),
            ]);
            const volunteerList = volunteersResponse.data.data || [];
            setVolunteers(volunteerList);
            setCenters(centersResponse.data.data || []);
            setDisasters((disastersResponse.data.data || []).filter((item) => item.status === 'active'));
            setAssignments(
                volunteerList.reduce((accumulator, volunteer) => {
                    accumulator[volunteer._id] = {
                        assignedType: volunteer.assignedType && volunteer.assignedType !== 'none' ? volunteer.assignedType : 'reliefCenter',
                        assignedLocation: volunteer.assignedLocation || '',
                    };
                    return accumulator;
                }, {})
            );
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to load volunteers');
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        if (!selectedVolunteer)
            return;
        const updatedVolunteer = volunteers.find((volunteer) => volunteer._id === selectedVolunteer._id);
        if (updatedVolunteer) {
            setSelectedVolunteer(updatedVolunteer);
        }
    }, [volunteers, selectedVolunteer]);

    const handleAssignmentChange = (id, updates) => {
        setAssignments((current) => ({
            ...current,
            [id]: {
                ...current[id],
                ...updates,
            },
        }));
    };

    const handleAssign = async (id) => {
        const assignment = assignments[id];

        if (!assignment?.assignedLocation) {
            setPageError('Please choose a location before assigning a volunteer');
            return;
        }

        try {
            setPageError('');
            await api.patch(`/volunteers/${id}/assign`, assignment);
            fetchData();
        }
        catch (error) {
            setPageError(error.response?.data?.message || 'Unable to assign volunteer');
        }
    };

    function getLocationsForType(assignedType) {
        return assignedType === 'disasterZone' ? disasters : centers;
    }

    const selectedAssignment = selectedVolunteer ? assignments[selectedVolunteer._id] || { assignedType: 'reliefCenter', assignedLocation: '' } : null;
    const selectedLocationOptions = getLocationsForType(selectedAssignment?.assignedType || 'reliefCenter');

    return (<div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="command-header">Volunteer Assignment</h1>
          <p className="system-label mt-1">{volunteers.length} VOLUNTEERS // {volunteers.filter(v => v.status === 'available').length} AVAILABLE // {volunteers.filter(v => v.status === 'assigned').length} ASSIGNED // {volunteers.filter(v => v.status === 'unavailable').length} UNAVAILABLE</p>
        </div>
      </header>

      {pageError && <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">{pageError}</div>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/30">
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Email</th>
                <th className="table-header">Phone</th>
                <th className="table-header">Status</th>
                <th className="table-header">Assigned</th>
                <th className="table-header">Type</th>
                <th className="table-header">Location</th>
                <th className="table-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (<tr>
                  <td className="table-cell text-muted-foreground" colSpan={8}>Loading volunteers...</td>
                </tr>)}
              {!loading && volunteers.length === 0 && (<tr>
                  <td className="table-cell text-muted-foreground" colSpan={8}>No volunteers found</td>
                </tr>)}
              {volunteers.map(v => {
            const assignment = assignments[v._id] || { assignedType: 'reliefCenter', assignedLocation: '' };
            const locationOptions = getLocationsForType(assignment.assignedType);
            return (<tr key={v._id} className="hover:bg-secondary/20 transition-colors cursor-pointer" onClick={() => setSelectedVolunteer(v)}>
                    <td className="table-cell font-medium">{v.name}</td>
                    <td className="table-cell text-xs text-muted-foreground">{v.email}</td>
                    <td className="table-cell text-xs text-muted-foreground">{v.phone || 'N/A'}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${v.status === 'assigned' ? 'status-contained' : v.status === 'unavailable' ? 'status-active' : 'status-resolved'}`}>{v.status}</span>
                    </td>
                    <td className="table-cell text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{v.assignedLocationName || '-'}</div>
                    </td>
                    <td className="table-cell">
                      <select value={assignment.assignedType} onClick={(e) => e.stopPropagation()} onChange={e => handleAssignmentChange(v._id, { assignedType: e.target.value, assignedLocation: '' })} className="input-field text-xs py-1 px-2">
                        <option value="reliefCenter">reliefCenter</option>
                        <option value="disasterZone">disasterZone</option>
                      </select>
                    </td>
                    <td className="table-cell">
                      <select value={assignment.assignedLocation} onClick={(e) => e.stopPropagation()} onChange={e => handleAssignmentChange(v._id, { assignedLocation: e.target.value })} className="input-field text-xs py-1 px-2 min-w-40">
                        <option value="">Select location</option>
                        {locationOptions.map(location => <option key={location._id} value={location._id}>{location.name || location.locationName || location.type}</option>)}
                      </select>
                    </td>
                    <td className="table-cell">
                      <button onClick={(e) => { e.stopPropagation(); handleAssign(v._id); }} className="btn-secondary text-xs py-1 px-2" disabled={v.status !== 'available'}>Assign</button>
                    </td>
                  </tr>);
        })}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!selectedVolunteer} onOpenChange={(open) => { if (!open)
            setSelectedVolunteer(null); }}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedVolunteer?.name || 'Volunteer Profile'}</SheetTitle>
            <SheetDescription>
              {selectedVolunteer ? `${selectedVolunteer.email} // Volunteer profile` : 'Volunteer profile'}
            </SheetDescription>
          </SheetHeader>

          {selectedVolunteer && (
            <div className="space-y-5 mt-4">
              <ProfileSection
                title="Volunteer Overview"
                items={[
                    { label: 'Name', value: selectedVolunteer.name },
                    { label: 'Phone', value: selectedVolunteer.phone },
                    { label: 'Email', value: selectedVolunteer.email },
                    { label: 'Age', value: selectedVolunteer.age },
                    { label: 'Gender', value: selectedVolunteer.gender },
                    { label: 'Marital Status', value: selectedVolunteer.maritalStatus },
                ]}
              />

              <ProfileSection
                title="Address"
                items={[
                    { label: 'Address Line 1', value: selectedVolunteer.address?.addressLine1 },
                    { label: 'Address Line 2', value: selectedVolunteer.address?.addressLine2 },
                    { label: 'City', value: selectedVolunteer.address?.city },
                    { label: 'State', value: selectedVolunteer.address?.state },
                    { label: 'Postal Code', value: selectedVolunteer.address?.postalCode },
                    { label: 'Country', value: selectedVolunteer.address?.country },
                ]}
              />

              <ProfileSection
                title="Emergency Contact"
                items={[
                    { label: 'Name', value: selectedVolunteer.emergencyContactName },
                    { label: 'Phone', value: selectedVolunteer.emergencyContactPhone },
                    { label: 'Relation', value: selectedVolunteer.emergencyRelation },
                ]}
              />

              <ProfileSection
                title="Volunteer Status"
                items={[
                    { label: 'Status', value: selectedVolunteer.status },
                    { label: 'Availability', value: selectedVolunteer.availability },
                    { label: 'Assigned Type', value: formatAssignmentType(selectedVolunteer.assignedType) },
                    { label: 'Assigned Location', value: selectedVolunteer.assignedLocationName },
                    { label: 'Skills', value: formatSkillList(selectedVolunteer.skills) },
                    { label: 'Experience Level', value: selectedVolunteer.experienceLevel },
                ]}
              />

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Documents</h3>
                </div>
                <div className="px-4 py-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DetailCard label="ID Type" value={formatProfileValue(selectedVolunteer.idType)}/>
                    <DetailCard label="ID Number" value={formatProfileValue(selectedVolunteer.idNumber)}/>
                  </div>
                  <div className="stat-card space-y-2">
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">Document Preview</p>
                    {selectedVolunteer.idDocumentUrl
                        ? <a href={selectedVolunteer.idDocumentUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">Open uploaded document</a>
                        : <p className="text-sm text-muted-foreground">No document uploaded</p>}
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Assignment Control</h3>
                </div>
                <div className="px-4 py-4 space-y-4">
                  {selectedVolunteer.status !== 'available' && (
                    <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
                      This volunteer is currently unavailable for assignment.
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="system-label mb-1.5 block">Type</label>
                      <select value={selectedAssignment?.assignedType || 'reliefCenter'} onChange={e => handleAssignmentChange(selectedVolunteer._id, { assignedType: e.target.value, assignedLocation: '' })} className="input-field text-sm py-2 px-3">
                        <option value="reliefCenter">reliefCenter</option>
                        <option value="disasterZone">disasterZone</option>
                      </select>
                    </div>
                    <div>
                      <label className="system-label mb-1.5 block">Location</label>
                      <select value={selectedAssignment?.assignedLocation || ''} onChange={e => handleAssignmentChange(selectedVolunteer._id, { assignedLocation: e.target.value })} className="input-field text-sm py-2 px-3">
                        <option value="">Select location</option>
                        {selectedLocationOptions.map(location => <option key={location._id} value={location._id}>{location.name || location.locationName || location.type}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={() => handleAssign(selectedVolunteer._id)} className="btn-secondary text-sm" disabled={selectedVolunteer.status !== 'available'}>
                    Assign Volunteer
                  </button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>);
}

function formatProfileValue(value) {
    if (value === 0)
        return '0';
    return value || 'Not provided';
}

function formatSkillList(skills) {
    return Array.isArray(skills) && skills.length ? skills.join(', ') : 'Not provided';
}

function formatAssignmentType(assignedType) {
    if (assignedType === 'disasterZone')
        return 'Disaster Zone';
    if (assignedType === 'reliefCenter')
        return 'Relief Center';
    if (assignedType === 'none' || !assignedType)
        return 'none';
    return assignedType;
}

function ProfileSection({ title, items }) {
    return (
        <div className="space-y-3">
          <h3 className="system-label">{title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
                <DetailCard key={item.label} label={item.label} value={formatProfileValue(item.value)}/>
            ))}
          </div>
        </div>
    );
}
