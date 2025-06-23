import { useState } from 'react';
import { ChatInput } from './components/ChatInput';
import { ConversationPanel } from './components/ConversationPanel';
import { CodeTabsPanel } from './components/CodeTabsPanel';
import { Sidebar } from './components/Sidebar';
import { OutputPanel } from './components/OutputPanel';
import { type Message, executeCode, Language } from './lib/api';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [test_code, setTestCode] = useState('');
  const [implementation_code, setImplementationCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState(Language.PYTHON);
  const [activeTab, setActiveTab] = useState('test');

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

  const handleSendToEditor = (code: string, language: string) => {
    setImplementationCode((prevCode) => {
      const separator = prevCode.trim() ? '\n\n' : '';
      return prevCode + separator + code;
    });
    setActiveTab('generated'); // Switch to generated code tab
    console.log('Appended code to editor:', { code, language });
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

  // Wrappers to handle undefined
  const handleGeneratedCodeChange = (value: string | undefined) =>
    setImplementationCode(value || '');
  const handleTestCodeChange = (value: string | undefined) => setTestCode(value || '');

  return (
    <div className="bg-background min-h-screen">
      <div className="flex h-screen min-h-0">
        <Sidebar language={language} onLanguageChange={handleLanguageChange} />
        <div className="min-h-0 flex-1 p-4 pl-16">
          <div className="h-full min-h-0">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">TDD AI</h1>
            </div>
            <div className="grid h-[calc(100vh-120px)] min-h-0 grid-cols-1 gap-6 md:grid-cols-2">
              {/* Left column: Code editors tabs, fill height */}
              <div className="flex h-full min-h-0 flex-col">
                <div className="min-h-0 flex-1">
                  <CodeTabsPanel
                    generatedCode={implementation_code}
                    onGeneratedCodeChange={handleGeneratedCodeChange}
                    testCode={test_code}
                    onTestCodeChange={handleTestCodeChange}
                    language={language}
                    onRunTests={handleRunTests}
                    onClear={handleClearCode}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>
              </div>
              {/* Right column: OutputPanel (top), ConversationPanel+ChatInput (bottom) */}
              <div className="flex h-full min-h-0 flex-col">
                <div className="mt-0 max-h-[60vh] min-h-[180px] overflow-auto">
                  <OutputPanel output={output} />
                </div>
                <div className="mt-4 flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 overflow-auto">
                    <ConversationPanel messages={messages} onSendToEditor={handleSendToEditor} />
                  </div>
                  <div className="bg-background sticky bottom-0 z-10">
                    <ChatInput
                      onUserMessage={handleUserMessage}
                      onAIResponse={handleAIResponse}
                      onCodeBlock={handleCodeBlock}
                    />
                  </div>
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
