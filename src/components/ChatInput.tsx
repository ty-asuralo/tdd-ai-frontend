import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { sendChatRequest, type Message } from '../lib/api';

interface ChatInputProps {
  onUserMessage: (message: Message) => void;
  onAIResponse: (content: string) => void;
}

interface StartChunk {
  type: 'start';
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface TokenChunk {
  type: 'token';
  token: string;
  role: 'assistant';
  index: number;
  language?: string;
  is_code: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface ErrorChunk {
  type: 'error';
  error: string;
  code: string;
}

interface DoneChunk {
  type: 'done';
  finish_reason: 'stop' | 'length' | 'function_call' | 'user_abort';
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export function ChatInput({ onUserMessage, onAIResponse }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Add user message to the conversation
    const userMessageObj: Message = { role: 'user', content: userMessage };
    onUserMessage(userMessageObj);

    try {
      const stream = await sendChatRequest({
        messages: [userMessageObj],
      });

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        // Split by newlines in case multiple JSON objects are received
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.type === 'start') {
              const startChunk = data as StartChunk;
              // Could use startChunk.usage for initial token count if needed
              console.log('Stream started with usage:', startChunk.usage);
            } else if (data.type === 'token') {
              const tokenChunk = data as TokenChunk;
              accumulatedResponse += tokenChunk.token;
              onAIResponse(accumulatedResponse);
            } else if (data.type === 'done') {
              const doneChunk = data as DoneChunk;
              if (doneChunk.finish_reason !== 'stop') {
                console.warn('Stream ended with reason:', doneChunk.finish_reason);
              }
              console.log('Stream completed with usage:', doneChunk.usage);
            } else if (data.type === 'error') {
              const errorChunk = data as ErrorChunk;
              console.error('Stream error:', errorChunk.error, 'Code:', errorChunk.code);
              onAIResponse(`Error: ${errorChunk.error}`);
              break; // Stop processing on error
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      onAIResponse('Sorry, there was an error processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2 border-b p-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring max-h-[120px] min-h-[40px] w-full resize-none rounded-md border py-1.5 pr-12 pl-3 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        />
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !message.trim()}
          size="icon"
          className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2"
        >
          {isLoading ? '⌛' : '📤'}
        </Button>
      </div>
    </div>
  );
}
