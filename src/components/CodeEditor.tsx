import { Editor } from '@monaco-editor/react';
import { Button } from './ui/button';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  onRunTests: () => void;
  onClear: () => void;
  language: string;
}

export function CodeEditor({ code, onChange, onRunTests, onClear, language }: CodeEditorProps) {
  return (
    <div className="bg-card h-full rounded-lg border">
      <div className="flex items-center justify-between border-b p-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onClear}>
            Clear
          </Button>
          <Button onClick={onRunTests}>Run Tests</Button>
        </div>
      </div>
      <div className="h-[calc(100%-48px)]">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
