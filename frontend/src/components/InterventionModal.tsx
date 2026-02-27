import React, { useEffect } from 'react';

export interface ModalIntervention {
  type: 'high_purchase_intent' | 'furniture_interest' | 'fragrance_interest';
}

interface InterventionModalProps {
  intervention: ModalIntervention | null;
  onClose: () => void;
}

const INTERVENTION_CONTENT: Record<
  ModalIntervention['type'],
  {
    emoji: string;
    heading: string;
    subheading: string;
    body: string;
    code?: string;
    codeLabel?: string;
    cta: string;
    gradient: string;
    accentColor: string;
  }
> = {
  high_purchase_intent: {
    emoji: '🛒',
    heading: "You're so close!",
    subheading: 'Complete your order today',
    body: "You've been browsing some great items. Checkout in the next 30 minutes and get free express shipping — no minimum spend.",
    code: 'EXPRESSNOW',
    codeLabel: 'Free express shipping code',
    cta: 'Shop Now',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    accentColor: '#e94560',
  },
  furniture_interest: {
    emoji: '🛋️',
    heading: 'Elevate your space',
    subheading: 'Exclusive furniture offer, just for you',
    body: "We noticed you love home & living. For the next hour, enjoy 20% off our entire furniture and décor collection.",
    code: 'HOME20',
    codeLabel: 'Your exclusive discount code',
    cta: 'Redeem Offer',
    gradient: 'linear-gradient(135deg, #2d4a22 0%, #4a7c59 50%, #6aab6e 100%)',
    accentColor: '#f0e68c',
  },
  fragrance_interest: {
    emoji: '🌸',
    heading: 'Find your signature scent',
    subheading: 'A fragrance offer crafted for you',
    body: 'Treat yourself. Get a complimentary fragrance sample with any beauty purchase today — discover your next favourite.',
    code: 'SCENT2025',
    codeLabel: 'Use at checkout',
    cta: 'Claim Your Sample',
    gradient: 'linear-gradient(135deg, #4a0a4a 0%, #8b2fc9 50%, #c47ae0 100%)',
    accentColor: '#ffd1f5',
  },
};

function InterventionModal({ intervention, onClose }: InterventionModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!intervention) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [intervention, onClose]);

  if (!intervention) return null;

  const content = INTERVENTION_CONTENT[intervention.type];

  return (
    <div className="intervention-modal-overlay" onClick={onClose}>
      <div
        className="intervention-modal"
        style={{ background: content.gradient }}
        onClick={e => e.stopPropagation()}
      >
        <button className="intervention-modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="intervention-modal-emoji">{content.emoji}</div>

        <div className="intervention-modal-body">
          <p className="intervention-modal-subheading" style={{ color: content.accentColor }}>
            {content.subheading}
          </p>
          <h2 className="intervention-modal-heading">{content.heading}</h2>
          <p className="intervention-modal-text">{content.body}</p>

          {content.code && (
            <div className="intervention-modal-code-block">
              <span className="intervention-modal-code-label">{content.codeLabel}</span>
              <div className="intervention-modal-code" style={{ borderColor: content.accentColor }}>
                <span>{content.code}</span>
                <button
                  className="intervention-modal-copy"
                  style={{ color: content.accentColor }}
                  onClick={() => navigator.clipboard?.writeText(content.code!)}
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <button
            className="intervention-modal-cta"
            style={{ background: content.accentColor }}
            onClick={onClose}
          >
            {content.cta}
          </button>
        </div>
      </div>
    </div>
  );
}

export default InterventionModal;
