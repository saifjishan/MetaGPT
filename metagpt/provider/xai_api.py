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
from typing import List, Optional, Union, AsyncGenerator

import xai
from xai.sdk.models import ChatCompletionRequest, ChatMessage, ChatCompletionResponse

from metagpt.configs.llm_config import LLMConfig, LLMType
from metagpt.const import USE_CONFIG_TIMEOUT
from metagpt.logs import log_llm_stream, logger
from metagpt.provider.base_llm import BaseLLM
from metagpt.provider.llm_provider_registry import register_provider


@register_provider(LLMType.XAI)
class XaiLLM(BaseLLM):
    """
    xAI (Grok) LLM API implementation
    """

    def __init__(self, config: LLMConfig):
        self.use_system_prompt = True
        self.__init_xai(config)
        self.config = config
        self.model = config.model or "grok-1"
        self.pricing_plan = self.config.pricing_plan or self.model
        self.client = xai.Client(api_key=config.api_key)

    def __init_xai(self, config: LLMConfig):
        if config.proxy:
            logger.info(f"Use proxy: {config.proxy}")
            os.environ["http_proxy"] = config.proxy
            os.environ["https_proxy"] = config.proxy

    def _user_msg(self, msg: str, images: Optional[Union[str, list[str]]] = None) -> dict[str, str]:
        return {"role": "user", "content": msg}

    def _assistant_msg(self, msg: str) -> dict[str, str]:
        return {"role": "assistant", "content": msg}

    def _system_msg(self, msg: str) -> dict[str, str]:
        return {"role": "system", "content": msg}

    def _const_kwargs(self, messages: list[dict], stream: bool = False) -> dict:
        chat_messages = [ChatMessage(role=msg["role"], content=msg["content"]) for msg in messages]
        
        kwargs = {
            "request": ChatCompletionRequest(
                model=self.model,
                messages=chat_messages,
                temperature=self.config.temperature,
                max_tokens=self.config.max_token,
                stream=stream
            )
        }
        return kwargs

    def get_choice_text(self, resp: ChatCompletionResponse) -> str:
        return resp.choices[0].message.content

    def get_usage(self, resp: ChatCompletionResponse) -> dict:
        if resp.usage:
            return {
                "prompt_tokens": resp.usage.prompt_tokens,
                "completion_tokens": resp.usage.completion_tokens,
                "total_tokens": resp.usage.total_tokens
            }
        return {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}

    async def _achat_completion(self, messages: list[dict], timeout=USE_CONFIG_TIMEOUT) -> ChatCompletionResponse:
        """Asynchronous chat completion"""
        try:
            kwargs = self._const_kwargs(messages)
            response = await self.client.chat.completions.create_async(**kwargs)
            usage = self.get_usage(response)
            self._update_costs(usage)
            return response
        except Exception as e:
            logger.error(f"xAI API error: {e}")
            raise e

    async def acompletion(self, messages: list[dict], timeout=USE_CONFIG_TIMEOUT) -> dict:
        """Asynchronous completion that returns the raw response"""
        return await self._achat_completion(messages, timeout=self.get_timeout(timeout))

    async def _achat_completion_stream(self, messages: list[dict], timeout: int = USE_CONFIG_TIMEOUT) -> str:
        """Asynchronous streaming chat completion"""
        try:
            kwargs = self._const_kwargs(messages, stream=True)
            stream_response = await self.client.chat.completions.create_async(**kwargs)
            
            collected_content = []
            prompt_tokens = 0
            completion_tokens = 0
            
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
            
        except Exception as e:
            logger.error(f"xAI API streaming error: {e}")
            raise e

    def count_tokens(self, messages: list[dict]) -> int:
        """Estimate token count for xAI models"""
        # This is a rough estimate based on character count
        return sum([len(msg["content"]) // 4 for msg in messages])