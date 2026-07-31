export default function JogosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="jogos-workspace" data-jogos-workspace>
      {children}
    </div>
  );
}
