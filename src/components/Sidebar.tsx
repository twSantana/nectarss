import { Home, Wallet, PieChart, TrendingUp, HelpCircle, Palette } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { UserProfile } from './UserProfile';

interface SidebarProps {
    activeSection: string;
    setActiveSection: (section: string) => void;
    session: Session | null;
    onOpenRecurring: () => void;
    theme: string;
    onToggleTheme: () => void;
}

export function Sidebar({ activeSection, setActiveSection, session, onOpenRecurring, theme, onToggleTheme }: SidebarProps) {
    const menuItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'cash', label: 'Cash', icon: Wallet },
        { id: 'budgets', label: 'Budgets', icon: PieChart },
        { id: 'invest', label: 'Invest', icon: TrendingUp },
        { id: 'help', label: 'Help', icon: HelpCircle },
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
            <div style={{ paddingLeft: '8px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--accent-color), #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    N
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>Nectar's</h2>
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
                    Theme ({theme})
                </button>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <UserProfile session={session} onOpenRecurring={onOpenRecurring} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {session?.user.email || 'Usuário'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Personal account</p>
                </div>
            </div>
        </aside>
    );
}
