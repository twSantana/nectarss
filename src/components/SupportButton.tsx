import { Heart } from 'lucide-react';

export function SupportButton() {
    return (
        <a
            href="https://link.mercadopago.com.br/modinhas"
            target="_blank"
            rel="noopener noreferrer"
            className="animate-bounce"
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'linear-gradient(135deg, var(--accent-color), #ec4899)',
                color: '#fff',
                borderRadius: '30px',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
                boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(236, 72, 153, 0.5)';
                e.currentTarget.style.animationPlayState = 'paused';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(236, 72, 153, 0.3)';
                e.currentTarget.style.animationPlayState = 'running';
            }}
        >
            <Heart size={18} fill="currentColor" />
            Apoie o criador
        </a>
    );
}
