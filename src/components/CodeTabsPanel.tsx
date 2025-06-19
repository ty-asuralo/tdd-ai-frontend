import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Editor } from '@monaco-editor/react';
import { Button } from './ui/button';

interface CodeTabsPanelProps {
  generatedCode: string;
  onGeneratedCodeChange: (value: string | undefined) => void;
  testCode: string;
  onTestCodeChange: (value: string | undefined) => void;
  language: string;
  onRunTests: () => void;
  onClear: () => void;
}

export function CodeTabsPanel({
  generatedCode,
  onGeneratedCodeChange,
  testCode,
  onTestCodeChange,
  language,
  onRunTests,
  onClear,
}: CodeTabsPanelProps) {
  return (
    <Tabs defaultValue="generated" className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="generated">Generated Code</TabsTrigger>
          <TabsTrigger value="test">Code Test Editor</TabsTrigger>
        </TabsList>
        <div className="ml-4 flex gap-2">
          <Button variant="outline" onClick={onClear}>
            Clear
          </Button>
          <Button onClick={onRunTests}>Run Tests</Button>
        </div>
      </div>
      <TabsContent value="generated" className="flex-1">
        <Editor
          value={generatedCode}
          onChange={onGeneratedCodeChange}
          language={language}
          height="100%"
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
      </TabsContent>
      <TabsContent value="test" className="flex-1">
        <Editor
          value={testCode}
          onChange={onTestCodeChange}
          language={language}
          height="100%"
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
      </TabsContent>
    </Tabs>
  );
}
