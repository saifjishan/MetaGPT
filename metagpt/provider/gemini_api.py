#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
@Time    : 2023/5/5 23:08
@Author  : OpenHands
@Modified: 2023/5/5
@Description: Gemini API provider for MetaGPT
"""

import os
import json
import time
import asyncio
from typing import Dict, List, Optional, Union, Any, Tuple, Callable

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

from metagpt.provider.base_llm import BaseLLM
from metagpt.configs.llm_config import LLMConfig, LLMType
from metagpt.logs import logger
from metagpt.utils.token_counter import count_message_tokens, count_string_tokens

class GeminiLLM(BaseLLM):
    """
    Gemini API provider for MetaGPT
    """
    def __init__(self, config: LLMConfig = None):
        """Initialize with the given config"""
        self.config = config or LLMConfig(llm_type=LLMType.GEMINI)
        self._init_gemini()
        self.model = None
        self.system_prompt = None
        self._set_model()

    def _init_gemini(self):
        """Initialize the Gemini API client"""
        api_key = os.environ.get("GEMINI_API_KEY", self.config.api_key)
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set in environment variables or config")
        
        genai.configure(api_key=api_key)
        
        # Set default parameters
        self.temperature = self.config.temperature
        self.top_p = self.config.top_p
        self.max_tokens = self.config.max_tokens
        
        # Get available models
        try:
            self.available_models = [model.name for model in genai.list_models()]
            logger.info(f"Available Gemini models: {self.available_models}")
        except Exception as e:
            logger.error(f"Failed to get available Gemini models: {e}")
            self.available_models = ["gemini-pro", "gemini-pro-vision"]

    def _set_model(self):
        """Set the model to use"""
        model_name = self.config.model or "gemini-pro"
        
        # Check if model is available
        if model_name not in self.available_models:
            logger.warning(f"Model {model_name} not available. Using gemini-pro instead.")
            model_name = "gemini-pro"
        
        self.model = genai.GenerativeModel(
            model_name=model_name,
            generation_config=GenerationConfig(
                temperature=self.temperature,
                top_p=self.top_p,
                max_output_tokens=self.max_tokens,
            )
        )
        
        logger.info(f"Using Gemini model: {model_name}")

    def _convert_to_gemini_messages(self, messages: List[Dict]) -> List[Dict]:
        """Convert messages to Gemini format"""
        gemini_messages = []
        
        # Extract system prompt if present
        for i, message in enumerate(messages):
            if message["role"] == "system":
                self.system_prompt = message["content"]
                # Don't add system message to gemini_messages as it's handled separately
            else:
                # Map OpenAI roles to Gemini roles
                role = "user" if message["role"] == "user" else "model"
                gemini_messages.append({"role": role, "parts": [message["content"]]})
        
        return gemini_messages

    async def acompletion(self, messages: List[Dict], timeout=3, **kwargs) -> Dict:
        """Async completion with Gemini API"""
        try:
            # Convert messages to Gemini format
            gemini_messages = self._convert_to_gemini_messages(messages)
            
            # Apply system prompt if present
            if self.system_prompt:
                # Gemini doesn't have a system message type, so we prepend it to the first user message
                if gemini_messages and gemini_messages[0]["role"] == "user":
                    gemini_messages[0]["parts"][0] = f"{self.system_prompt}\n\n{gemini_messages[0]['parts'][0]}"
            
            # Create a chat session
            chat = self.model.start_chat(history=gemini_messages[:-1] if gemini_messages else [])
            
            # Get the last message (if any) to send
            last_message = gemini_messages[-1]["parts"][0] if gemini_messages else ""
            
            # Generate response
            response = await asyncio.to_thread(
                chat.send, 
                last_message,
                generation_config=GenerationConfig(
                    temperature=kwargs.get("temperature", self.temperature),
                    top_p=kwargs.get("top_p", self.top_p),
                    max_output_tokens=kwargs.get("max_tokens", self.max_tokens),
                )
            )
            
            # Format response to match OpenAI's format
            completion = {
                "id": f"gemini-{int(time.time())}",
                "object": "chat.completion",
                "created": int(time.time()),
                "model": self.model.model_name,
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": response.text,
                        },
                        "finish_reason": "stop",
                    }
                ],
                "usage": {
                    "prompt_tokens": count_message_tokens(messages),
                    "completion_tokens": count_string_tokens(response.text),
                    "total_tokens": count_message_tokens(messages) + count_string_tokens(response.text),
                },
            }
            
            return completion
            
        except Exception as e:
            logger.error(f"Error in Gemini API call: {e}")
            # Return a formatted error response
            return {
                "id": f"gemini-error-{int(time.time())}",
                "object": "chat.completion",
                "created": int(time.time()),
                "model": self.model.model_name if self.model else "gemini-pro",
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": f"Error: {str(e)}",
                        },
                        "finish_reason": "error",
                    }
                ],
                "usage": {
                    "prompt_tokens": 0,
                    "completion_tokens": 0,
                    "total_tokens": 0,
                },
            }

    async def acompletion_text(self, messages: List[Dict], timeout=3, **kwargs) -> str:
        """Get the completion text from the API response"""
        response = await self.acompletion(messages, timeout, **kwargs)
        return response["choices"][0]["message"]["content"]

    def completion(self, messages: List[Dict], **kwargs) -> Dict:
        """Synchronous completion with Gemini API"""
        return asyncio.run(self.acompletion(messages, **kwargs))

    def completion_text(self, messages: List[Dict], **kwargs) -> str:
        """Get the completion text from the API response synchronously"""
        return asyncio.run(self.acompletion_text(messages, **kwargs))