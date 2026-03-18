import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from "next-themes";
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';

const roles = [
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' },
];

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('volunteer');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (role === 'user') {
            navigate('/disasters?report=true');
            return;
        }
        if (!email || !password) {
            setError('All fields required');
            return;
        }
        const result = await login(email, password, role);
        if (result.success)
            navigate('/dashboard');
        else
            setError(result.message || 'Invalid credentials');
    };
    return (<div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-end mb-3">
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card/80 p-2 text-foreground shadow-sm hover:bg-card"
          >
            {theme === "dark" ? <Moon className="h-4 w-4"/> : <Sun className="h-4 w-4"/>}
          </button>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/Logo.jpg" alt="ReliefGrid" className="mx-auto mb-4 h-14 w-14 rounded-full object-contain bg-card border border-border"/>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">ReliefGrid</h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">DISASTER RELIEF MANAGEMENT TRACKER</p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Sign In</h2>
            <p className="text-xs text-muted-foreground mt-1">Access your command dashboard</p>
          </div>

          {error && (<div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">
              {error}
            </div>)}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="system-label mb-1.5 block">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="input-field">
                {roles.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
              </select>
            </div>
            {role !== 'user' && (<>
                <div>
                  <label className="system-label mb-1.5 block">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="admin@relief.org"/>
                </div>
                <div>
                  <label className="system-label mb-1.5 block">Password</label>
                  <div className="relative">
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-10" placeholder="Password"/>
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </button>
                  </div>
                </div>
              </>)}
            <button type="submit" className="btn-primary w-full">
              {role === 'user' ? 'Continue to Report' : 'Authenticate'}
            </button>
          </form>

          {role === 'user' && (<div className="text-xs text-muted-foreground bg-secondary/40 border border-border rounded-md px-3 py-2">
              Users do not need an account. Continue to report a disaster directly.
            </div>)}

          <div className="text-center">
            <Link to="/signup" className="text-xs text-primary hover:underline">
              Create new account →
            </Link>
          </div>
        </div>
      </div>
    </div>);
}

