import { useState, useEffect } from 'react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI to notify the user they can install the PWA
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Also check if app is already installed
        window.addEventListener('appinstalled', () => {
            setIsVisible(false);
            setDeferredPrompt(null);
            console.log('PWA was installed');
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // We no longer need the prompt. Clear it up.
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            padding: '16px 24px',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            zIndex: 9999,
            animation: 'fadeInUp 0.5s ease-out',
            width: 'calc(100% - 32px)',
            maxWidth: '400px'
        }}>
            <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '15px', color: '#fff' }}>Instalar o App</h4>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Adicione à tela inicial para acesso rápido offline.
                </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={() => setIsVisible(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '8px', fontSize: '13px', cursor: 'pointer' }}
                >
                    Agora não
                </button>
                <button
                    onClick={handleInstallClick}
                    style={{ background: 'var(--accent-color)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)' }}
                >
                    Instalar
                </button>
            </div>
        </div>
    );
}
