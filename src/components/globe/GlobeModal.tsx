// GlobeModal - Wrapper for GustoGlobe component
// The actual globe implementation is in GustoGlobe.jsx

import GustoGlobe from './GustoGlobe3D';

interface GlobeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCountry: (country: string, city?: string) => void;
  onAskQuestion?: (question: string, context?: { country?: string; item?: string; type?: string }) => void;
  inline?: boolean;
}

export function GlobeModal({ isOpen, onClose, onSelectCountry, onAskQuestion, inline = false }: GlobeModalProps) {
  return (
    <GustoGlobe
      isOpen={isOpen}
      onClose={onClose}
      onSelectCountry={onSelectCountry}
      onAskQuestion={onAskQuestion}
      inline={inline}
    />
  );
}
