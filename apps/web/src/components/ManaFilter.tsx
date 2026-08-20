import { MTG_COLORS, COLOR_NAMES, type MtgColor } from '../lib/types';

interface ManaFilterProps {
  selected: MtgColor[];
  onChange: (colors: MtgColor[]) => void;
}

const COLOR_ICONS: Record<MtgColor, string> = {
  W: '☀️',
  U: '💧',
  B: '💀',
  R: '🔥',
  G: '🌿',
};

export default function ManaFilter({ selected, onChange }: ManaFilterProps) {
  const toggle = (color: MtgColor) => {
    onChange(
      selected.includes(color) ? selected.filter((c) => c !== color) : [...selected, color],
    );
  };

  return (
    <div className="mana-filter">
      {MTG_COLORS.map((color) => (
        <button
          key={color}
          className={`mana-button mana-${color.toLowerCase()} ${selected.includes(color) ? 'selected' : ''}`}
          onClick={() => toggle(color)}
          title={COLOR_NAMES[color]}
          type="button"
        >
          <span className="mana-icon">{COLOR_ICONS[color]}</span>
          <span className="mana-label">{COLOR_NAMES[color]}</span>
        </button>
      ))}
    </div>
  );
}
