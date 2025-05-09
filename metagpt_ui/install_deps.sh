#!/bin/bash

echo "Installing dependencies for MetaGPT UI..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r server/requirements.txt

# Install xAI SDK
echo "Installing xAI SDK..."
pip install xai-sdk

# Install Google Generative AI
echo "Installing Google Generative AI..."
pip install google-generativeai

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install

echo "All dependencies installed successfully!"
echo "You can now run the application with ./start.sh"