# MetaGPT UI Installation Guide

This guide will help you set up the MetaGPT UI with support for OpenAI, Gemini, and xAI.

## Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- MetaGPT installed

## Installation Steps

### 1. Install UI Dependencies

```bash
cd metagpt_ui
npm install
```

### 2. Install Server Dependencies

```bash
cd metagpt_ui/server
pip install -r requirements.txt
```

### 3. Install Additional Python Packages

For xAI support:
```bash
pip install xai-sdk
```

For Gemini support:
```bash
pip install google-generativeai
```

### 4. Configure API Keys

You can set API keys in your environment variables:

```bash
# For OpenAI
export OPENAI_API_KEY="your-openai-api-key"

# For xAI (Grok)
export XAI_API_KEY="your-xai-api-key"

# For Gemini
export GEMINI_API_KEY="your-gemini-api-key"
```

Alternatively, you can configure these through the UI in the API Keys section.

## Running the Application

### Option 1: Using the Start Script

```bash
cd metagpt_ui
chmod +x start.sh
./start.sh
```

### Option 2: Running Frontend and Backend Separately

In one terminal, start the backend server:
```bash
cd metagpt_ui
npm run server
```

In another terminal, start the frontend development server:
```bash
cd metagpt_ui
npm run dev
```

## Accessing the UI

Open your browser and navigate to:
```
http://localhost:12000
```

## Troubleshooting

### Backend Server Issues

If you encounter issues with the backend server:

1. Check if Python dependencies are installed:
```bash
pip install -r server/requirements.txt
```

2. Verify API keys are set correctly
3. Check server logs for errors

### Frontend Issues

If you encounter issues with the frontend:

1. Clear browser cache
2. Verify Node.js dependencies are installed:
```bash
npm install
```

3. Check browser console for errors