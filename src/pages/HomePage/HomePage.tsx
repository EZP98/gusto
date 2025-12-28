import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ZinePage,
  ZineText,
  ZineRecipeCard,
  ZineNoteCard,
  HandDrawnFrame,
  DoubleFrame,
  UnderlinedText,
  HandArrow,
  SketchChef,
  SketchBook,
  SketchCalendar,
  SketchEggs,
  SketchPasta,
  SketchBowl,
  SketchTomato,
  SketchBasil,
  SketchHeart
} from '../../components/ui/ZineUI';

const featuredRecipes = [
  {
    title: 'Uova in Purgatorio',
    note: 'comfort food della domenica',
    time: '15 min',
    Illustration: SketchEggs,
    annotations: ['provata!', '★★★★']
  },
  {
    title: 'Pasta al Pomodoro',
    note: 'la semplicità che vince sempre',
    time: '20 min',
    Illustration: SketchPasta,
    annotations: ['ricetta della nonna']
  },
  {
    title: 'Buddha Bowl',
    note: 'un arcobaleno di sapori',
    time: '25 min',
    Illustration: SketchBowl
  }
];

export default function HomePage() {
  const [question, setQuestion] = useState('');
  const navigate = useNavigate();

  const handleAsk = () => {
    if (question.trim()) {
      navigate('/chat', { state: { initialMessage: question } });
    }
  };

  return (
    <ZinePage>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ marginBottom: '16px' }}>
            <SketchChef size={80} />
          </div>

          <ZineText size="xxl" style={{ display: 'block', marginBottom: '8px' }}>
            Chef AI
          </ZineText>

          <ZineText size="lg" style={{ color: '#8B857C', display: 'block', marginBottom: '24px' }}>
            il tuo assistente in cucina
          </ZineText>

          {/* Ask Input */}
          <HandDrawnFrame style={{ textAlign: 'left', padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder="cosa vuoi cucinare oggi? chiedi allo chef..."
                style={{
                  width: '100%',
                  minHeight: '60px',
                  fontFamily: "'Caveat', cursive",
                  fontSize: '20px',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  color: '#2D2A26',
                  lineHeight: 1.4
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleAsk}
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: '18px',
                    padding: '8px 20px',
                    background: '#2D2A26',
                    color: '#FAF7F2',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  chiedi <HandArrow direction="right" size={16} />
                </button>
              </div>
            </div>
          </HandDrawnFrame>
        </div>

        {/* Welcome Note */}
        <ZineNoteCard
          highlight="Ciao!"
          style={{ marginBottom: '40px' }}
        >
          <ZineText size="md" style={{ lineHeight: 1.6, display: 'block' }}>
            Sono qui per aiutarti a cucinare cose buone.
            Chiedimi una ricetta, suggeriscimi cosa fare con gli ingredienti che hai,
            o lasciati ispirare dalle <UnderlinedText>ricette del giorno</UnderlinedText>.
          </ZineText>
        </ZineNoteCard>

        {/* Quick Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
          <Link to="/recipes" style={{ textDecoration: 'none' }}>
            <HandDrawnFrame style={{ textAlign: 'center', padding: '20px 12px' }}>
              <SketchBook size={40} />
              <ZineText size="sm" style={{ display: 'block', marginTop: '8px' }}>
                ricette
              </ZineText>
            </HandDrawnFrame>
          </Link>

          <Link to="/meal-planner" style={{ textDecoration: 'none' }}>
            <HandDrawnFrame style={{ textAlign: 'center', padding: '20px 12px' }}>
              <SketchCalendar size={40} />
              <ZineText size="sm" style={{ display: 'block', marginTop: '8px' }}>
                planner
              </ZineText>
            </HandDrawnFrame>
          </Link>

          <Link to="/chat" style={{ textDecoration: 'none' }}>
            <HandDrawnFrame style={{ textAlign: 'center', padding: '20px 12px' }}>
              <SketchChef size={40} />
              <ZineText size="sm" style={{ display: 'block', marginTop: '8px' }}>
                chef AI
              </ZineText>
            </HandDrawnFrame>
          </Link>
        </div>

        {/* Featured Recipes */}
        <div style={{ marginBottom: '48px' }}>
          <ZineText size="xl" underline style={{ display: 'block', marginBottom: '24px' }}>
            ricette del momento
          </ZineText>

          {featuredRecipes.map((recipe, i) => (
            <ZineRecipeCard
              key={i}
              {...recipe}
            />
          ))}
        </div>

        {/* Ingredients Showcase */}
        <div style={{ marginBottom: '48px' }}>
          <ZineText size="lg" style={{ display: 'block', marginBottom: '16px', color: '#6B6560' }}>
            cosa c'è in frigo?
          </ZineText>

          <div style={{ display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <DoubleFrame style={{ background: '#FAF7F2', padding: '16px', textAlign: 'center' }}>
              <SketchTomato size={48} />
              <ZineText size="xs" style={{ display: 'block', marginTop: '4px', color: '#8B857C' }}>
                pomodori
              </ZineText>
            </DoubleFrame>

            <DoubleFrame style={{ background: '#FAF7F2', padding: '16px', textAlign: 'center' }}>
              <SketchEggs size={48} />
              <ZineText size="xs" style={{ display: 'block', marginTop: '4px', color: '#8B857C' }}>
                uova
              </ZineText>
            </DoubleFrame>

            <DoubleFrame style={{ background: '#FAF7F2', padding: '16px', textAlign: 'center' }}>
              <SketchBasil size={48} />
              <ZineText size="xs" style={{ display: 'block', marginTop: '4px', color: '#8B857C' }}>
                basilico
              </ZineText>
            </DoubleFrame>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link to="/chat" style={{ textDecoration: 'none' }}>
              <ZineText size="md" style={{ color: '#6B6560' }}>
                <HandArrow direction="right" size={20} /> dimmi cosa hai e ti suggerisco una ricetta
              </ZineText>
            </Link>
          </div>
        </div>

        {/* Quote */}
        <div style={{
          textAlign: 'center',
          padding: '32px',
          borderTop: '1px solid #E8E3DB',
          borderBottom: '1px solid #E8E3DB'
        }}>
          <ZineText size="lg" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>
            "La cucina è amore reso visibile"
          </ZineText>
          <ZineText size="sm" style={{ color: '#8B857C', display: 'block', marginTop: '8px' }}>
            — la nonna
          </ZineText>
        </div>

        {/* Footer doodle */}
        <div style={{
          textAlign: 'center',
          marginTop: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <ZineText size="sm" style={{ color: '#A8A4A0' }}>
            fatto con
          </ZineText>
          <SketchHeart size={16} />
          <ZineText size="sm" style={{ color: '#A8A4A0' }}>
            e un pizzico di AI
          </ZineText>
        </div>

      </div>
    </ZinePage>
  );
}
