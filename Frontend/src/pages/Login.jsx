import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('All fields required');
            return;
        }
        const ok = login(email, password);
        if (ok)
            navigate('/dashboard');
        else
            setError('Invalid credentials');
    };
    return (<div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">DRRT Command</h1>
          <p className="text-sm text-muted-foreground mt-1 font-mono">DISASTER RELIEF RESOURCE TRACKER</p>
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
              <label className="system-label mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="admin@relief.org"/>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="input-field pr-10" placeholder="••••••••"/>
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">
              Authenticate
            </button>
          </form>

          <div className="text-center">
            <Link to="/signup" className="text-xs text-primary hover:underline">
              Create new account →
            </Link>
          </div>
        </div>

        {/* Demo creds */}
        <div className="mt-6 bg-card/50 border border-border rounded-lg p-4">
          <div className="system-label mb-2">Demo Credentials</div>
          <div className="space-y-1 text-xs font-mono text-muted-foreground">
            <div><span className="text-red-400">Admin:</span> admin@relief.org / admin123</div>
            <div><span className="text-blue-400">Volunteer:</span> volunteer@relief.org / vol123</div>
            <div><span className="text-green-400">Coordinator:</span> coord@relief.org / coord123</div>
          </div>
        </div>
      </div>
    </div>);
}
