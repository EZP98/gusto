import { ZineText, UnderlinedText, SketchStar } from './ZineUI';

interface FormattedMessageProps {
  content: string;
  style?: React.CSSProperties;
}

// Parse and render markdown-like content with ZineUI components
export const FormattedMessage = ({ content, style = {} }: FormattedMessageProps) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'bullet' | 'numbered'; items: string[] } | null = null;
  let key = 0;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'bullet') {
        elements.push(
          <ul key={key++} style={{ margin: '12px 0', paddingLeft: '20px', listStyle: 'none' }}>
            {currentList.items.map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                <span style={{ marginTop: '6px' }}><SketchStar size={10} /></span>
                <ZineText size="md" style={{ lineHeight: 1.5 }}>
                  {formatInlineText(item)}
                </ZineText>
              </li>
            ))}
          </ul>
        );
      } else {
        elements.push(
          <ol key={key++} style={{ margin: '12px 0', paddingLeft: '24px', listStyle: 'none', counterReset: 'step' }}>
            {currentList.items.map((item, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: '18px',
                  color: '#2D2A26',
                  fontWeight: 'bold',
                  minWidth: '20px'
                }}>
                  {i + 1}.
                </span>
                <ZineText size="md" style={{ lineHeight: 1.5, flex: 1 }}>
                  {formatInlineText(item)}
                </ZineText>
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) {
      flushList();
      elements.push(<div key={key++} style={{ height: '12px' }} />);
      continue;
    }

    // Bold header: **Text**
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && !trimmed.slice(2, -2).includes('**')) {
      flushList();
      const headerText = trimmed.slice(2, -2);
      elements.push(
        <div key={key++} style={{ marginTop: '16px', marginBottom: '8px' }}>
          <UnderlinedText>
            <ZineText size="lg" style={{ fontWeight: 'bold' }}>
              {headerText}
            </ZineText>
          </UnderlinedText>
        </div>
      );
      continue;
    }

    // Bullet list: - item or • item
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      const item = trimmed.slice(2);
      if (currentList?.type === 'bullet') {
        currentList.items.push(item);
      } else {
        flushList();
        currentList = { type: 'bullet', items: [item] };
      }
      continue;
    }

    // Numbered list: 1. item, 2. item, etc.
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const item = numberedMatch[2];
      if (currentList?.type === 'numbered') {
        currentList.items.push(item);
      } else {
        flushList();
        currentList = { type: 'numbered', items: [item] };
      }
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} style={{ margin: '8px 0', lineHeight: 1.6 }}>
        <ZineText size="md">
          {formatInlineText(trimmed)}
        </ZineText>
      </p>
    );
  }

  flushList();

  return <div style={style}>{elements}</div>;
};

// Format inline text: **bold**, etc.
function formatInlineText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Find **bold** pattern
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);

    if (boldMatch && boldMatch.index !== undefined) {
      // Add text before bold
      if (boldMatch.index > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, boldMatch.index)}</span>);
      }
      // Add bold text
      parts.push(
        <strong key={key++} style={{ fontWeight: 'bold' }}>
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else {
      // No more patterns, add remaining text
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export default FormattedMessage;
