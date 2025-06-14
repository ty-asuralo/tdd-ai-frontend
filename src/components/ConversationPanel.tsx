import { Editor } from '@monaco-editor/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useRef, useEffect } from 'react';
import { type Message, Language } from '../lib/api';

interface ConversationPanelProps {
  messages: Message[];
  language: Language;
  generatedCode: string;
  onGeneratedCodeChange?: (code: string) => void;
}

export function ConversationPanel({
  messages,
  language,
  generatedCode,
  onGeneratedCodeChange,
}: ConversationPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('ConversationPanel received new generated code:', {
      generatedCode,
      language,
    });
  }, [generatedCode, language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="bg-card h-full rounded-lg border">
      <Tabs defaultValue="conversation" className="flex h-full flex-col">
        <div className="flex-none border-b px-4">
          <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="generated-code">Generated Code</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="conversation" className="relative flex-1">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="space-y-4 p-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="generated-code" className="flex-1">
          <Editor
            height="100%"
            defaultLanguage={language}
            language={language}
            theme="vs-dark"
            value={generatedCode}
            onChange={(value) => onGeneratedCodeChange?.(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              readOnly: false,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
