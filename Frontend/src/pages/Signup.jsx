import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const roles = [
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'admin', label: 'Admin' },
    { value: 'user', label: 'User' },
];

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('volunteer');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (role === 'user') {
            navigate('/disasters?report=true');
            return;
        }
        if (!name || !email || !password) {
            setError('All fields required');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        const result = await signup(name, email, password, role);
        if (result.success)
            navigate('/dashboard');
        else
            setError(result.message || 'Email already exists');
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
        <div className="text-center mb-8">
          <img src="/Logo.jpg" alt="ReliefGrid" className="mx-auto mb-4 h-14 w-14 rounded-full object-contain bg-card border border-border"/>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Join ReliefGrid</h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">REGISTER FOR DISASTER RESPONSE</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Create Account</h2>
            <p className="text-xs text-muted-foreground mt-1">Select your role and sign up</p>
          </div>

          {error && (<div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2 rounded-md">{error}</div>)}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="system-label mb-1.5 block">Role</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="input-field">
                {roles.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
              </select>
            </div>
            {role !== 'user' && (<>
                <div>
                  <label className="system-label mb-1.5 block">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" placeholder="John Doe"/>
                </div>
                <div>
                  <label className="system-label mb-1.5 block">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com"/>
                </div>
                <div>
                  <label className="system-label mb-1.5 block">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" placeholder="Min 6 characters"/>
                </div>
              </>)}
            <div className="text-xs text-muted-foreground bg-secondary/40 border border-border rounded-md px-3 py-2">
              {role === 'user' ? 'Users do not need an account. Continue to the disaster report page.' : 'Create an account for the selected role.'}
            </div>
            <button type="submit" className="btn-primary w-full">{role === 'user' ? 'Continue to Report' : 'Create Account'}</button>
          </form>

          <div className="text-center">
            <Link to="/login" className="text-xs text-primary hover:underline">← Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>);
}

