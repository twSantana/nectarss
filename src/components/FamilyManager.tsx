import { useState } from 'react';
import type { Family } from '../types';
import { supabase } from '../supabase';
import { Users, Copy, Check, Plus, Upload, X } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface FamilyManagerProps {
    isOpen: boolean;
    onClose: () => void;
    families: Family[];
    session: Session | null;
    onFamilyCreatedOrJoined: () => void;
}

export function FamilyManager({ isOpen, onClose, families, session, onFamilyCreatedOrJoined }: FamilyManagerProps) {
    const [view, setView] = useState<'list' | 'create' | 'join'>('list');
    const [newFamilyName, setNewFamilyName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState('');

    if (!isOpen) return null;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(text);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleCreate = async () => {
        if (!newFamilyName.trim() || !session?.user?.id) return;
        
        setErrorMsg('');
        const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { data, error } = await supabase.from('families').insert({
            name: newFamilyName,
            owner_id: session.user.id,
            invite_code: shortCode
        }).select();

        if (error) {
            setErrorMsg(error.message);
            return;
        }

        if (data && data[0]) {
            // Also add the owner as a member
            await supabase.from('family_members').insert({
                family_id: data[0].id,
                user_id: session.user.id,
                role: 'owner'
            });
            onFamilyCreatedOrJoined();
            setView('list');
            setNewFamilyName('');
        }
    };

    const handleJoin = async () => {
        if (!inviteCode.trim() || !session?.user?.id) return;

        setErrorMsg('');
        
        // Chamada segura via RPC para ignorar bloqueio RLS na leitura inicial
        const { error } = await supabase.rpc('join_family', { p_invite_code: inviteCode.trim().toUpperCase() });

        if (error) {
            if (error.code === '23505' || error.message.includes('já faz parte')) setErrorMsg('Você já faz parte desta família.');
            else setErrorMsg(error.message || 'Convite inválido ou Família não encontrada.');
            return;
        }

        onFamilyCreatedOrJoined();
        setView('list');
        setInviteCode('');
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div className="glass-panel animate-fade-in" style={{ width: '90%', maxWidth: '480px', padding: '32px', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={28} color="var(--accent-color)" /> Gestão de Família
                </h2>

                {errorMsg && (
                    <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--expense-color)', color: 'var(--expense-color)', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                        {errorMsg}
                    </div>
                )}

                {view === 'list' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>Compartilhe seus gastos com outras pessoas. Crie ou ingresse em uma Família.</p>
                        
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button onClick={() => setView('create')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--accent-color)' }}>
                                <Plus size={18} /> Criar Família
                            </button>
                            <button onClick={() => setView('join')} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--glass-bg)', color: '#fff', border: '1px solid var(--glass-border)' }}>
                                <Upload size={18} /> Ingressar
                            </button>
                        </div>

                        <div style={{ marginTop: '24px' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'var(--text-secondary)' }}>Suas Famílias Atuais</h3>
                            {families.length === 0 ? (
                                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>Você ainda não participa de nenhuma família.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {families.map(f => (
                                        <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
                                            <div>
                                                <p style={{ fontWeight: 600, color: '#fff' }}>{f.name}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{f.owner_id === session?.user.id ? 'Administrador' : 'Membro'}</p>
                                                <p style={{ fontSize: '12px', color: 'var(--accent-color)', marginTop: '4px', fontFamily: 'monospace' }}>Código: {f.invite_code || '---'}</p>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {f.owner_id === session?.user.id && (
                                                    <button 
                                                        onClick={async () => {
                                                            if (window.confirm('Tem certeza que deseja apagar esta família? Todos os dados vinculados a ela serão perdidos permanentemente.')) {
                                                                const { error } = await supabase.from('families').delete().eq('id', f.id);
                                                                if (error) {
                                                                    alert("Ocorreu um erro ao apagar a família. Tem certeza que você colou a permissão DELETE no Supabase?\n\nErro interno: " + error.message);
                                                                } else {
                                                                    onFamilyCreatedOrJoined();
                                                                }
                                                            }
                                                        }}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: 'var(--expense-color)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}
                                                        title="Apagar Família"
                                                    >
                                                        Excluir
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => copyToClipboard(f.invite_code || '')}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', color: '#fff', border: 'none', cursor: 'pointer' }}
                                                    title="Copiar Código de Convite"
                                                >
                                                    {copiedId === f.invite_code ? <Check size={14} color="var(--income-color)" /> : <Copy size={14} />}
                                                    {copiedId === f.invite_code ? 'Copiado!' : 'Convite'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {view === 'create' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button onClick={() => setView('list')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: '8px' }}>← Voltar</button>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Nome da sua nova Família</label>
                            <input type="text" placeholder="Ex: Família Silva" value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} autoFocus />
                        </div>
                        <button onClick={handleCreate} disabled={!newFamilyName.trim()}>Criar e Gerar Convite</button>
                    </div>
                )}

                {view === 'join' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <button onClick={() => setView('list')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', cursor: 'pointer', textAlign: 'left', padding: 0, marginBottom: '8px' }}>← Voltar</button>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Código de Convite</label>
                            <input type="text" placeholder="Cole o código (ex: AX8J2P) aqui" value={inviteCode} onChange={e => setInviteCode(e.target.value)} autoFocus />
                        </div>
                        <button onClick={handleJoin} disabled={!inviteCode.trim()}>Ingressar</button>
                    </div>
                )}
            </div>
        </div>
    );
}
