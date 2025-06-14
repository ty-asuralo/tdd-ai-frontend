const API_BASE_URL = 'http://localhost:8000/api/v1';

export enum Language {
  PYTHON = 'python-3.12',
  TYPESCRIPT = 'typescript',
  JAVASCRIPT = 'javascript',
  JAVA = 'java',
  CSHARP = 'csharp',
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  language?: Language;
}

export const sendChatRequest = async (
  request: ChatRequest
): Promise<ReadableStream<Uint8Array>> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body');
  }

  return response.body;
};

export interface CodeExecutionRequest {
  language: Language;
  implementation_code: string;
  test_code: string;
}

export interface CodeExecutionResponse {
  stdout: string;
  stderr: string;
  exit_code: number;
  error?: string;
}

export const executeCode = async (
  request: CodeExecutionRequest
): Promise<CodeExecutionResponse> => {
  const response = await fetch(`${API_BASE_URL}/code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
