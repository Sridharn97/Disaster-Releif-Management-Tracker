import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { AlertTriangle, Loader2, MapPin, Phone, User as UserIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import DetailCard from '@/components/DetailCard';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
    const [data, setData] = useState({
        disasters: [],
        centers: [],
        inventorySpaces: [],
        dispatches: [],
        volunteers: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [disastersResponse, centersResponse, inventoryResponse, dispatchResponse, volunteersResponse] = await Promise.all([
                    api.get('/disasters'),
                    api.get('/centers'),
                    api.get('/inventory-spaces'),
                    api.get('/dispatch'),
                    api.get('/volunteers'),
                ]);
                setData({
                    disasters: disastersResponse.data.data || [],
                    centers: centersResponse.data.data || [],
                    inventorySpaces: inventoryResponse.data.data || [],
                    dispatches: dispatchResponse.data.data || [],
                    volunteers: volunteersResponse.data.data || [],
                });
            }
            catch (error) {
                setData({
                    disasters: [],
                    centers: [],
                    inventorySpaces: [],
                    dispatches: [],
                    volunteers: [],
                });
            }
            finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchDashboardData();
        } else {
            setLoading(false);
        }
    }, [user?.role]);

    if (user?.role !== 'admin') {
        return <VolunteerDashboard user={user} />;
    }

    return <AdminDashboard data={data} loading={loading} />;
}

function AdminDashboard({ data, loading }) {
    const summary = useMemo(() => {
        const activeDisasters = data.disasters.filter((disaster) => disaster.status === 'active').length;
        const assignedVolunteers = data.volunteers.filter((volunteer) => volunteer.status === 'assigned').length;
        const inTransit = data.dispatches.filter((dispatch) => dispatch.status === 'in-transit').length;
        const resourcesBySpace = data.inventorySpaces.map((space) => ({
            name: space.name.split(' ')[0],
            stock: (space.resources || []).reduce((total, resource) => total + resource.quantity, 0),
        }));
        const severityData = [
            { name: 'Critical', value: data.disasters.filter(d => d.severity === 'Critical').length, color: '#ef4444' },
            { name: 'High', value: data.disasters.filter(d => d.severity === 'High').length, color: '#f97316' },
            { name: 'Medium', value: data.disasters.filter(d => d.severity === 'Medium').length, color: '#eab308' },
            { name: 'Low', value: data.disasters.filter(d => d.severity === 'Low').length, color: '#22c55e' },
        ].filter(item => item.value > 0);
        return { activeDisasters, assignedVolunteers, inTransit, resourcesBySpace, severityData };
    }, [data]);

    const dispatchTrend = useMemo(() => {
        const labels = [];
        for (let index = 6; index >= 0; index -= 1) {
            const date = new Date();
            date.setDate(date.getDate() - index);
            labels.push({
                key: date.toISOString().slice(0, 10),
                day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            });
        }
        return labels.map((label) => ({
            day: label.day,
            dispatches: data.dispatches.filter((dispatch) => dispatch.dispatchedAt?.slice(0, 10) === label.key).length,
        }));
    }, [data.dispatches]);

    return (<div className="space-y-6">
      <header>
        <h1 className="command-header">Command Overview</h1>
        <p className="system-label mt-1">SYSTEM_STATUS: OPERATIONAL // ADMIN DASHBOARD</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Disasters" value={loading ? '...' : summary.activeDisasters}/>
        <StatCard label="Relief Centers" value={loading ? '...' : data.centers.length}/>
        <StatCard label="Inventory Spaces" value={loading ? '...' : data.inventorySpaces.length}/>
        <StatCard label="Assigned Volunteers" value={loading ? '...' : assignedLabel(summary.assignedVolunteers, data.volunteers.length)}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="system-label mb-4">Resources by Space</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.resourcesBySpace}>
                <XAxis dataKey="name" stroke={chartAxisStroke} fontSize={11}/>
                <YAxis stroke={chartAxisStroke} fontSize={11}/>
                <Tooltip contentStyle={chartTooltipStyle}/>
                <Bar dataKey="stock" fill="hsl(217 91% 60%)" radius={[4, 4, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="system-label mb-4">Severity Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.severityData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {summary.severityData.map((entry, i) => (<Cell key={i} fill={entry.color}/>))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="system-label mb-4">Dispatch Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dispatchTrend}>
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
    </div>);
}

function VolunteerDashboard({ user }) {
    const { updateUserSession } = useAuth();
    const [statusValue, setStatusValue] = useState(user?.status === 'unavailable' ? 'unavailable' : 'available');
    const [statusError, setStatusError] = useState('');
    const [savingStatus, setSavingStatus] = useState(false);
    const [completingAssignment, setCompletingAssignment] = useState(false);
    const [assignmentExpanded, setAssignmentExpanded] = useState(false);
    const [assignmentDetails, setAssignmentDetails] = useState(null);
    const [assignmentLoading, setAssignmentLoading] = useState(false);
    const [assignmentError, setAssignmentError] = useState('');

    useEffect(() => {
        if (user?.status === 'assigned')
            return;
        setStatusValue(user?.status === 'unavailable' ? 'unavailable' : 'available');
    }, [user?.status]);

    useEffect(() => {
        let isActive = true;

        const fetchAssignmentDetails = async () => {
            if (!user?.assignedLocation || !user?.assignedType) {
                setAssignmentDetails(null);
                setAssignmentError('');
                setAssignmentLoading(false);
                return;
            }

            setAssignmentLoading(true);
            setAssignmentError('');

            try {
                let detail = null;

                if (user.assignedType === 'reliefCenter') {
                    const response = await api.get('/centers');
                    detail = (response.data.data || []).find((center) => center._id === user.assignedLocation) || null;
                } else if (user.assignedType === 'disasterZone') {
                    const response = await api.get(`/disasters/${user.assignedLocation}`);
                    detail = response.data.data || null;
                }

                if (!isActive)
                    return;

                setAssignmentDetails(detail);
            }
            catch (error) {
                if (!isActive)
                    return;

                setAssignmentDetails(null);
                setAssignmentError(error.response?.data?.message || 'Unable to load assignment details');
            }
            finally {
                if (isActive) {
                    setAssignmentLoading(false);
                }
            }
        };

        fetchAssignmentDetails();

        return () => {
            isActive = false;
        };
    }, [user?.assignedLocation, user?.assignedType]);

    const assignmentLocation = assignmentDetails?.locationName || assignmentDetails?.location || user?.assignedLocationName;
    const assignmentTitle = user?.assignedType === 'disasterZone'
        ? assignmentDetails?.type || 'Disaster Zone'
        : assignmentDetails?.name || 'Relief Center';
    const assignmentSummary = user?.assignedType === 'disasterZone'
        ? assignmentDetails?.description || 'Respond at the assigned disaster zone and coordinate support on arrival.'
        : 'Report to the assigned relief center and assist with field coordination and support tasks.';
    const canExpandAssignment = Boolean(user?.assignedLocationName || assignmentDetails || assignmentLoading || assignmentError);
    const availabilityLocked = user?.status === 'assigned';

    const handleStatusUpdate = async (nextStatus) => {
        setStatusValue(nextStatus);
        setStatusError('');
        setSavingStatus(true);
        try {
            const response = await api.patch('/volunteers/me/status', { status: nextStatus });
            updateUserSession(response.data.data);
        }
        catch (error) {
            setStatusError(error.response?.data?.message || 'Unable to update availability');
            setStatusValue(user?.status === 'unavailable' ? 'unavailable' : 'available');
        }
        finally {
            setSavingStatus(false);
        }
    };

    const handleAssignmentComplete = async () => {
        setStatusError('');
        setCompletingAssignment(true);

        try {
            const response = await api.patch('/volunteers/me/status', {
                status: 'unassigned',
                assignedType: 'none',
                assignmentId: null,
            });
            updateUserSession(response.data.data);
            setAssignmentExpanded(false);
            setAssignmentDetails(null);
            setAssignmentError('');
        }
        catch (error) {
            setStatusError(error.response?.data?.message || 'Unable to complete assignment');
        }
        finally {
            setCompletingAssignment(false);
        }
    };

    return (<div className="space-y-6">
      <header>
        <h1 className="command-header">Volunteer Dashboard</h1>
        <p className="system-label mt-1">WELCOME, {user?.name?.toUpperCase()} // FIELD STATUS</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Role" value="Volunteer"/>
        <StatCard label="Status" value={user?.status || 'unassigned'}/>
        <StatCard label="Assigned Type" value={user?.assignedType || 'none'}/>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="system-label">Availability Control</h3>
            <p className="text-sm text-muted-foreground mt-2">Set whether you are ready to receive your next assignment.</p>
          </div>
          {savingStatus && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mt-1"/>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['available', 'unavailable'].map((option) => (<button
              key={option}
              type="button"
              disabled={savingStatus || availabilityLocked}
              onClick={() => handleStatusUpdate(option)}
              className={`rounded-lg border px-4 py-3 text-left transition-colors ${statusValue === option
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'} ${availabilityLocked ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className="system-label">{option === 'available' ? 'AVAILABLE' : 'UNAVAILABLE'}</div>
              <div className="mt-1 text-sm font-medium">{option === 'available' ? 'Ready for deployment' : 'Temporarily off duty'}</div>
            </button>))}
        </div>

        {availabilityLocked && (<div className="text-xs text-muted-foreground bg-secondary/40 border border-border rounded-md px-3 py-2">
            Your availability is locked while an assignment is active.
          </div>)}

        {statusError && (<div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
            {statusError}
          </div>)}

        {availabilityLocked && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAssignmentComplete}
              disabled={completingAssignment}
              className="btn-secondary text-sm"
            >
              {completingAssignment ? 'Completing...' : 'Mark Assignment Completed'}
            </button>
          </div>
        )}
      </div>

      {(user?.assignedLocationName || user?.assignedLocation) && (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="system-label">Assignment</h3>
          </div>
          <button
            type="button"
            disabled={!canExpandAssignment}
            onClick={() => {
              if (canExpandAssignment) {
                  setAssignmentExpanded(true);
              }
            }}
            className={`w-full px-4 py-6 text-left text-sm transition-colors ${canExpandAssignment ? 'text-muted-foreground hover:bg-secondary/20' : 'text-muted-foreground'}`}
          >
            {user?.assignedLocationName}
          </button>
        </div>
      )}

      <Sheet open={assignmentExpanded && Boolean(user?.assignedLocationName || user?.assignedLocation)} onOpenChange={setAssignmentExpanded}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{assignmentTitle}</SheetTitle>
            <SheetDescription>
              {assignmentLocation ? `${assignmentLocation} // ${formatAssignmentType(user?.assignedType || 'assignment')} details` : 'Assignment details'}
            </SheetDescription>
          </SheetHeader>

          {user?.assignedLocationName && (
            <div className="space-y-5 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailCard label="Assignment Type" value={formatAssignmentType(user?.assignedType || 'none')}/>
                <DetailCard label="Status" value={user?.status || 'unassigned'}/>
                <DetailCard
                  label={user?.assignedType === 'disasterZone' ? 'Severity' : 'Coordinates'}
                  value={user?.assignedType === 'disasterZone'
                      ? assignmentDetails?.severity || 'Not available'
                      : (assignmentDetails?.latitude !== undefined && assignmentDetails?.longitude !== undefined)
                          ? `${Number(assignmentDetails.latitude).toFixed(4)}, ${Number(assignmentDetails.longitude).toFixed(4)}`
                          : 'Not available'}
                />
                <DetailCard
                  label={user?.assignedType === 'disasterZone' ? 'Reported By' : 'Contact Person'}
                  value={user?.assignedType === 'disasterZone'
                      ? assignmentDetails?.reportedBy?.name || 'Public user'
                      : assignmentDetails?.contactPerson || 'Not available'}
                />
              </div>

              {assignmentLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin"/>
                  Loading assignment details...
                </div>
              )}

              {assignmentError && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
                  {assignmentError}
                </div>
              )}

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Location</h3>
                </div>
                <div className="px-4 py-4 space-y-3">
                  <div className="flex items-start gap-2 text-sm text-foreground">
                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                    <span>{assignmentLocation || user?.assignedLocationName}</span>
                  </div>
                  {(assignmentDetails?.latitude !== undefined && assignmentDetails?.longitude !== undefined) && (
                    <div className="font-mono text-xs text-muted-foreground">
                      {Number(assignmentDetails.latitude).toFixed(4)}, {Number(assignmentDetails.longitude).toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="system-label">Description</h3>
                </div>
                <div className="px-4 py-4 text-sm text-muted-foreground space-y-3">
                  <div className="flex items-start gap-2">
                    {user?.assignedType === 'disasterZone'
                        ? <AlertTriangle className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                        : <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground"/>}
                    <span>{assignmentSummary}</span>
                  </div>

                  {user?.assignedType === 'reliefCenter' && assignmentDetails?.contactPerson && (
                    <div className="flex items-start gap-2">
                      <UserIcon className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                      <span>Managed by {assignmentDetails.contactPerson}</span>
                    </div>
                  )}

                  {user?.assignedType === 'reliefCenter' && assignmentDetails?.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 mt-0.5 text-muted-foreground"/>
                      <span>Primary support line: {assignmentDetails.phone}</span>
                    </div>
                  )}

                  {user?.assignedType === 'disasterZone' && assignmentDetails?.description && (
                    <p>{assignmentDetails.description}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>);
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


function assignedLabel(assigned, total) {
    return `${assigned}/${total}`;
}

function StatCard({ label, value }) {
    return (<div className="stat-card space-y-1">
      <div>
        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">{label}</p>
        <p className="text-2xl font-mono font-bold text-foreground">{value}</p>
      </div>
    </div>);
}
