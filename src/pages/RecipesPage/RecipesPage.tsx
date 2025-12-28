import { useState } from 'react';
import {
  ZinePage,
  ZineText,
  ZineRecipeCard,
  ZineInput,
  HandDrawnFrame,
  SketchEggs,
  SketchPasta,
  SketchBowl,
  SketchTomato,
  SketchCheese,
  SketchBread,
  SketchChef
} from '../../components/ui/ZineUI';

const mockRecipes = [
  {
    id: 1,
    title: 'Pasta alla Carbonara',
    note: 'il classico romano',
    time: '30 min',
    Illustration: SketchPasta,
    category: 'Primi',
  },
  {
    id: 2,
    title: 'Uova in Purgatorio',
    note: 'comfort food perfetto',
    time: '15 min',
    Illustration: SketchEggs,
    category: 'Secondi',
  },
  {
    id: 3,
    title: 'Buddha Bowl',
    note: 'sano e colorato',
    time: '25 min',
    Illustration: SketchBowl,
    category: 'Piatti Unici',
  },
  {
    id: 4,
    title: 'Bruschetta al Pomodoro',
    note: 'semplicità italiana',
    time: '10 min',
    Illustration: SketchTomato,
    category: 'Antipasti',
  },
  {
    id: 5,
    title: 'Cacio e Pepe',
    note: 'solo 3 ingredienti',
    time: '20 min',
    Illustration: SketchCheese,
    category: 'Primi',
  },
  {
    id: 6,
    title: 'French Toast',
    note: 'colazione della domenica',
    time: '15 min',
    Illustration: SketchBread,
    category: 'Colazione',
  },
];

const categories = ['Tutti', 'Primi', 'Secondi', 'Antipasti', 'Piatti Unici', 'Colazione'];

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tutti');

  const filteredRecipes = mockRecipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Tutti' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <ZinePage>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <ZineText size="xxl" underline style={{ display: 'block', marginBottom: '8px' }}>
            Ricette
          </ZineText>
          <ZineText size="md" style={{ color: '#8B857C' }}>
            esplora e salva le tue preferite
          </ZineText>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <ZineInput
            placeholder="cerca una ricetta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Categories */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginBottom: '32px'
        }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                background: selectedCategory === category ? '#2D2A26' : 'transparent',
                color: selectedCategory === category ? '#FAF7F2' : '#2D2A26',
                border: '1.5px solid #2D2A26',
                borderRadius: '4px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontFamily: "'Caveat', cursive",
                fontSize: '18px'
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Recipes */}
        {filteredRecipes.length > 0 ? (
          <div>
            {filteredRecipes.map((recipe) => (
              <ZineRecipeCard
                key={recipe.id}
                title={recipe.title}
                note={recipe.note}
                time={recipe.time}
                Illustration={recipe.Illustration}
              />
            ))}
          </div>
        ) : (
          <HandDrawnFrame style={{ padding: '40px', textAlign: 'center' }}>
            <SketchChef size={48} />
            <ZineText size="lg" style={{ display: 'block', marginTop: '16px' }}>
              nessuna ricetta trovata
            </ZineText>
            <ZineText size="md" style={{ color: '#8B857C', marginTop: '8px' }}>
              prova a cambiare i filtri
            </ZineText>
          </HandDrawnFrame>
        )}

      </div>
    </ZinePage>
  );
}
