import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from "next-themes";
import { LayoutDashboard, AlertTriangle, Building2, Package, Users, Truck, Map, LogOut, Menu, X, ChevronRight, Sun, Moon } from 'lucide-react';
const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/disasters', label: 'Disasters', icon: AlertTriangle },
    { to: '/centers', label: 'Relief Centers', icon: Building2 },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/volunteers', label: 'Volunteers', icon: Users },
    { to: '/dispatch', label: 'Dispatch', icon: Truck },
    { to: '/map', label: 'Map View', icon: Map },
];
const volunteerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/disasters', label: 'Disaster Zones', icon: AlertTriangle },
    { to: '/map', label: 'Map View', icon: Map },
];
const coordinatorLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/disasters', label: 'Disasters', icon: AlertTriangle },
    { to: '/dispatch', label: 'Dispatch Track', icon: Truck },
    { to: '/map', label: 'Map View', icon: Map },
];
export default function AppLayout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { theme, setTheme } = useTheme();
    const links = user?.role === 'admin' ? adminLinks : user?.role === 'volunteer' ? volunteerLinks : coordinatorLinks;
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const roleLabel = user?.role === 'admin' ? 'ADMIN' : user?.role === 'volunteer' ? 'VOLUNTEER' : 'COORDINATOR';
    const roleColor = user?.role === 'admin' ? 'text-red-400' : user?.role === 'volunteer' ? 'text-blue-400' : 'text-green-400';
    return (<div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (<div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)}/>)}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-200 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
          <img src="/Logo.jpg" alt="ReliefGrid" className="h-9 w-9 rounded-full object-contain bg-card border border-border"/>
          <div>
            <div className="text-sm font-bold tracking-tight text-foreground">ReliefGrid</div>
            <div className="text-[10px] font-mono text-muted-foreground">COMMAND CENTER</div>
          </div>
          <button className="ml-auto lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-sidebar-border">
          <div className="text-[10px] font-mono text-muted-foreground">ACTIVE ROLE</div>
          <div className={`text-xs font-bold font-mono ${roleColor}`}>{roleLabel}</div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {links.map(link => (<NavLink key={link.to} to={link.to} onClick={() => setSidebarOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150
                ${isActive
                ? 'bg-sidebar-accent text-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'}`}>
              <link.icon className="w-4 h-4"/>
              {link.label}
              <ChevronRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-50"/>
            </NavLink>))}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{user?.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 transition-colors">
            <LogOut className="w-3.5 h-3.5"/>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-4 px-4 py-3 border-b border-border bg-card/60 backdrop-blur lg:px-6">
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5"/>
          </button>
          <div className="flex-1"/>
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-card"
          >
            {theme === "dark" ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}
            <span className="hidden sm:inline">{theme === "dark" ? "Dark" : "Light"}</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>);
}
