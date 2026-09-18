import { MTG_COLORS, COLOR_NAMES, type MtgColor } from '../lib/types';
import { useSymbology } from '../hooks/useCards';

interface ManaFilterProps {
  selected: MtgColor[];
  onChange: (colors: MtgColor[]) => void;
}

// Shown until the real Scryfall symbols load, so the buttons aren't blank.
const COLOR_ICONS: Record<MtgColor, string> = {
  W: '☀️',
  U: '💧',
  B: '💀',
  R: '🔥',
  G: '🌿',
};

export default function ManaFilter({ selected, onChange }: ManaFilterProps) {
  const { data } = useSymbology();
  const symbols: any[] = data?.data || [];

  const toggle = (color: MtgColor) => {
    onChange(
      selected.includes(color) ? selected.filter((c) => c !== color) : [...selected, color],
    );
  };

  return (
    <div className="mana-filter">
      {MTG_COLORS.map((color) => {
        const symbol = symbols.find((s) => s.symbol === `{${color}}`);
        return (
          <button
            key={color}
            className={`mana-button mana-${color.toLowerCase()} ${selected.includes(color) ? 'selected' : ''}`}
            onClick={() => toggle(color)}
            title={COLOR_NAMES[color]}
            type="button"
          >
            {symbol ? (
              <img src={symbol.svgUri} alt={COLOR_NAMES[color]} className="mana-icon-img" />
            ) : (
              <span className="mana-icon">{COLOR_ICONS[color]}</span>
            )}
            <span className="mana-label">{COLOR_NAMES[color]}</span>
          </button>
        );
      })}
    </div>
  );
}
