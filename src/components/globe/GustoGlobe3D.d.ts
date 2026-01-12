declare const GustoGlobe3D: React.FC<{
  isOpen?: boolean;
  onClose?: () => void;
  onSelectCountry?: (country: string) => void;
  onAskQuestion?: (question: string, context?: { country?: string; item?: string; type?: string }) => void;
  inline?: boolean;
}>;

export default GustoGlobe3D;
