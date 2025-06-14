import { useState } from 'react';
import { ChatInput } from './components/ChatInput';
import { ConversationPanel } from './components/ConversationPanel';
import { CodeEditor } from './components/CodeEditor';
import { Sidebar } from './components/Sidebar';
import { OutputPanel } from './components/OutputPanel';
import { type Message, executeCode, Language } from './lib/api';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [test_code, setTestCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState<Language>(Language.PYTHON);
  const [implementation_code, setImplementationCode] = useState('');

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
    console.log('App received code block:', { code, language: codeLanguage });
    // Update implementation code
    setImplementationCode(code);
    console.log('Updated implementation code:', code);

    // Update the code editor's language if it matches our supported languages
    const supportedLanguages = {
      typescript: Language.TYPESCRIPT,
      javascript: Language.JAVASCRIPT,
      'python-3.12': Language.PYTHON,
      java: Language.JAVA,
      csharp: Language.CSHARP,
    };

    if (codeLanguage in supportedLanguages) {
      setLanguage(supportedLanguages[codeLanguage as keyof typeof supportedLanguages]);
    }
  };

  const handleRunTests = async () => {
    try {
      setOutput('Running tests...\n');
      const request = {
        language,
        implementation_code,
        test_code,
      };
      console.log('Sending request to /code:', request);
      const result = await executeCode(request);

      if (result.exit_code === 0) {
        // Success case - show stdout
        setOutput(result.stdout || 'Tests passed successfully!');
      } else {
        // Error case - show stderr or error message
        const errorMessage = result.stderr || result.error || 'Tests failed';
        setOutput(`Error: ${errorMessage}`);
      }
    } catch (error) {
      setOutput(`Error running tests: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleClearCode = () => {
    setOutput('');
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    // Reset code with language-specific comment
    const comments = {
      [Language.PYTHON]: '# Write your Python code here\n',
      [Language.TYPESCRIPT]: '// Write your TypeScript code here\n',
      [Language.JAVASCRIPT]: '// Write your JavaScript code here\n',
      [Language.JAVA]: '// Write your Java code here\n',
      [Language.CSHARP]: '// Write your C# code here\n',
    };
    setTestCode(comments[newLanguage]);
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
                    language={language}
                    onSendMessage={(content) => handleUserMessage({ role: 'user', content })}
                    generatedCode={implementation_code}
                    onGeneratedCodeChange={setImplementationCode}
                  />
                </div>
              </div>
              <div className="flex h-full flex-col">
                <div className="h-2/3">
                  <CodeEditor
                    code={test_code}
                    onChange={(value) => setTestCode(value || '')}
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
