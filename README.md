# TDD AI Assistant

A modern web application that combines Test-Driven Development (TDD) with AI assistance. This tool helps developers write better code by providing an interactive environment for writing tests, generating code, and getting AI-powered suggestions.

## Features

- 🤖 AI-powered code generation and suggestions
- 💬 Interactive chat interface for communicating with the AI
- 📝 Real-time code editing with syntax highlighting
- 🔄 Version control for generated code
- 🧪 Test execution and results display
- 🌐 Support for multiple programming languages:
  - TypeScript
  - JavaScript
  - Python
  - Java

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui
- **Code Editor**: Monaco Editor
- **Styling**: Tailwind CSS
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/tdd-ai.git
   cd tdd-ai
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Chat Interface**

   - Type your message in the chat input
   - Send messages to get AI assistance
   - View conversation history in the left panel

2. **Code Editor**

   - Write or edit code in the main editor
   - Select programming language from the sidebar
   - Run tests using the "Run Tests" button
   - Clear code using the "Clear" button

3. **Generated Code**

   - View AI-generated code in the "Generated Code" tab
   - Switch between different versions using the version selector
   - Submit code for review or further generation

4. **Test Results**
   - View test execution results in the output panel
   - Monitor test coverage and performance

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the code editor
- [Vite](https://vitejs.dev/) for the build tool
- [Tailwind CSS](https://tailwindcss.com/) for the styling
