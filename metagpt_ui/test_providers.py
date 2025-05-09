#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test script for LLM providers
"""

import os
import sys
import asyncio
from typing import Dict, List

# Add the parent directory to sys.path to import MetaGPT modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from metagpt.configs.llm_config import LLMConfig, LLMType
from metagpt.provider.openai_api import OpenAILLM
from metagpt.provider.xai_api import XAILLM
from metagpt.provider.gemini_api import GeminiLLM

async def test_provider(provider_name: str, llm, messages: List[Dict]):
    """Test a provider with a simple message"""
    print(f"\n--- Testing {provider_name} ---")
    
    try:
        print("Sending request...")
        response = await llm.acompletion(messages)
        
        print(f"Response from {provider_name}:")
        print(f"Content: {response['choices'][0]['message']['content']}")
        print(f"Usage: {response.get('usage', 'N/A')}")
        
        return True
    except Exception as e:
        print(f"Error with {provider_name}: {str(e)}")
        return False

async def main():
    """Main function to test all providers"""
    # Test messages
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello! Can you tell me what LLM provider you are?"}
    ]
    
    # Test OpenAI
    if os.environ.get("OPENAI_API_KEY"):
        config = LLMConfig(llm_type=LLMType.OPENAI, api_key=os.environ.get("OPENAI_API_KEY"))
        llm = OpenAILLM(config)
        await test_provider("OpenAI", llm, messages)
    else:
        print("\n--- Skipping OpenAI (no API key) ---")
    
    # Test xAI
    if os.environ.get("XAI_API_KEY"):
        config = LLMConfig(llm_type=LLMType.XAI, api_key=os.environ.get("XAI_API_KEY"))
        llm = XAILLM(config)
        await test_provider("xAI (Grok)", llm, messages)
    else:
        print("\n--- Skipping xAI (no API key) ---")
    
    # Test Gemini
    if os.environ.get("GEMINI_API_KEY"):
        config = LLMConfig(llm_type=LLMType.GEMINI, api_key=os.environ.get("GEMINI_API_KEY"))
        llm = GeminiLLM(config)
        await test_provider("Gemini", llm, messages)
    else:
        print("\n--- Skipping Gemini (no API key) ---")

if __name__ == "__main__":
    asyncio.run(main())