import { useState } from 'react';
import {
  ZinePage,
  ZineText,
  ZineButton,
  HandDrawnFrame,
  DoubleFrame,
  SketchCalendar,
  SketchChef,
  HandArrow
} from '../../components/ui/ZineUI';
import { Link } from 'react-router-dom';

const daysOfWeek = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

const mealTypes = [
  { id: 'breakfast', label: 'Colazione', emoji: '☕' },
  { id: 'lunch', label: 'Pranzo', emoji: '🌞' },
  { id: 'dinner', label: 'Cena', emoji: '🌙' },
];

const mockMealPlan: Record<string, Record<string, string>> = {
  'Lun': { breakfast: 'Yogurt e granola', lunch: 'Pasta al pomodoro', dinner: 'Pollo alla griglia' },
  'Mar': { breakfast: 'Toast con avocado', lunch: 'Insalata di riso', dinner: 'Pesce al forno' },
  'Mer': { breakfast: 'Pancakes', lunch: 'Risotto ai funghi', dinner: 'Pizza homemade' },
  'Gio': { breakfast: 'Smoothie bowl', lunch: 'Pasta e fagioli', dinner: '' },
  'Ven': { breakfast: 'Uova strapazzate', lunch: '', dinner: 'Sushi night' },
  'Sab': { breakfast: 'Brunch', lunch: '', dinner: 'Carbonara' },
  'Dom': { breakfast: 'Brioche', lunch: 'Lasagna', dinner: '' },
};

export default function MealPlannerPage() {
  const [currentWeek] = useState(0);
  const [mealPlan] = useState(mockMealPlan);

  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + currentWeek * 7);

    return daysOfWeek.map((_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return date;
    });
  };

  const weekDates = getWeekDates();

  return (
    <ZinePage>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <SketchCalendar size={48} />
          <ZineText size="xxl" style={{ display: 'block', marginTop: '8px' }}>
            Meal Planner
          </ZineText>
          <ZineText size="md" style={{ color: '#8B857C' }}>
            pianifica i tuoi pasti
          </ZineText>
        </div>

        {/* Week indicator */}
        <HandDrawnFrame style={{ padding: '16px', marginBottom: '32px', textAlign: 'center' }}>
          <ZineText size="lg">
            {weekDates[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} - {' '}
            {weekDates[6].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
          </ZineText>
        </HandDrawnFrame>

        {/* Days */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {daysOfWeek.map((day, dayIndex) => {
            const date = weekDates[dayIndex];
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div key={day}>
                {/* Day header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <DoubleFrame style={{
                    padding: '8px 16px',
                    background: isToday ? '#2D2A26' : '#FAF7F2'
                  }}>
                    <ZineText size="lg" style={{ color: isToday ? '#FAF7F2' : '#2D2A26' }}>
                      {day} {date.getDate()}
                    </ZineText>
                  </DoubleFrame>
                  {isToday && (
                    <ZineText size="sm" style={{ color: '#8B857C' }}>← oggi</ZineText>
                  )}
                </div>

                {/* Meals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px' }}>
                  {mealTypes.map((mealType) => {
                    const meal = mealPlan[day]?.[mealType.id as keyof typeof mealPlan[typeof day]];

                    return (
                      <div key={mealType.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px', width: '28px' }}>{mealType.emoji}</span>
                        {meal ? (
                          <ZineText size="md">{meal}</ZineText>
                        ) : (
                          <ZineText size="md" style={{ color: '#A8A4A0', fontStyle: 'italic' }}>
                            + aggiungi
                          </ZineText>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI suggestion */}
        <div style={{
          marginTop: '40px',
          padding: '24px',
          borderTop: '1.5px solid #2D2A26',
          textAlign: 'center'
        }}>
          <SketchChef size={40} />
          <ZineText size="lg" style={{ display: 'block', marginTop: '12px' }}>
            vuoi che ti suggerisca i pasti?
          </ZineText>
          <ZineText size="md" style={{ color: '#8B857C', display: 'block', marginTop: '4px', marginBottom: '16px' }}>
            l'AI può creare un piano personalizzato
          </ZineText>
          <Link to="/chat" style={{ textDecoration: 'none' }}>
            <ZineButton variant="primary">
              chiedi allo chef <HandArrow direction="right" size={18} />
            </ZineButton>
          </Link>
        </div>

      </div>
    </ZinePage>
  );
}
