# MetaGPT UI

A modern, interactive UI for MetaGPT with Gemini and xAI integration.

## Features

- Dark mode UI with neon blue and red gradients
- Real-time visualization of agent activities
- Support for multiple LLM providers (OpenAI, Gemini, xAI)
- Interactive agent cards showing thinking processes
- Visualization of handovers between teammates

## Getting Started

### Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- MetaGPT installed

### Installation

1. Install UI dependencies:

```bash
npm install
```

2. Install server dependencies:

```bash
cd server
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:

```bash
npm run server
```

2. In a separate terminal, start the frontend development server:

```bash
npm run dev
```

3. Open your browser and navigate to http://localhost:12000

## API Keys

To use different LLM providers, you'll need to configure API keys:

- OpenAI: Set `OPENAI_API_KEY` environment variable
- xAI (Grok): Set `XAI_API_KEY` environment variable
- Gemini: Set `GEMINI_API_KEY` environment variable

You can also configure these through the UI in the API Keys section.

## Architecture

- Frontend: React, TypeScript, TailwindCSS, Framer Motion
- Backend: FastAPI, Socket.IO, MetaGPT
- Communication: WebSockets for real-time updates

## License

Same as MetaGPT