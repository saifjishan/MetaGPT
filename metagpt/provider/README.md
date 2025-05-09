# MetaGPT LLM Providers

This directory contains implementations for various LLM providers that can be used with MetaGPT.

## Available Providers

- **OpenAI API**: Default provider using OpenAI's API
- **xAI API**: Implementation for xAI's Grok model
- **Gemini API**: Implementation for Google's Gemini models
- And many others...

## Adding a New Provider

To add a new LLM provider:

1. Create a new file named `<provider_name>_api.py`
2. Implement a class that inherits from `BaseLLM`
3. Add the provider to the `LLMType` enum in `metagpt/configs/llm_config.py`
4. Implement the required methods:
   - `__init__`: Initialize with the given config
   - `acompletion`: Async completion with the provider's API
   - `acompletion_text`: Get the completion text from the API response
   - `completion`: Synchronous completion with the provider's API
   - `completion_text`: Get the completion text from the API response synchronously

## Using a Provider

To use a specific provider:

```python
from metagpt.configs.llm_config import LLMConfig, LLMType
from metagpt.provider.openai_api import OpenAILLM
from metagpt.provider.xai_api import XAILLM
from metagpt.provider.gemini_api import GeminiLLM

# Using OpenAI
config = LLMConfig(llm_type=LLMType.OPENAI, api_key="your-api-key")
llm = OpenAILLM(config)

# Using xAI (Grok)
config = LLMConfig(llm_type=LLMType.XAI, api_key="your-api-key")
llm = XAILLM(config)

# Using Gemini
config = LLMConfig(llm_type=LLMType.GEMINI, api_key="your-api-key")
llm = GeminiLLM(config)

# Example usage
response = await llm.acompletion_text([
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello, how are you?"}
])
print(response)
```

## API Keys

Each provider requires its own API key. You can set these in your environment variables:

- OpenAI: `OPENAI_API_KEY`
- xAI: `XAI_API_KEY`
- Gemini: `GEMINI_API_KEY`

Or you can provide them directly in the LLMConfig.