# MetaGPT LLM Providers

This document provides detailed information about the LLM providers supported by MetaGPT.

## Supported Providers

### OpenAI API

The default provider using OpenAI's API for models like GPT-3.5 and GPT-4.

**Configuration:**
```python
from metagpt.configs.llm_config import LLMConfig, LLMType

config = LLMConfig(
    llm_type=LLMType.OPENAI,
    api_key="your-openai-api-key",
    model_name="gpt-4",  # Optional, defaults to gpt-3.5-turbo
    base_url="https://api.openai.com/v1",  # Optional
    temperature=0.7,  # Optional
    max_tokens=None,  # Optional
    top_p=1.0  # Optional
)
```

**Environment Variables:**
- `OPENAI_API_KEY`: Your OpenAI API key

**Features:**
- Supports all OpenAI models (GPT-3.5, GPT-4, etc.)
- Streaming responses
- Function calling
- System messages

**Limitations:**
- Requires an OpenAI API key
- May have rate limits depending on your account tier

### xAI API (Grok)

Implementation for xAI's Grok model.

**Configuration:**
```python
from metagpt.configs.llm_config import LLMConfig, LLMType

config = LLMConfig(
    llm_type=LLMType.XAI,
    api_key="your-xai-api-key",
    model_name="grok-1",  # Optional
    temperature=0.7,  # Optional
    max_tokens=None,  # Optional
    top_p=1.0  # Optional
)
```

**Environment Variables:**
- `XAI_API_KEY`: Your xAI API key

**Features:**
- Access to Grok models
- Support for chat completions
- System messages

**Limitations:**
- API is relatively new and may have changes
- Limited model selection compared to OpenAI
- May have different token limits than OpenAI

### Gemini API

Implementation for Google's Gemini models.

**Configuration:**
```python
from metagpt.configs.llm_config import LLMConfig, LLMType

config = LLMConfig(
    llm_type=LLMType.GEMINI,
    api_key="your-gemini-api-key",
    model_name="gemini-pro",  # Optional
    temperature=0.7,  # Optional
    max_tokens=None,  # Optional
    top_p=1.0  # Optional
)
```

**Environment Variables:**
- `GEMINI_API_KEY`: Your Google AI Studio API key

**Features:**
- Access to Google's Gemini models
- Support for chat completions
- System messages (implemented as user messages with a specific format)

**Limitations:**
- Different message format than OpenAI
- System messages are implemented differently
- May have different token limits than OpenAI

## Error Handling and Retry Mechanisms

All providers implement the following error handling and retry mechanisms:

1. **Rate Limiting**: Automatically retries with exponential backoff when rate limits are hit
2. **Temporary Failures**: Retries on network errors and temporary API failures
3. **Token Limits**: Handles token limit errors by truncating input when possible
4. **API Key Validation**: Validates API keys before making requests
5. **Timeout Handling**: Implements timeouts to prevent hanging requests

Example of error handling:

```python
from metagpt.configs.llm_config import LLMConfig, LLMType
from metagpt.provider.openai_api import OpenAILLM
import asyncio

async def test_with_retry():
    config = LLMConfig(
        llm_type=LLMType.OPENAI,
        api_key="your-openai-api-key"
    )
    
    llm = OpenAILLM(config)
    
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            messages = [
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Hello, how are you?"}
            ]
            
            response = await llm.acompletion_text(messages)
            return response
            
        except Exception as e:
            retry_count += 1
            wait_time = 2 ** retry_count  # Exponential backoff
            print(f"Error: {e}. Retrying in {wait_time} seconds...")
            await asyncio.sleep(wait_time)
    
    raise Exception(f"Failed after {max_retries} retries")
```

## Implementing a New Provider

To add a new LLM provider:

1. Create a new file named `<provider_name>_api.py` in the `metagpt/provider/` directory
2. Implement a class that inherits from `BaseLLM`
3. Add the provider to the `LLMType` enum in `metagpt/configs/llm_config.py`
4. Implement the required methods:
   - `__init__`: Initialize with the given config
   - `acompletion`: Async completion with the provider's API
   - `acompletion_text`: Get the completion text from the API response
   - `completion`: Synchronous completion with the provider's API
   - `completion_text`: Get the completion text from the API response synchronously

Example template for a new provider:

```python
from typing import Dict, List, Optional, Union, Any
from metagpt.provider.base_llm import BaseLLM
from metagpt.configs.llm_config import LLMConfig

class NewProviderLLM(BaseLLM):
    """Implementation for New Provider API"""
    
    def __init__(self, config: LLMConfig):
        """Initialize with the given config"""
        super().__init__(config)
        self.api_key = config.api_key
        self.model_name = config.model_name or "default-model"
        # Add any other provider-specific initialization
    
    async def acompletion(self, messages: List[Dict], **kwargs) -> Dict:
        """Async completion with the provider's API"""
        # Implement API call to the provider
        # Handle errors and retries
        # Return response in a standardized format
        pass
    
    async def acompletion_text(self, messages: List[Dict], **kwargs) -> str:
        """Get the completion text from the API response"""
        response = await self.acompletion(messages, **kwargs)
        # Extract and return the text from the response
        pass
    
    def completion(self, messages: List[Dict], **kwargs) -> Dict:
        """Synchronous completion with the provider's API"""
        # Implement synchronous version or use asyncio.run
        pass
    
    def completion_text(self, messages: List[Dict], **kwargs) -> str:
        """Get the completion text from the API response synchronously"""
        response = self.completion(messages, **kwargs)
        # Extract and return the text from the response
        pass
```

## Best Practices

1. **API Key Security**: Never hardcode API keys in your code. Use environment variables or secure configuration files.
2. **Error Handling**: Implement comprehensive error handling for API errors, network issues, and rate limits.
3. **Retry Logic**: Use exponential backoff for retries to avoid overwhelming the API service.
4. **Logging**: Log API calls and errors for debugging, but be careful not to log sensitive information.
5. **Token Management**: Be mindful of token limits and implement strategies to handle long inputs.
6. **Testing**: Create tests for your provider implementation to ensure it works correctly.
7. **Documentation**: Document your provider implementation, including any specific features or limitations.

## Troubleshooting

### Common Issues

1. **API Key Invalid**: Ensure your API key is correct and has the necessary permissions.
2. **Rate Limits**: If you're hitting rate limits, implement backoff strategies or request higher limits.
3. **Token Limits**: If you're exceeding token limits, consider chunking your input or using a different model.
4. **Network Issues**: Check your network connection and firewall settings.
5. **API Changes**: Provider APIs may change over time. Keep your implementation up to date.

### Debugging

1. Enable debug logging to see detailed information about API calls:
   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

2. Use the provider's API documentation to understand error messages and response formats.

3. Test with simple inputs first to ensure basic functionality works before trying complex scenarios.