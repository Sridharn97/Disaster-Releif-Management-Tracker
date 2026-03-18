import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { AlertTriangle, ArrowUpRight, Clock, Loader2, MapPin, Phone, User as UserIcon } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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

function buildPastDayLabels(dayCount) {
    const labels = [];
    for (let index = dayCount - 1; index >= 0; index -= 1) {
        const date = new Date();
        date.setDate(date.getDate() - index);
        labels.push({
            key: date.toISOString().slice(0, 10),
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        });
    }
    return labels;
}

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
        const availableVolunteers = data.volunteers.filter((volunteer) => volunteer.status === 'available').length;
        const unavailableVolunteers = data.volunteers.filter((volunteer) => volunteer.status === 'unavailable').length;
        const resourcesBySpace = data.inventorySpaces.map((space) => ({
            name: String(space.name || space.locationName || space.location || 'Space').split(' ')[0],
            stock: (space.resources || []).reduce((total, resource) => total + resource.quantity, 0),
        }));
        const severityData = [
            { name: 'Critical', value: data.disasters.filter(d => d.severity === 'Critical').length, color: '#ef4444' },
            { name: 'High', value: data.disasters.filter(d => d.severity === 'High').length, color: '#f97316' },
            { name: 'Medium', value: data.disasters.filter(d => d.severity === 'Medium').length, color: '#eab308' },
            { name: 'Low', value: data.disasters.filter(d => d.severity === 'Low').length, color: '#22c55e' },
        ].filter(item => item.value > 0);
        return {
            activeDisasters,
            assignedVolunteers,
            inTransit,
            availableVolunteers,
            unavailableVolunteers,
            resourcesBySpace,
            severityData,
        };
    }, [data]);

    const dispatchTrend = useMemo(() => {
        const labels = buildPastDayLabels(7);
        return labels.map((label) => ({
            day: label.day,
            dispatches: data.dispatches.filter((dispatch) => dispatch.dispatchedAt?.slice(0, 10) === label.key).length,
        }));
    }, [data.dispatches]);

    const disasterTrend = useMemo(() => {
        const labels = buildPastDayLabels(14);
        return labels.map((label) => ({
            day: label.day,
            reports: data.disasters.filter((disaster) => disaster.createdAt?.slice(0, 10) === label.key).length,
        }));
    }, [data.disasters]);

    const recentDisasters = useMemo(() => {
        const copy = [...data.disasters];
        copy.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        return copy.slice(0, 6);
    }, [data.disasters]);

    const recentDispatches = useMemo(() => {
        const copy = [...data.dispatches];
        copy.sort((a, b) => new Date(b.dispatchedAt || 0) - new Date(a.dispatchedAt || 0));
        return copy.slice(0, 6);
    }, [data.dispatches]);

    return (<div className="space-y-6">
      <header>
        <h1 className="command-header">Command Overview</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Disasters" value={loading ? '...' : summary.activeDisasters}/>
        <StatCard label="Relief Centers" value={loading ? '...' : data.centers.length}/>
        <StatCard label="Inventory Spaces" value={loading ? '...' : data.inventorySpaces.length}/>
        <StatCard label="Assigned Volunteers" value={loading ? '...' : assignedLabel(summary.assignedVolunteers, data.volunteers.length)}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="system-label mb-4">Resources by Space</h3>
          <div className="h-72">
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
          <div className="h-72 flex items-center justify-center">
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
          <div className="h-72">
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

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="system-label mb-4">New Disaster Reports</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={disasterTrend}>
                <defs>
                  <linearGradient id="reportsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke}/>
                <XAxis dataKey="day" stroke={chartAxisStroke} fontSize={11}/>
                <YAxis stroke={chartAxisStroke} fontSize={11} allowDecimals={false}/>
                <Tooltip contentStyle={chartTooltipStyle}/>
                <Area type="monotone" dataKey="reports" stroke="hsl(0 84% 60%)" strokeWidth={2} fill="url(#reportsGradient)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="system-label">Recent Disasters</h3>
            <Link to="/disasters" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="table-header">Type</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Severity</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr>
                    <td className="table-cell text-muted-foreground" colSpan={5}>Loading disasters...</td>
                  </tr>)}
                {!loading && recentDisasters.length === 0 && (<tr>
                    <td className="table-cell text-muted-foreground" colSpan={5}>No disasters found</td>
                  </tr>)}
                {recentDisasters.map((disaster) => (
                  <tr key={disaster._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="table-cell font-medium">{disaster.type || '-'}</td>
                    <td className="table-cell text-xs text-muted-foreground">{disaster.locationName || disaster.location || '-'}</td>
                    <td className="table-cell">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold border severity-${String(disaster.severity || 'medium').toLowerCase()}`}>
                        {disaster.severity || 'Medium'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium status-${String(disaster.status || 'active').toLowerCase()}`}>
                        {disaster.status || 'active'}
                      </span>
                    </td>
                    <td className="table-cell font-mono text-xs text-muted-foreground">
                      {disaster.createdAt ? new Date(disaster.createdAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="system-label">Quick Actions</h3>
            <div className="text-[10px] font-mono text-muted-foreground inline-flex items-center gap-1">
              <Clock className="w-3 h-3"/> {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Link to="/disasters?report=true" className="btn-destructive text-center">Report Disaster</Link>
            <Link to="/dispatch" className="btn-success text-center">Authorize Dispatch</Link>
            <Link to="/volunteers" className="btn-primary text-center">Assign Volunteers</Link>
            <Link to="/map" className="btn-secondary text-center">Open Map View</Link>
          </div>

          <div className="bg-secondary/20 border border-border rounded-lg p-3 space-y-2">
            <div className="text-xs font-bold text-foreground">Operational Highlights</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>- {summary.inTransit} dispatches currently in transit</div>
              <div>- {summary.availableVolunteers} volunteers available</div>
              <div>- {summary.unavailableVolunteers} volunteers unavailable</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="system-label">Recent Dispatches</h3>
            <Link to="/dispatch" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5"/>
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading && (
              <div className="px-4 py-3 text-sm text-muted-foreground">Loading dispatches...</div>
            )}
            {!loading && recentDispatches.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">No dispatches found</div>
            )}
            {recentDispatches.map((dispatch) => (
              <div key={dispatch._id} className="px-4 py-3 flex items-start justify-between gap-3 hover:bg-secondary/20 transition-colors">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{dispatch.toName || 'Dispatch destination'}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    From {dispatch.fromInventorySpace?.name || 'inventory'} • {dispatch.resources?.length || 0} item(s)
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className={`px-2 py-0.5 rounded text-xs font-medium inline-block ${dispatch.status === 'delivered' ? 'status-resolved' : 'status-contained'}`}>
                    {dispatch.status || 'in-transit'}
                  </div>
                  <div className="text-[11px] font-mono text-muted-foreground mt-1">
                    {dispatch.dispatchedAt ? new Date(dispatch.dispatchedAt).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 space-y-4">
          <h3 className="system-label">Volunteer Readiness</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DetailCard label="Available" value={loading ? '...' : summary.availableVolunteers}/>
            <DetailCard label="Assigned" value={loading ? '...' : summary.assignedVolunteers}/>
            <DetailCard label="Unavailable" value={loading ? '...' : summary.unavailableVolunteers}/>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Availability</span>
              <span className="font-mono">
                {loading || data.volunteers.length === 0 ? '—' : `${Math.round((summary.availableVolunteers / data.volunteers.length) * 100)}%`}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-secondary/30 overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{
                    width: loading || data.volunteers.length === 0 ? '0%' : `${(summary.availableVolunteers / data.volunteers.length) * 100}%`,
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground">
              {loading ? 'Loading volunteer roster...' : 'Aim to keep availability above 40% during peak activity.'}
            </div>
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
