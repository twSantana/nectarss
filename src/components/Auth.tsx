import { useState } from 'react';
import { supabase } from '../supabase';

interface AuthProps {
    onLogin: () => void;
}

export function Auth({ onLogin }: AuthProps) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage({ text: 'Conta criada com sucesso! Você já pode entrar.', type: 'success' });
                setIsSignUp(false); // Switch to login view
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onLogin();
            }
        } catch (error: any) {
            setMessage({ text: error.message || 'Ocorreu um erro.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Nectar's
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {isSignUp ? 'Crie sua conta' : 'Acesse suas finanças'}
                    </p>
                </div>

                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            style={{ width: '100%', padding: '12px', fontSize: '15px' }}
                        />
                    </div>

                    {message && (
                        <div style={{
                            padding: '12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center',
                            background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: message.type === 'error' ? 'var(--expense-color)' : 'var(--income-color)',
                            border: `1px solid ${message.type === 'error' ? 'var(--expense-color)' : 'var(--income-color)'}`
                        }}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ width: '100%', padding: '14px', marginTop: '8px', fontWeight: 600, fontSize: '15px', background: 'var(--accent-color)' }}
                    >
                        {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setMessage(null);
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Ainda não tem conta? Cadastre-se'}
                    </button>
                </div>
            </div>
        </div>
    );
}
