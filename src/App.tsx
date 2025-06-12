import { useState } from 'react';
import { ChatInput } from './components/ChatInput';
import { ConversationPanel } from './components/ConversationPanel';
import { CodeEditor } from './components/CodeEditor';
import { Sidebar } from './components/Sidebar';
import { OutputPanel } from './components/OutputPanel';
import { type Message } from './lib/api';

type Language = 'typescript' | 'javascript' | 'python' | 'java' | 'csharp';
type Version = 'v1' | 'v2' | 'v3';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [code, setCode] = useState('// Write your code here\n');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState<Language>('typescript');
  const [version, setVersion] = useState<Version>('v1');
  const [generatedCode, setGeneratedCode] = useState<{ [key in Version]: string }>({
    v1: '',
    v2: '',
    v3: '',
  });

  const handleUserMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleAIResponse = (content: string) => {
    // If there's already an assistant message, update it
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage?.role === 'assistant') {
        return [...prev.slice(0, -1), { role: 'assistant', content }];
      }
      // Otherwise, add a new assistant message
      return [...prev, { role: 'assistant', content }];
    });
  };

  const handleCodeBlock = (code: string, codeLanguage: string) => {
    console.log('App received code block:', { code, language: codeLanguage, version });
    // Update the current version's generated code
    setGeneratedCode((prev) => {
      const newState = {
        ...prev,
        [version]: code,
      };
      console.log('Updated generated code state:', newState);
      return newState;
    });

    // Update the code editor's language if it matches our supported languages
    if (codeLanguage in ['typescript', 'javascript', 'python', 'java', 'csharp']) {
      setLanguage(codeLanguage as Language);
    }
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
    console.log('Version changed to:', newVersion);
    setVersion(newVersion);
    // Update the code editor with the selected version's code
    const versionCode = generatedCode[newVersion] || '';
    console.log('Loading code for version:', { version: newVersion, code: versionCode });
    setCode(versionCode);
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
                  <ChatInput
                    onUserMessage={handleUserMessage}
                    onAIResponse={handleAIResponse}
                    onCodeBlock={handleCodeBlock}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <ConversationPanel
                    messages={messages}
                    version={version}
                    onVersionChange={handleVersionChange}
                    language={language}
                    onSendMessage={(content) => handleUserMessage({ role: 'user', content })}
                    generatedCode={generatedCode[version]}
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
