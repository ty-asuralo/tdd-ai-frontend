import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { sendChatRequest, type Message } from '../lib/api';

interface ChatInputProps {
  onUserMessage: (message: Message) => void;
  onAIResponse: (content: string) => void;
  onCodeBlock: (code: string, language: string) => void;
}

interface TokenUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

type ContentChunk = {
  type: "token" | "code_start" | "code_end";
  token?: string;
  index?: number;
  usage?: TokenUsage;
  role?: "assistant";
  language?: string;
};

type StartChunk = {
  type: "start";
  usage?: TokenUsage;
};

type ErrorChunk = {
  type: "error";
  error: string;
  code: string;
};

type DoneChunk = {
  type: "done";
  finish_reason: "stop" | "length" | "function_call" | "user_abort";
  usage?: TokenUsage;
};

type Chunk = ContentChunk | StartChunk | ErrorChunk | DoneChunk;

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

  const handleTokenChunk = (chunk: ContentChunk, accumulatedResponse: string): string => {
    const newResponse = accumulatedResponse + chunk.token;
    onAIResponse(newResponse);
    return newResponse;
  };

  const handleCodeStartChunk = (chunk: ContentChunk, accumulatedResponse: string): string => {
    console.log('Code block started:', chunk.language);
    currentCodeBlockRef.current = ''; // Reset current code block
    const newResponse = accumulatedResponse + chunk.token;
    onAIResponse(newResponse);
    return newResponse;
  };

  const handleCodeEndChunk = (chunk: ContentChunk, currentLanguage: string, accumulatedResponse: string) => {
    console.log('Code block ended with content:', currentCodeBlockRef.current);
    // Send the complete code block to the parent
    if (currentCodeBlockRef.current) {
      console.log('Sending code block to parent:', {
        code: currentCodeBlockRef.current,
      });
      onCodeBlock(currentCodeBlockRef.current, currentLanguage);
    }
    const newResponse = accumulatedResponse + chunk.token;
    onAIResponse(newResponse);
    currentCodeBlockRef.current = ''; // Reset current code block
    return newResponse;
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
          currentCodeBlockRef.current += data.token;
        }
        accumulatedResponse = handleTokenChunk(data, accumulatedResponse);
        break;
      case 'code_start':
        accumulatedResponse = handleCodeStartChunk(data, accumulatedResponse);
        isInCodeBlock = true;
        break;
      case 'code_end':
        accumulatedResponse = handleCodeEndChunk(data, currentLanguage, accumulatedResponse);
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
      const response = await fetch('http://localhost:8000/api/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [userMessageObj] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let accumulatedResponse = '';
      let isInCodeBlock = false;
      let currentLanguage = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n').filter((line) => line.trim());

        for (const line of lines) {
          const match = line.match(/^data: (.+)$/);
          if (!match) continue;

          try {
            const data = JSON.parse(match[1]) as Chunk;
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
            console.error('Error parsing chunk:', e, 'Line:', line);
          }
        }
      }
      console.log(accumulatedResponse)
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
