import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Editor } from '@monaco-editor/react';
import { Button } from './ui/button';
import { useState } from 'react';

interface CodeTabsPanelProps {
  generatedCode: string;
  onGeneratedCodeChange: (value: string | undefined) => void;
  testCode: string;
  onTestCodeChange: (value: string | undefined) => void;
  language: string;
  onRunTests: () => void;
  onClear: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

// Function to extract base language for Monaco Editor
const getBaseLanguage = (language: string): string => {
  // Extract base language from versioned language strings
  const languageMap: Record<string, string> = {
    'python-3.12': 'python',
    'python-3.11': 'python',
    'python-3.10': 'python',
    'typescript': 'typescript',
    'javascript': 'javascript',
    'java': 'java',
    'csharp': 'csharp',
  };
  
  return languageMap[language] || language.split('-')[0];
};

export function CodeTabsPanel({
  generatedCode,
  onGeneratedCodeChange,
  testCode,
  onTestCodeChange,
  language,
  onRunTests,
  onClear,
  activeTab: externalActiveTab,
  onTabChange,
}: CodeTabsPanelProps) {
  const baseLanguage = getBaseLanguage(language);
  const [internalActiveTab, setInternalActiveTab] = useState('test');
  const [showClearModal, setShowClearModal] = useState(false);

  // Use external activeTab if provided, otherwise use internal state
  const activeTab = externalActiveTab || internalActiveTab;

  const handleTabChange = (tab: string) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const handleClear = () => {
    if (activeTab === 'generated') {
      onGeneratedCodeChange('');
    } else if (activeTab === 'test') {
      onTestCodeChange('');
    }
    setShowClearModal(false);
  };

  const openClearModal = () => {
    setShowClearModal(true);
  };

  const hasContent = activeTab === 'generated' ? generatedCode.trim() !== '' : testCode.trim() !== '';

  return (
    <>
      <Tabs 
        value={activeTab}
        className="flex h-full flex-col"
        onValueChange={handleTabChange}
      >
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="test">Code Test Editor</TabsTrigger>
            <TabsTrigger value="generated">Generated Code</TabsTrigger>
          </TabsList>
          <div className="ml-4 flex gap-2">
            <Button 
              variant="outline" 
              onClick={openClearModal}
              disabled={!hasContent}
            >
              Clear {activeTab === 'generated' ? 'Generated' : 'Test'}
            </Button>
            <Button onClick={onRunTests}>Run Tests</Button>
          </div>
        </div>
        <TabsContent value="test" className="flex-1">
          <Editor
            value={testCode}
            onChange={onTestCodeChange}
            language={baseLanguage}
            height="100%"
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              folding: true,
              foldingStrategy: 'indentation',
              showFoldingControls: 'always',
              renderWhitespace: 'selection',
              renderControlCharacters: false,
              renderLineHighlight: 'all',
              selectOnLineNumbers: true,
              glyphMargin: true,
              useTabStops: false,
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: true,
            }}
          />
        </TabsContent>
        <TabsContent value="generated" className="flex-1">
          <Editor
            value={generatedCode}
            onChange={onGeneratedCodeChange}
            language={baseLanguage}
            height="100%"
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              folding: true,
              foldingStrategy: 'indentation',
              showFoldingControls: 'always',
              renderWhitespace: 'selection',
              renderControlCharacters: false,
              renderLineHighlight: 'all',
              selectOnLineNumbers: true,
              glyphMargin: true,
              useTabStops: false,
              tabSize: 2,
              insertSpaces: true,
              detectIndentation: true,
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Clear {activeTab === 'generated' ? 'Generated Code' : 'Test Code'}?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to clear the {activeTab === 'generated' ? 'generated code' : 'test code'}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleClear}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
