import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('volunteer');
    const [error, setError] = useState('');
    const { signup } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) {
            setError('All fields required');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        const ok = signup(name, email, password, role);
        if (ok)
            navigate('/dashboard');
        else
            setError('Email already exists');
    };
    return (<div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Join DRRT</h1>
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
            <div>
              <label className="system-label mb-1.5 block">Role</label>
              <div className="grid grid-cols-3 gap-2">
                {['admin', 'volunteer', 'coordinator'].map(r => (<button key={r} type="button" onClick={() => setRole(r)} className={`px-3 py-2 rounded-md text-xs font-bold uppercase border transition-colors ${role === r
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-secondary text-muted-foreground border-border hover:border-primary/30'}`}>
                    {r}
                  </button>))}
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">Create Account</button>
          </form>

          <div className="text-center">
            <Link to="/login" className="text-xs text-primary hover:underline">← Back to sign in</Link>
          </div>
        </div>
      </div>
    </div>);
}
