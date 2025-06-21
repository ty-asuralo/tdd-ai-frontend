import { useRef, useEffect, useState } from 'react';
import { type Message } from '../lib/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Code } from 'lucide-react';

interface ConversationPanelProps {
  messages: Message[];
  onSendToEditor?: (code: string, language: string) => void;
}

export function ConversationPanel({ messages, onSendToEditor }: ConversationPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const sendToEditor = (code: string, language: string) => {
    if (onSendToEditor) {
      onSendToEditor(code, language);
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-card h-[750px] overflow-y-auto rounded-lg border"
    >
      <div className="space-y-4 p-4 pb-8 text-sm">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-start'}`}
          >
            <div
              className={`rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white max-w-[80%] shadow-sm' 
                  : 'w-full'
              }`}
            >
              {message.role === 'user' ? (
                message.content
              ) : (
                <div className="markdown text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const codeString = String(children).replace(/\n$/, '');
                        const isCopied = copiedCode === codeString;
                        
                        return !inline && match ? (
                          <div className="relative group">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                              <button
                                onClick={() => copyToClipboard(codeString)}
                                className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded text-white"
                                title="Copy code"
                              >
                                {isCopied ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              {onSendToEditor && (
                                <button
                                  onClick={() => sendToEditor(codeString, match[1])}
                                  className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white"
                                  title="Send to code editor"
                                >
                                  <Code className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{ fontSize: '14px' }}
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
