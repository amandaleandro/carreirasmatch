export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tools-workspace">
      <div className="tools-workspace-glow tools-workspace-glow-primary" aria-hidden="true" />
      <div className="tools-workspace-glow tools-workspace-glow-accent" aria-hidden="true" />
      <div className="tools-workspace-content">{children}</div>
    </div>
  );
}
