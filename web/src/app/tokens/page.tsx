// src/app/tokens/page.tsx
import TokenList from "../../components/TokenList";

export default function TokensPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mis Tokens</h2>
      <TokenList />
    </div>
  );
}