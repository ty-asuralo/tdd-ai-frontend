interface OutputPanelProps {
  output: string;
}

export function OutputPanel({ output }: OutputPanelProps) {
  return (
    <div className="bg-card h-full w-full rounded-lg border">
      <div className="border-b p-2">
        <h3 className="text-sm font-medium">Test Output</h3>
      </div>
      <div className="h-[calc(100%-40px)] overflow-y-auto p-4">
        <pre className="text-sm">
          <code>{output || 'No output yet'}</code>
        </pre>
      </div>
    </div>
  );
}
