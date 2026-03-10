import { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabase';
import type { Session } from '@supabase/supabase-js';

interface UserProfileProps {
    onOpenRecurring?: () => void;
    session?: Session | null;
}

export function UserProfile({ onOpenRecurring, session }: UserProfileProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsOpen(false);
    };

    const handleEditProfile = () => {
        alert("Página de edição de perfil (em breve!)");
        setIsOpen(false);
    };

    return (
        <div style={{ position: 'relative' }} ref={menuRef}>
            <button
                onClick={toggleMenu}
                style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    boxShadow: 'var(--glass-shadow)',
                    transition: 'all 0.2s',
                    overflow: 'hidden'
                }}
                title="Perfil"
            >
                {session ? (
                    // Iniciais do usuário
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--accent-color)' }}>
                        {session.user.email?.charAt(0)?.toUpperCase()}
                    </span>
                ) : (
                    // Ícone genérico de usuário
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                )}
            </button>

            {isOpen && (
                <div
                    className="glass-panel animate-fade-in"
                    style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '12px',
                        minWidth: '200px',
                        padding: '12px',
                        zIndex: 50,
                        background: 'var(--bg-primary)', // Makes it almost fully opaque using the theme's base color
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                        border: '1px solid var(--glass-border)',
                        animationDuration: '0.2s'
                    }}
                >
                    {session ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--glass-border)', marginBottom: '4px' }}>
                                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Conta Autenticada</p>
                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{session.user.email}</p>
                            </div>
                            <button
                                onClick={handleEditProfile}
                                style={{ width: '100%', textAlign: 'left', background: 'transparent', color: 'var(--text-primary)', padding: '10px 12px' }}
                            >
                                Editar Perfil
                            </button>
                            <button
                                onClick={() => {
                                    if (onOpenRecurring) onOpenRecurring();
                                    setIsOpen(false);
                                }}
                                style={{ width: '100%', textAlign: 'left', background: 'transparent', color: 'var(--text-primary)', padding: '10px 12px' }}
                            >
                                Contas Recorrentes
                            </button>
                            <button
                                onClick={handleLogout}
                                style={{ width: '100%', textAlign: 'left', background: 'transparent', color: 'var(--expense-color)', padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', borderRadius: 0 }}
                            >
                                Sair
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '8px' }}>
                                Acesso Restrito
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
