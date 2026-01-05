import { ZinePage, ZineText, HandDrawnFrame } from '../../components/ui/ZineUI';
import { useSubscription } from '../../hooks/useSubscription';
import type { Plan } from '../../hooks/useSubscription';

interface PricingPageProps {
  isAuthenticated: boolean;
  onOpenAuth: () => void;
  onNavigate: (path: string) => void;
}

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M3 8L6.5 11.5L13 4.5"
      stroke="#4A7C59"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface PlanCardProps {
  plan: Plan;
  isCurrentPlan: boolean;
  onSelect: () => void;
  isPopular?: boolean;
}

function PlanCard({ plan, isCurrentPlan, onSelect, isPopular }: PlanCardProps) {
  const priceDisplay = plan.price_monthly === 0
    ? 'Gratis'
    : `${(plan.price_monthly / 100).toFixed(2).replace('.', ',')} /mese`;

  const messagesDisplay = plan.messages_per_day === -1
    ? 'Illimitati'
    : `${plan.messages_per_day}/giorno`;

  const recipesDisplay = plan.max_saved_recipes === -1
    ? 'Illimitate'
    : `${plan.max_saved_recipes} max`;

  return (
    <div style={{ position: 'relative' }}>
      {isPopular && (
        <div
          style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#4A7C59',
            color: 'white',
            fontFamily: "'Caveat', cursive",
            fontSize: '14px',
            padding: '2px 12px',
            borderRadius: '12px',
            zIndex: 1,
          }}
        >
          Consigliato
        </div>
      )}

      <HandDrawnFrame
        style={{
          padding: '24px',
          textAlign: 'center',
          background: isPopular ? 'rgba(74, 124, 89, 0.05)' : 'transparent',
        }}
      >
        <ZineText size="xl" style={{ display: 'block', marginBottom: '8px' }}>
          {plan.display_name}
        </ZineText>

        <div
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '32px',
            color: '#2D2A26',
            marginBottom: '16px',
          }}
        >
          {priceDisplay}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '16px',
            color: '#5C5A56',
            marginBottom: '4px',
          }}>
            Messaggi: {messagesDisplay}
          </div>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: '16px',
            color: '#5C5A56',
          }}>
            Ricette salvate: {recipesDisplay}
          </div>
        </div>

        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 24px 0',
          textAlign: 'left',
        }}>
          {plan.features.map((feature, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontFamily: "'Caveat', cursive",
                fontSize: '16px',
                color: '#5C5A56',
              }}
            >
              <CheckIcon />
              {feature}
            </li>
          ))}
        </ul>

        <button
          onClick={onSelect}
          disabled={isCurrentPlan}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontFamily: "'Caveat', cursive",
            fontSize: '18px',
            background: isCurrentPlan
              ? '#E8E6E2'
              : isPopular
                ? '#4A7C59'
                : '#2D2A26',
            color: isCurrentPlan ? '#8B857C' : 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isCurrentPlan ? 'default' : 'pointer',
            opacity: isCurrentPlan ? 0.6 : 1,
          }}
        >
          {isCurrentPlan
            ? 'Piano attuale'
            : plan.price_monthly === 0
              ? 'Inizia gratis'
              : 'Scegli questo piano'}
        </button>
      </HandDrawnFrame>
    </div>
  );
}

export default function PricingPage({
  isAuthenticated,
  onOpenAuth,
  onNavigate,
}: PricingPageProps) {
  const { plans, subscription, usage, isLoading, error, startCheckout } = useSubscription(isAuthenticated);

  const handleSelectPlan = async (planId: string) => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (planId === 'free') {
      // Already on free, or downgrading - use portal
      if (subscription?.stripe_subscription_id) {
        // User has a paid plan, need to cancel via portal
        // For now, just navigate to settings
        onNavigate('/settings');
      }
      return;
    }

    // Start checkout for pro or premium
    await startCheckout(planId);
  };

  return (
    <ZinePage>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <ZineText size="xxl" style={{ display: 'block', marginBottom: '8px' }}>
            Piani e Prezzi
          </ZineText>
          <ZineText size="lg" style={{ color: '#8B857C', display: 'block' }}>
            Scegli il piano perfetto per le tue esigenze in cucina
          </ZineText>
        </div>

        {/* Usage meter for authenticated users */}
        {isAuthenticated && usage && (
          <div style={{ marginBottom: '32px' }}>
            <HandDrawnFrame style={{ padding: '16px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <div>
                  <ZineText size="md">
                    Messaggi oggi: {usage.messages.count}/{usage.messages.limit === -1 ? 'illimitati' : usage.messages.limit}
                  </ZineText>
                </div>
                <div>
                  <ZineText size="md">
                    Ricette salvate: {usage.recipes.count}/{usage.recipes.limit === -1 ? 'illimitate' : usage.recipes.limit}
                  </ZineText>
                </div>
              </div>

              {/* Progress bar for messages */}
              {usage.messages.limit !== -1 && (
                <div style={{
                  marginTop: '12px',
                  height: '8px',
                  background: '#E8E6E2',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div
                    style={{
                      width: `${Math.min(100, (usage.messages.count / usage.messages.limit) * 100)}%`,
                      height: '100%',
                      background: usage.messages.isLimitReached ? '#C9302C' : '#4A7C59',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              )}
            </HandDrawnFrame>
          </div>
        )}

        {error && (
          <div style={{
            marginBottom: '24px',
            padding: '12px',
            background: '#FFF5F5',
            borderRadius: '8px',
            fontFamily: "'Caveat', cursive",
            fontSize: '16px',
            color: '#C9302C',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <ZineText size="lg">Caricamento...</ZineText>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px',
          }}>
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={subscription?.plan_id === plan.id}
                onSelect={() => handleSelectPlan(plan.id)}
                isPopular={plan.id === 'pro'}
              />
            ))}
          </div>
        )}

        {/* Back button */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <button
            onClick={() => onNavigate('/chat')}
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: '18px',
              color: '#5C5A56',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Torna alla chat
          </button>
        </div>
      </div>
    </ZinePage>
  );
}
