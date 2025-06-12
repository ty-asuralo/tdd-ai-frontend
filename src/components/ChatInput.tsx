import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { sendChatRequest, type Message } from '../lib/api';

interface ChatInputProps {
  onUserMessage: (message: Message) => void;
  onAIResponse: (content: string) => void;
  onCodeBlock: (code: string, language: string) => void;
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
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface CodeStartChunk {
  type: 'code_start';
  language: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface CodeEndChunk {
  type: 'code_end';
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

type Chunk = StartChunk | TokenChunk | CodeStartChunk | CodeEndChunk | ErrorChunk | DoneChunk;

export function ChatInput({ onUserMessage, onAIResponse, onCodeBlock }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const currentCodeBlockRef = useRef('');

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleStartChunk = (chunk: StartChunk) => {
    console.log('Stream started with usage:', chunk.usage);
  };

  const handleTokenChunk = (chunk: TokenChunk, accumulatedResponse: string): string => {
    const newResponse = accumulatedResponse + chunk.token;
    onAIResponse(newResponse);
    return newResponse;
  };

  const handleCodeStartChunk = (chunk: CodeStartChunk) => {
    console.log('Code block started:', chunk.language);
    currentCodeBlockRef.current = ''; // Reset current code block
    return chunk.language;
  };

  const handleCodeEndChunk = (currentLanguage: string) => {
    console.log('Code block ended with content:', currentCodeBlockRef.current);
    // Send the complete code block to the parent
    if (currentCodeBlockRef.current) {
      console.log('Sending code block to parent:', {
        code: currentCodeBlockRef.current,
        language: currentLanguage,
      });
      onCodeBlock(currentCodeBlockRef.current, currentLanguage);
    }
    currentCodeBlockRef.current = ''; // Reset current code block
    return '';
  };

  const handleDoneChunk = (chunk: DoneChunk) => {
    if (chunk.finish_reason !== 'stop') {
      console.warn('Stream ended with reason:', chunk.finish_reason);
    }
    console.log('Stream completed with usage:', chunk.usage);
  };

  const handleErrorChunk = (chunk: ErrorChunk): boolean => {
    console.error('Stream error:', chunk.error, 'Code:', chunk.code);
    onAIResponse(`Error: ${chunk.error}`);
    return true; // Signal to stop processing
  };

  const processChunk = async (
    data: Chunk,
    accumulatedResponse: string,
    isInCodeBlock: boolean,
    currentLanguage: string
  ): Promise<[string, boolean, string, boolean]> => {
    let shouldStop = false;

    switch (data.type) {
      case 'start':
        handleStartChunk(data);
        break;
      case 'token':
        if (isInCodeBlock) {
          console.log('Adding token to code block:', data.token);
          // Add newline if the token is a complete line
          if (data.token.includes('\n')) {
            currentCodeBlockRef.current += data.token;
          } else {
            currentCodeBlockRef.current += data.token + '\n';
          }
        }
        accumulatedResponse = handleTokenChunk(data, accumulatedResponse);
        break;
      case 'code_start':
        currentLanguage = handleCodeStartChunk(data);
        isInCodeBlock = true;
        break;
      case 'code_end':
        currentLanguage = handleCodeEndChunk(currentLanguage);
        isInCodeBlock = false;
        break;
      case 'done':
        handleDoneChunk(data);
        break;
      case 'error':
        shouldStop = handleErrorChunk(data);
        break;
    }

    return [accumulatedResponse, isInCodeBlock, currentLanguage, shouldStop];
  };

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
      let isInCodeBlock = false;
      let currentLanguage = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line) as Chunk;
            const [newResponse, newIsInCodeBlock, newLanguage, shouldStop] = await processChunk(
              data,
              accumulatedResponse,
              isInCodeBlock,
              currentLanguage
            );

            accumulatedResponse = newResponse;
            isInCodeBlock = newIsInCodeBlock;
            currentLanguage = newLanguage;

            if (shouldStop) {
              return;
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
