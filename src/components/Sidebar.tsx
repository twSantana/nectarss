import { Home, Wallet, PieChart, Target, Palette, FileText, ChevronDown, Users } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import type { Family } from '../types';
import { UserProfile } from './UserProfile';

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    session: Session | null;
    onOpenRecurring: () => void;
    theme: string;
    onToggleTheme: () => void;
    families: Family[];
    activeFamilyId: string | null;
    setActiveFamilyId: (id: string | null) => void;
    onOpenFamilyManager: () => void;
}

export function Sidebar({ activeSection, setActiveSection, session, onOpenRecurring, theme, onToggleTheme, families, activeFamilyId, setActiveFamilyId, onOpenFamilyManager }: SidebarProps) {
    const menuItems = [
        { id: 'home', label: 'Início', icon: Home },
        { id: 'transactions', label: 'Transações', icon: Wallet },
        { id: 'debts', label: 'Contas a Pagar', icon: FileText },
        { id: 'goals', label: 'Metas', icon: Target },
        { id: 'reports', label: 'Relatórios', icon: PieChart },
    ];

    return (
        <aside style={{
            width: '240px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRight: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            padding: '24px 16px',
            position: 'sticky',
            top: 0
        }}>
            <div style={{ paddingLeft: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-color), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', flexShrink: 0 }}>
                    N
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Nectar's</h2>
            </div>

            {/* Workspace Switcher */}
            <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '8px', fontWeight: 600 }}>Espaço Atual</p>
                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <select 
                        value={activeFamilyId || ''} 
                        onChange={e => setActiveFamilyId(e.target.value || null)}
                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', flex: 1, outline: 'none', appearance: 'none', fontWeight: 500, cursor: 'pointer' }}
                    >
                        <option value="">👤 Pessoal</option>
                        {families.map(f => (
                            <option key={f.id} value={f.id}>👨‍👩‍👧‍👦 {f.name}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} color="var(--text-secondary)" style={{ pointerEvents: 'none' }} />
                </div>
                <button onClick={onOpenFamilyManager} style={{ marginTop: '8px', background: 'transparent', border: 'none', color: 'var(--accent-color)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', padding: 0 }}>
                    <Users size={12} /> Gerenciar Famílias
                </button>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            background: activeSection === item.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            border: 'none',
                            borderRadius: '12px',
                            color: activeSection === item.id ? '#fff' : 'var(--text-secondary)',
                            cursor: 'pointer',
                            textAlign: 'left',
                            width: '100%',
                            transition: 'all 0.2s ease',
                            fontWeight: activeSection === item.id ? 500 : 400,
                        }}
                    >
                        <item.icon size={20} strokeWidth={activeSection === item.id ? 2.5 : 2} />
                        {item.label}
                    </button>
                ))}

                <div style={{ height: '1px', background: 'var(--glass-border)', margin: '16px 0' }} />

                <button
                    onClick={onToggleTheme}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <Palette size={20} />
                    Tema ({theme === 'fierce' ? 'Enterprise' : 'Classic'})
                </button>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UserProfile session={session} onOpenRecurring={onOpenRecurring} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {session?.user.email || 'Usuário'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {activeFamilyId ? families.find(f => f.id === activeFamilyId)?.name : 'Conta Pessoal'}
                    </p>
                </div>
            </div>
        </aside>
    );
}
