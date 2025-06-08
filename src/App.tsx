import { useState } from 'react';
import { ChatInput } from './components/ChatInput';
import { ConversationPanel } from './components/ConversationPanel';
import { CodeEditor } from './components/CodeEditor';
import { OutputPanel } from './components/OutputPanel';
import { Sidebar } from './components/Sidebar';

type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
};

type Language = 'typescript' | 'javascript' | 'python' | 'java' | 'csharp';

type Version = 'v1' | 'v2' | 'v3';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [code, setCode] = useState('// Write your code here\n');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState<Language>('typescript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [version, setVersion] = useState<Version>('v1');

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
    };
    setMessages((prev) => [...prev, newMessage]);

    // TODO: Add AI response logic here
    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      content: 'This is a placeholder response from the AI.',
      role: 'assistant',
    };
    setMessages((prev) => [...prev, aiResponse]);
  };

  const handleRunTests = () => {
    // TODO: Implement test running logic
    setOutput('Running tests...\n\n' + new Date().toLocaleTimeString());
  };

  const handleClearCode = () => {
    setCode('// Write your code here\n');
    setOutput('');
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // Reset code with language-specific comment
    const comments = {
      typescript: '// Write your TypeScript code here\n',
      javascript: '// Write your JavaScript code here\n',
      python: '# Write your Python code here\n',
      java: '// Write your Java code here\n',
      csharp: '// Write your C# code here\n',
    };
    setCode(comments[newLanguage]);
  };

  const handleVersionChange = (newVersion: Version) => {
    setVersion(newVersion);
    // TODO: Load the corresponding version of the generated code
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="flex h-screen">
        <Sidebar language={language} onLanguageChange={handleLanguageChange} />
        <div className="flex-1 p-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">TDD AI</h1>
            </div>
            <div className="grid h-[calc(100vh-120px)] grid-cols-2 gap-4">
              <div className="flex h-full flex-col">
                <div className="mb-4">
                  <ChatInput onSendMessage={handleSendMessage} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <ConversationPanel
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    version={version}
                    onVersionChange={handleVersionChange}
                    language={language}
                  />
                </div>
              </div>
              <div className="flex h-full flex-col">
                <div className="h-2/3">
                  <CodeEditor
                    code={code}
                    onChange={(value) => setCode(value || '')}
                    onRunTests={handleRunTests}
                    onClear={handleClearCode}
                    language={language}
                  />
                </div>
                <div className="mt-4 h-1/3">
                  <OutputPanel output={output} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
