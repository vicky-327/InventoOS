import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Lock, Mail, Building2, User } from 'lucide-react';
import apiClient from '../api/client';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Login Form
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register Form
    const [tenantName, setTenantName] = useState('');
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const res = await apiClient.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            localStorage.setItem('access_token', res.data.access_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await apiClient.post('/auth/register', {
                name: tenantName,
                admin_email: regEmail,
                admin_password: regPassword,
                admin_full_name: fullName
            });
            // Auto login after reg
            const formData = new URLSearchParams();
            formData.append('username', regEmail);
            formData.append('password', regPassword);

            const res = await apiClient.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
            localStorage.setItem('access_token', res.data.access_token);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container" style={{ alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at top, #1E2530 0%, #0B0E14 100%)' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <Package color="white" size={24} />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>
                        {isLogin ? 'Welcome Back' : 'Create Organization'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {isLogin ? 'Enter your credentials to access your account' : 'Set up your multi-tenant inventory workspace'}
                    </p>
                </div>

                {error && (
                    <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '6px', fontSize: '14px', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {isLogin ? (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                            <input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} required className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '14px', marginTop: '8px' }}>
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ position: 'relative' }}>
                            <Building2 size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Organization Name" value={tenantName} onChange={e => setTenantName(e.target.value)} required className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                            <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                            <input type="email" placeholder="Admin Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', top: '14px', left: '14px', color: 'var(--text-muted)' }} />
                            <input type="password" placeholder="Secure Password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required className="input" style={{ paddingLeft: '40px' }} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '14px', marginTop: '8px' }}>
                            {loading ? 'Creating workspace...' : 'Register Workspace'}
                        </button>
                    </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                        {isLogin ? "Don't have an organization? Register" : "Already registered? Sign in"}
                    </button>
                </div>

            </div>
        </div>
    );
}
