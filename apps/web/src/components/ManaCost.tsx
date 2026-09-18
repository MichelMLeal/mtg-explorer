import { useSymbology } from '../hooks/useCards';

interface ManaCostProps {
  cost: string;
}

export default function ManaCost({ cost }: ManaCostProps) {
  const { data } = useSymbology();

  if (!cost) return null;

  const tokens = cost.match(/\{[^}]+\}/g) || [cost];
  const symbols: any[] = data?.data || [];

  return (
    <span className="mana-cost">
      {tokens.map((token, i) => {
        const match = symbols.find((s) => s.symbol === token);
        return match ? (
          <img key={i} src={match.svgUri} alt={token} title={match.english} className="mana-symbol" />
        ) : (
          <span key={i}>{token}</span>
        );
      })}
    </span>
  );
}
