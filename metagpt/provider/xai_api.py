#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
@Time    : 2025/05/09
@Author  : OpenHands
@File    : xai_api.py
@Desc    : xAI (Grok) LLM API implementation
"""
import json
import os
import time
from typing import List, Optional, Union, AsyncGenerator, Dict, Any

import xai
from xai.sdk.models import ChatCompletionRequest, ChatMessage, ChatCompletionResponse
from xai.sdk.errors import RateLimitError, APIError, APIConnectionError, AuthenticationError

from metagpt.configs.llm_config import LLMConfig, LLMType
from metagpt.const import USE_CONFIG_TIMEOUT
from metagpt.logs import log_llm_stream, logger
from metagpt.provider.base_llm import BaseLLM
from metagpt.provider.llm_provider_registry import register_provider
from metagpt.provider.retry_decorator import async_retry, sync_retry


@register_provider(LLMType.XAI)
class XAILLM(BaseLLM):
    """
    xAI (Grok) LLM API implementation with enhanced error handling and retry mechanisms.
    
    This class provides an interface to xAI's Grok model through their API.
    It includes features like:
    - Automatic retries with exponential backoff
    - Proper error handling for various API errors
    - Token counting and cost tracking
    - Support for streaming responses
    """

    def __init__(self, config: LLMConfig):
        """
        Initialize the xAI LLM provider.
        
        Args:
            config: LLM configuration including API key, model name, etc.
        """
        self.use_system_prompt = True
        self.__init_xai(config)
        self.config = config
        self.model = config.model or "grok-1"
        self.pricing_plan = self.config.pricing_plan or self.model
        
        # Validate API key
        if not config.api_key:
            api_key = os.environ.get("XAI_API_KEY")
            if not api_key:
                raise ValueError("xAI API key is required. Set it in the config or XAI_API_KEY environment variable.")
            self.config.api_key = api_key
            
        # Initialize client
        self.client = xai.Client(api_key=config.api_key)
        
        # Set up retry parameters
        self.max_retries = config.max_retries or 6
        self.retry_delay = config.retry_delay or 1
        self.retry_max_delay = config.retry_max_delay or 60
        
        logger.info(f"Initialized xAI LLM with model: {self.model}")

    def __init_xai(self, config: LLMConfig):
        """Set up proxy if configured"""
        if config.proxy:
            logger.info(f"Use proxy: {config.proxy}")
            os.environ["http_proxy"] = config.proxy
            os.environ["https_proxy"] = config.proxy

    def _user_msg(self, msg: str, images: Optional[Union[str, list[str]]] = None) -> dict[str, str]:
        """Create a user message"""
        return {"role": "user", "content": msg}

    def _assistant_msg(self, msg: str) -> dict[str, str]:
        """Create an assistant message"""
        return {"role": "assistant", "content": msg}

    def _system_msg(self, msg: str) -> dict[str, str]:
        """Create a system message"""
        return {"role": "system", "content": msg}

    def _const_kwargs(self, messages: list[dict], stream: bool = False) -> dict:
        """
        Construct keyword arguments for the API call.
        
        Args:
            messages: List of message dictionaries
            stream: Whether to stream the response
            
        Returns:
            Dictionary of keyword arguments for the API call
        """
        # Convert messages to ChatMessage objects
        chat_messages = [ChatMessage(role=msg["role"], content=msg["content"]) for msg in messages]
        
        # Construct request
        kwargs = {
            "request": ChatCompletionRequest(
                model=self.model,
                messages=chat_messages,
                temperature=self.config.temperature,
                max_tokens=self.config.max_token,
                top_p=self.config.top_p,
                stream=stream
            )
        }
        return kwargs

    def get_choice_text(self, resp: ChatCompletionResponse) -> str:
        """Extract the text from the response"""
        return resp.choices[0].message.content

    def get_usage(self, resp: ChatCompletionResponse) -> dict:
        """
        Get token usage from the response.
        
        Args:
            resp: API response
            
        Returns:
            Dictionary with token usage information
        """
        if resp.usage:
            return {
                "prompt_tokens": resp.usage.prompt_tokens,
                "completion_tokens": resp.usage.completion_tokens,
                "total_tokens": resp.usage.total_tokens
            }
        return {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

    @async_retry(
        exceptions=[RateLimitError, APIConnectionError, APIError],
        tries=6,
        delay=1,
        max_delay=60,
        backoff=2,
        jitter=0.1,
        logger_name="metagpt.provider.xai_api"
    )
    async def _achat_completion(self, messages: list[dict], timeout=USE_CONFIG_TIMEOUT) -> ChatCompletionResponse:
        """
        Asynchronous chat completion with retry mechanism.
        
        Args:
            messages: List of message dictionaries
            timeout: Request timeout in seconds
            
        Returns:
            API response
            
        Raises:
            AuthenticationError: If API key is invalid
            APIError: For other API errors
        """
        try:
            kwargs = self._const_kwargs(messages)
            response = await self.client.chat.completions.create_async(**kwargs)
            usage = self.get_usage(response)
            self._update_costs(usage)
            return response
        except AuthenticationError as e:
            logger.error(f"xAI API authentication error: {e}")
            raise AuthenticationError(f"Invalid xAI API key: {e}")
        except RateLimitError as e:
            logger.warning(f"xAI API rate limit error: {e}")
            raise  # Will be caught by retry decorator
        except APIConnectionError as e:
            logger.warning(f"xAI API connection error: {e}")
            raise  # Will be caught by retry decorator
        except APIError as e:
            logger.warning(f"xAI API error: {e}")
            raise  # Will be caught by retry decorator
        except Exception as e:
            logger.error(f"Unexpected xAI API error: {e}")
            raise APIError(f"Unexpected error: {e}")

    async def acompletion(self, messages: list[dict], timeout=USE_CONFIG_TIMEOUT) -> dict:
        """
        Asynchronous completion that returns the raw response.
        
        Args:
            messages: List of message dictionaries
            timeout: Request timeout in seconds
            
        Returns:
            Dictionary with API response
        """
        response = await self._achat_completion(messages, timeout=self.get_timeout(timeout))
        
        # Convert to dict format similar to OpenAI for compatibility
        return {
            "id": response.id,
            "object": "chat.completion",
            "created": int(time.time()),
            "model": response.model,
            "choices": [
                {
                    "index": choice.index,
                    "message": {
                        "role": choice.message.role,
                        "content": choice.message.content
                    },
                    "finish_reason": choice.finish_reason
                }
                for choice in response.choices
            ],
            "usage": response.usage.dict() if response.usage else {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
        }

    async def acompletion_text(self, messages: list[dict], **kwargs) -> str:
        """
        Get completion text from the API response.
        
        Args:
            messages: List of message dictionaries
            **kwargs: Additional arguments for the API call
            
        Returns:
            Text response from the model
        """
        response = await self.acompletion(messages, **kwargs)
        return response["choices"][0]["message"]["content"]

    @async_retry(
        exceptions=[RateLimitError, APIConnectionError, APIError],
        tries=6,
        delay=1,
        max_delay=60,
        backoff=2,
        jitter=0.1,
        logger_name="metagpt.provider.xai_api"
    )
    async def _achat_completion_stream(self, messages: list[dict], timeout: int = USE_CONFIG_TIMEOUT) -> str:
        """
        Asynchronous streaming chat completion with retry mechanism.
        
        Args:
            messages: List of message dictionaries
            timeout: Request timeout in seconds
            
        Returns:
            Full text response
            
        Raises:
            AuthenticationError: If API key is invalid
            APIError: For other API errors
        """
        try:
            kwargs = self._const_kwargs(messages, stream=True)
            stream_response = await self.client.chat.completions.create_async(**kwargs)
            
            collected_content = []
            
            async for chunk in stream_response:
                if not chunk.choices:
                    continue
                
                content = chunk.choices[0].delta.content or ""
                log_llm_stream(content)
                collected_content.append(content)
            
            log_llm_stream("\n")
            full_content = "".join(collected_content)
            
            # Estimate token usage since streaming doesn't provide it
            usage = {
                "prompt_tokens": self.count_tokens(messages),
                "completion_tokens": len(full_content) // 4,  # Rough estimate
                "total_tokens": self.count_tokens(messages) + (len(full_content) // 4)
            }
            
            self._update_costs(usage)
            return full_content
            
        except AuthenticationError as e:
            logger.error(f"xAI API authentication error: {e}")
            raise AuthenticationError(f"Invalid xAI API key: {e}")
        except RateLimitError as e:
            logger.warning(f"xAI API rate limit error: {e}")
            raise  # Will be caught by retry decorator
        except APIConnectionError as e:
            logger.warning(f"xAI API connection error: {e}")
            raise  # Will be caught by retry decorator
        except APIError as e:
            logger.warning(f"xAI API error: {e}")
            raise  # Will be caught by retry decorator
        except Exception as e:
            logger.error(f"Unexpected xAI API streaming error: {e}")
            raise APIError(f"Unexpected error: {e}")

    async def astream_completion(self, messages: list[dict], **kwargs) -> str:
        """
        Stream completion from the API.
        
        Args:
            messages: List of message dictionaries
            **kwargs: Additional arguments for the API call
            
        Returns:
            Full text response
        """
        return await self._achat_completion_stream(messages, **kwargs)

    def completion(self, messages: list[dict], **kwargs) -> Dict[str, Any]:
        """
        Synchronous completion.
        
        Args:
            messages: List of message dictionaries
            **kwargs: Additional arguments for the API call
            
        Returns:
            Dictionary with API response
        """
        import asyncio
        return asyncio.run(self.acompletion(messages, **kwargs))

    def completion_text(self, messages: list[dict], **kwargs) -> str:
        """
        Get completion text synchronously.
        
        Args:
            messages: List of message dictionaries
            **kwargs: Additional arguments for the API call
            
        Returns:
            Text response from the model
        """
        response = self.completion(messages, **kwargs)
        return response["choices"][0]["message"]["content"]

    def count_tokens(self, messages: list[dict]) -> int:
        """
        Estimate token count for xAI models.
        
        Args:
            messages: List of message dictionaries
            
        Returns:
            Estimated token count
        """
        # This is a rough estimate based on character count
        # xAI doesn't provide a tokenizer yet
        return sum([len(msg["content"]) // 4 for msg in messages])