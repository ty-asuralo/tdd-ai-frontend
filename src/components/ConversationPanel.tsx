import { Editor } from '@monaco-editor/react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useState, useRef, useEffect } from 'react';
import { type Message } from '../lib/api';

type Version = 'v1' | 'v2' | 'v3';
type Language = 'typescript' | 'javascript' | 'python' | 'java' | 'csharp';

interface ConversationPanelProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  version: Version;
  onVersionChange: (version: Version) => void;
  language: Language;
  generatedCode: string;
}

export function ConversationPanel({
  messages,
  onSendMessage,
  version,
  onVersionChange,
  language,
  generatedCode,
}: ConversationPanelProps) {
  const [activeTab, setActiveTab] = useState('conversation');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('ConversationPanel received new generated code:', {
      generatedCode,
      version,
      language,
    });
  }, [generatedCode, version, language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="bg-card h-full rounded-lg border">
      <Tabs
        defaultValue="conversation"
        className="flex h-full flex-col"
        onValueChange={setActiveTab}
      >
        <div className="flex-none border-b px-4">
          <TabsList>
            <TabsTrigger value="conversation">Conversation</TabsTrigger>
            <TabsTrigger value="generated-code">Generated Code</TabsTrigger>
          </TabsList>
        </div>
        {activeTab === 'generated-code' && (
          <div className="flex-none border-b p-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Select value={version} onValueChange={onVersionChange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">Version 1</SelectItem>
                    <SelectItem value="v2">Version 2</SelectItem>
                    <SelectItem value="v3">Version 3</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-sm">{language}</span>
              </div>
              <Button size="sm" className="h-8 px-3" onClick={() => onSendMessage('Submit')}>
                Submit
              </Button>
            </div>
          </div>
        )}
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
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              readOnly: true,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
