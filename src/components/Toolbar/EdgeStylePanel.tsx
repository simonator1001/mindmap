import { EdgeStyle, LineStyle } from '../../types';

interface EdgeStylePanelProps {
  currentStyle: EdgeStyle;
  currentLineStyle: LineStyle;
  onStyleChange: (style: EdgeStyle) => void;
  onLineStyleChange: (style: LineStyle) => void;
  isOpen: boolean;
}

const styles: { id: EdgeStyle; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'straight', label: 'Straight' },
  { id: 'step', label: 'Step' },
  { id: 'smoothstep', label: 'Smooth Step' },
  { id: 'bezier', label: 'Bezier' },
];

const lineStyles: { id: LineStyle; label: string }[] = [
  { id: 'solid', label: 'Solid' },
  { id: 'animated', label: 'Animated' },
];

export default function EdgeStylePanel({ 
  currentStyle, 
  currentLineStyle,
  onStyleChange, 
  onLineStyleChange,
  isOpen 
}: EdgeStylePanelProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg p-4 w-48">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Line Type</h3>
        <div className="space-y-2">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => onStyleChange(style.id)}
              className={`w-full px-3 py-2 text-sm text-left rounded-md ${
                currentStyle === style.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Line Style</h3>
        <div className="space-y-2">
          {lineStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => onLineStyleChange(style.id)}
              className={`w-full px-3 py-2 text-sm text-left rounded-md ${
                currentLineStyle === style.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}