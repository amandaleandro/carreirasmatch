export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="tools-workspace" data-tools-workspace>
      <div className="tools-workspace-content">{children}</div>
    </div>
  );
}
