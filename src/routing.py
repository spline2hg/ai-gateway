MODEL_TO_PROVIDER = {
    
    # openrouter models  
    "aion-1.0": "aion-labs",
    "aion-1.0-mini": "aion-labs",
    "aion-rp-llama-3.1-8b": "aion-labs",
    "auto": "openrouter",
    "bodybuilder": "openrouter",
    "chatgpt-4o-latest": "openai",
    "claude-3-haiku": "anthropic",
    "claude-3-opus": "anthropic",
    "claude-3.5-haiku": "anthropic",
    "claude-3.5-haiku-20241022": "anthropic",
    "claude-3.5-sonnet": "anthropic",
    "claude-3.7-sonnet": "anthropic",
    "claude-3.7-sonnet:thinking": "anthropic",
    "claude-haiku-4.5": "anthropic",
    "claude-opus-4": "anthropic",
    "claude-opus-4.1": "anthropic",
    "claude-opus-4.5": "anthropic",
    "claude-sonnet-4": "anthropic",
    "claude-sonnet-4.5": "anthropic",
    "codellama-7b-instruct-solidity": "alfredpros",
    "coder-large": "arcee-ai",
    "codestral-2508": "mistralai",
    "codex-mini": "openai",
    "cogito-v2-preview-llama-109b-moe": "deepcogito",
    "cogito-v2-preview-llama-405b": "deepcogito",
    "cogito-v2-preview-llama-70b": "deepcogito",
    "cogito-v2.1-671b": "deepcogito",
    "command-a": "cohere",
    "command-r-08-2024": "cohere",
    "command-r-plus-08-2024": "cohere",
    "command-r7b-12-2024": "cohere",
    "cydonia-24b-v4.1": "thedrummer",
    "deephermes-3-mistral-24b-preview": "nousresearch",
    "deepseek-chat": "deepseek",
    "deepseek-chat-v3-0324": "deepseek",
    "deepseek-chat-v3.1": "deepseek",
    "deepseek-prover-v2": "deepseek",
    "deepseek-r1": "deepseek",
    "deepseek-r1-0528": "deepseek",
    "deepseek-r1-0528-qwen3-8b": "deepseek",
    "deepseek-r1-distill-llama-70b": "deepseek",
    "deepseek-r1-distill-qwen-14b": "deepseek",
    "deepseek-r1-distill-qwen-32b": "deepseek",
    "deepseek-r1t-chimera": "tngtech",
    "deepseek-r1t-chimera:free": "tngtech",
    "deepseek-r1t2-chimera": "tngtech",
    "deepseek-r1t2-chimera:free": "tngtech",
    "deepseek-v3.1-nex-n1:free": "nex-agi",
    "deepseek-v3.1-terminus": "deepseek",
    "deepseek-v3.1-terminus:exacto": "deepseek",
    "deepseek-v3.2": "deepseek",
    "deepseek-v3.2-exp": "deepseek",
    "deepseek-v3.2-speciale": "deepseek",
    "devstral-2512": "mistralai",
    "devstral-2512:free": "mistralai",
    "devstral-medium": "mistralai",
    "devstral-small": "mistralai",
    "devstral-small-2505": "mistralai",
    "dolphin-mistral-24b-venice-edition:free": "cognitivecomputations",
    "ernie-4.5-21b-a3b": "baidu",
    "ernie-4.5-21b-a3b-thinking": "baidu",
    "ernie-4.5-300b-a47b": "baidu",
    "ernie-4.5-vl-28b-a3b": "baidu",
    "ernie-4.5-vl-424b-a47b": "baidu",
    "gemini-2.0-flash-001": "google",
    "gemini-2.0-flash-exp:free": "google",
    "gemini-2.0-flash-lite-001": "google",
    "gemini-2.5-flash": "google",
    "gemini-2.5-flash-image": "google",
    "gemini-2.5-flash-image-preview": "google",
    "gemini-2.5-flash-lite": "google",
    "gemini-2.5-flash-lite-preview-09-2025": "google",
    "gemini-2.5-flash-preview-09-2025": "google",
    "gemini-2.5-pro": "google",
    "gemini-2.5-pro-preview": "google",
    "gemini-2.5-pro-preview-05-06": "google",
    "gemini-3-pro-image-preview": "google",
    "gemini-3-pro-preview": "google",
    "gemma-2-27b-it": "google",
    "gemma-2-9b-it": "google",
    "gemma-3-12b-it": "google",
    "gemma-3-12b-it:free": "google",
    "gemma-3-27b-it": "google",
    "gemma-3-27b-it:free": "google",
    "gemma-3-4b-it": "google",
    "gemma-3-4b-it:free": "google",
    "gemma-3n-e2b-it:free": "google",
    "gemma-3n-e4b-it": "google",
    "gemma-3n-e4b-it:free": "google",
    "glm-4-32b": "z-ai",
    "glm-4.1v-9b-thinking": "thudm",
    "glm-4.5": "z-ai",
    "glm-4.5-air": "z-ai",
    "glm-4.5-air:free": "z-ai",
    "glm-4.5v": "z-ai",
    "glm-4.6": "z-ai",
    "glm-4.6:exacto": "z-ai",
    "glm-4.6v": "z-ai",
    "goliath-120b": "alpindale",
    "gpt-3.5-turbo": "openai",
    "gpt-3.5-turbo-0613": "openai",
    "gpt-3.5-turbo-16k": "openai",
    "gpt-3.5-turbo-instruct": "openai",
    "gpt-4": "openai",
    "gpt-4-0314": "openai",
    "gpt-4-1106-preview": "openai",
    "gpt-4-turbo": "openai",
    "gpt-4-turbo-preview": "openai",
    "gpt-4.1": "openai",
    "gpt-4.1-mini": "openai",
    "gpt-4.1-nano": "openai",
    "gpt-4o": "openai",
    "gpt-4o-2024-05-13": "openai",
    "gpt-4o-2024-08-06": "openai",
    "gpt-4o-2024-11-20": "openai",
    "gpt-4o-audio-preview": "openai",
    "gpt-4o-mini": "openai",
    "gpt-4o-mini-2024-07-18": "openai",
    "gpt-4o-mini-search-preview": "openai",
    "gpt-4o-search-preview": "openai",
    "gpt-4o:extended": "openai",
    "gpt-5": "openai",
    "gpt-5-chat": "openai",
    "gpt-5-codex": "openai",
    "gpt-5-image": "openai",
    "gpt-5-image-mini": "openai",
    "gpt-5-mini": "openai",
    "gpt-5-nano": "openai",
    "gpt-5-pro": "openai",
    "gpt-5.1": "openai",
    "gpt-5.1-chat": "openai",
    "gpt-5.1-codex": "openai",
    "gpt-5.1-codex-max": "openai",
    "gpt-5.1-codex-mini": "openai",
    "gpt-5.2": "openai",
    "gpt-5.2-chat": "openai",
    "gpt-5.2-pro": "openai",
    "gpt-oss-120b": "openai",
    "gpt-oss-120b:exacto": "openai",
    "gpt-oss-120b:free": "openai",
    "gpt-oss-20b": "openai",
    "gpt-oss-20b:free": "openai",
    "gpt-oss-safeguard-20b": "openai",
    "granite-4.0-h-micro": "ibm-granite",
    "grok-3": "x-ai",
    "grok-3-beta": "x-ai",
    "grok-3-mini": "x-ai",
    "grok-3-mini-beta": "x-ai",
    "grok-4": "x-ai",
    "grok-4-fast": "x-ai",
    "grok-4.1-fast": "x-ai",
    "grok-code-fast-1": "x-ai",
    "hermes-2-pro-llama-3-8b": "nousresearch",
    "hermes-3-llama-3.1-405b": "nousresearch",
    "hermes-3-llama-3.1-405b:free": "nousresearch",
    "hermes-3-llama-3.1-70b": "nousresearch",
    "hermes-4-405b": "nousresearch",
    "hermes-4-70b": "nousresearch",
    "hunyuan-a13b-instruct": "tencent",
    "inflection-3-pi": "inflection",
    "inflection-3-productivity": "inflection",
    "intellect-3": "prime-intellect",
    "internvl3-78b": "opengvlab",
    "jamba-large-1.7": "ai21",
    "jamba-mini-1.7": "ai21",
    "kat-coder-pro:free": "kwaipilot",
    "kimi-dev-72b": "moonshotai",
    "kimi-k2": "moonshotai",
    "kimi-k2-0905": "moonshotai",
    "kimi-k2-0905:exacto": "moonshotai",
    "kimi-k2-thinking": "moonshotai",
    "kimi-k2:free": "moonshotai",
    "l3-euryale-70b": "sao10k",
    "l3-lunaris-8b": "sao10k",
    "l3.1-70b-hanami-x1": "sao10k",
    "l3.1-euryale-70b": "sao10k",
    "l3.3-euryale-70b": "sao10k",
    "lfm-2.2-6b": "liquid",
    "lfm2-8b-a1b": "liquid",
    "llama-3-70b-instruct": "meta-llama",
    "llama-3-8b-instruct": "meta-llama",
    "llama-3.1-405b": "meta-llama",
    "llama-3.1-405b-instruct": "meta-llama",
    "llama-3.1-70b-instruct": "meta-llama",
    "llama-3.1-8b-instruct": "meta-llama",
    "llama-3.1-lumimaid-8b": "neversleep",
    "llama-3.1-nemotron-70b-instruct": "nvidia",
    "llama-3.1-nemotron-ultra-253b-v1": "nvidia",
    "llama-3.2-11b-vision-instruct": "meta-llama",
    "llama-3.2-1b-instruct": "meta-llama",
    "llama-3.2-3b-instruct": "meta-llama",
    "llama-3.2-3b-instruct:free": "meta-llama",
    "llama-3.2-90b-vision-instruct": "meta-llama",
    "llama-3.3-70b-instruct": "meta-llama",
    "llama-3.3-70b-instruct:free": "meta-llama",
    "llama-3.3-nemotron-super-49b-v1.5": "nvidia",
    "llama-4-maverick": "meta-llama",
    "llama-4-scout": "meta-llama",
    "llama-guard-2-8b": "meta-llama",
    "llama-guard-3-8b": "meta-llama",
    "llama-guard-4-12b": "meta-llama",
    "llemma_7b": "eleutherai",
    "longcat-flash-chat": "meituan",
    "maestro-reasoning": "arcee-ai",
    "magnum-v4-72b": "anthracite-org",
    "mercury": "inception",
    "mercury-coder": "inception",
    "mimo-v2-flash:free": "xiaomi",
    "minimax-01": "minimax",
    "minimax-m1": "minimax",
    "minimax-m2": "minimax",
    "ministral-14b-2512": "mistralai",
    "ministral-3b": "mistralai",
    "ministral-3b-2512": "mistralai",
    "ministral-8b": "mistralai",
    "ministral-8b-2512": "mistralai",
    "mistral-7b-instruct": "mistralai",
    "mistral-7b-instruct-v0.1": "mistralai",
    "mistral-7b-instruct-v0.2": "mistralai",
    "mistral-7b-instruct-v0.3": "mistralai",
    "mistral-7b-instruct:free": "mistralai",
    "mistral-large": "mistralai",
    "mistral-large-2407": "mistralai",
    "mistral-large-2411": "mistralai",
    "mistral-large-2512": "mistralai",
    "mistral-medium-3": "mistralai",
    "mistral-medium-3.1": "mistralai",
    "mistral-nemo": "mistralai",
    "mistral-saba": "mistralai",
    "mistral-small-24b-instruct-2501": "mistralai",
    "mistral-small-3.1-24b-instruct": "mistralai",
    "mistral-small-3.1-24b-instruct:free": "mistralai",
    "mistral-small-3.2-24b-instruct": "mistralai",
    "mistral-small-creative": "mistralai",
    "mistral-tiny": "mistralai",
    "mixtral-8x22b-instruct": "mistralai",
    "mixtral-8x7b-instruct": "mistralai",
    "morph-v3-fast": "morph",
    "morph-v3-large": "morph",
    "mythomax-l2-13b": "gryphe",
    "nemotron-3-nano-30b-a3b:free": "nvidia",
    "nemotron-nano-12b-v2-vl": "nvidia",
    "nemotron-nano-12b-v2-vl:free": "nvidia",
    "nemotron-nano-9b-v2": "nvidia",
    "nemotron-nano-9b-v2:free": "nvidia",
    "noromaid-20b": "neversleep",
    "nova-2-lite-v1": "amazon",
    "nova-2-lite-v1:free": "amazon",
    "nova-lite-v1": "amazon",
    "nova-micro-v1": "amazon",
    "nova-premier-v1": "amazon",
    "nova-pro-v1": "amazon",
    "o1": "openai",
    "o1-pro": "openai",
    "o3": "openai",
    "o3-deep-research": "openai",
    "o3-mini": "openai",
    "o3-mini-high": "openai",
    "o3-pro": "openai",
    "o4-mini": "openai",
    "o4-mini-deep-research": "openai",
    "o4-mini-high": "openai",
    "olmo-2-0325-32b-instruct": "allenai",
    "olmo-3-32b-think:free": "allenai",
    "olmo-3-7b-instruct": "allenai",
    "olmo-3-7b-think": "allenai",
    "olmo-3.1-32b-think:free": "allenai",
    "phi-3-medium-128k-instruct": "microsoft",
    "phi-3-mini-128k-instruct": "microsoft",
    "phi-3.5-mini-128k-instruct": "microsoft",
    "phi-4": "microsoft",
    "phi-4-multimodal-instruct": "microsoft",
    "phi-4-reasoning-plus": "microsoft",
    "pixtral-12b": "mistralai",
    "pixtral-large-2411": "mistralai",
    "qwen-2.5-72b-instruct": "qwen",
    "qwen-2.5-7b-instruct": "qwen",
    "qwen-2.5-coder-32b-instruct": "qwen",
    "qwen-2.5-vl-7b-instruct": "qwen",
    "qwen-max": "qwen",
    "qwen-plus": "qwen",
    "qwen-plus-2025-07-28": "qwen",
    "qwen-plus-2025-07-28:thinking": "qwen",
    "qwen-turbo": "qwen",
    "qwen-vl-max": "qwen",
    "qwen-vl-plus": "qwen",
    "qwen2.5-coder-7b-instruct": "qwen",
    "qwen2.5-vl-32b-instruct": "qwen",
    "qwen2.5-vl-72b-instruct": "qwen",
    "qwen3-14b": "qwen",
    "qwen3-235b-a22b": "qwen",
    "qwen3-235b-a22b-2507": "qwen",
    "qwen3-235b-a22b-thinking-2507": "qwen",
    "qwen3-235b-a22b:free": "qwen",
    "qwen3-30b-a3b": "qwen",
    "qwen3-30b-a3b-instruct-2507": "qwen",
    "qwen3-30b-a3b-thinking-2507": "qwen",
    "qwen3-32b": "qwen",
    "qwen3-4b:free": "qwen",
    "qwen3-8b": "qwen",
    "qwen3-coder": "qwen",
    "qwen3-coder-30b-a3b-instruct": "qwen",
    "qwen3-coder-flash": "qwen",
    "qwen3-coder-plus": "qwen",
    "qwen3-coder:exacto": "qwen",
    "qwen3-coder:free": "qwen",
    "qwen3-max": "qwen",
    "qwen3-next-80b-a3b-instruct": "qwen",
    "qwen3-next-80b-a3b-thinking": "qwen",
    "qwen3-vl-235b-a22b-instruct": "qwen",
    "qwen3-vl-235b-a22b-thinking": "qwen",
    "qwen3-vl-30b-a3b-instruct": "qwen",
    "qwen3-vl-30b-a3b-thinking": "qwen",
    "qwen3-vl-8b-instruct": "qwen",
    "qwen3-vl-8b-thinking": "qwen",
    "qwq-32b": "qwen",
    "qwq-32b-arliai-rpr-v1": "arliai",
    "relace-apply-3": "relace",
    "relace-search": "relace",
    "remm-slerp-l2-13b": "undi95",
    "rnj-1-instruct": "essentialai",
    "rocinante-12b": "thedrummer",
    "router": "switchpoint",
    "skyfall-36b-v2": "thedrummer",
    "sonar": "perplexity",
    "sonar-deep-research": "perplexity",
    "sonar-pro": "perplexity",
    "sonar-reasoning": "perplexity",
    "sonar-reasoning-pro": "perplexity",
    "sorcererlm-8x22b": "raifle",
    "spotlight": "arcee-ai",
    "step3": "stepfun-ai",
    "tng-r1t-chimera": "tngtech",
    "tng-r1t-chimera:free": "tngtech",
    "tongyi-deepresearch-30b-a3b": "alibaba",
    "tongyi-deepresearch-30b-a3b:free": "alibaba",
    "trinity-mini": "arcee-ai",
    "trinity-mini:free": "arcee-ai",
    "ui-tars-1.5-7b": "bytedance",
    "unslopnemo-12b": "thedrummer",
    "virtuoso-large": "arcee-ai",
    "voxtral-small-24b-2507": "mistralai",
    "weaver": "mancer",
    "wizardlm-2-8x22b": "microsoft",
  

    # other models
    "gpt-5.2-chat-latest": "openai",
    "gpt-5.1-chat-latest": "openai",
    "gpt-5-chat-latest": "openai",
    "gpt-realtime": "openai",
    "gpt-realtime-mini": "openai",
    "gpt-4o-realtime-preview": "openai",
    "gpt-4o-mini-realtime-preview": "openai",
    "gpt-audio": "openai",
    "gpt-audio-mini": "openai",
    "gpt-4o-mini-audio-preview": "openai",
    "o1-mini": "openai",
    "codex-mini-latest": "openai",
    "gpt-5-search-api": "openai",
    "computer-use-preview": "openai",
    "gpt-image-1.5": "openai",
    "chatgpt-image-latest": "openai",
    "gpt-image-1": "openai",
    "gpt-image-1-mini": "openai",
    
    "gemini-3-flash-preview": "google",
    "gemini-2.5-flash-native-audio-preview-12-2025": "google",
    "gemini-2.5-flash-preview-tts": "google",
    "gemini-2.5-pro-preview-tts": "google",
    "gemini-2.0-flash": "google",
    "gemini-2.0-flash-lite": "google",
    
    "claude-sonnet-3.7": "anthropic",
    "claude-haiku-3.5": "anthropic",
    "claude-opus-3": "anthropic",
    "claude-haiku-3": "anthropic",
    
    "mistral-large-3": "mistralai",
    "magistral-medium": "mistralai",
    "ministral-3-3b": "mistralai",
    "ministral-3-8b": "mistralai",
    "ministral-3-14b": "mistralai",
    "codestral": "mistralai",
    "mistral-small-3.2": "mistralai",
    "magistral-small": "mistralai",
    "voxtral-small": "mistralai",
    "voxtral-mini": "mistralai",
    "pixtral-large": "mistralai",
    "mistral-7b": "mistralai",
    "mixtral-8x7b": "mistralai",
    "mixtral-8x22b": "mistralai",

    "opus-4.5": "anthropic",
    "sonnet-4.5": "anthropic",
    "sonnet-4.5-long": "anthropic",
    "haiku-4.5": "anthropic",
    
    "grok-4.1-fast-reasoning": "xai",
    "grok-4.1-fast-non-reasoning": "xai",
    "grok-4-fast-reasoning": "xai",
    "grok-4-fast-non-reasoning": "xai",
    "grok-4-0709": "xai",
    "grok-2-vision-1212": "xai",
    "grok-2-image-1212": "xai",

}

PROVIDER_TO_BASEURL = {
  "ai21": "api.ai21.com",
  "aion-labs": "https://api.aiod.eu",
  "alfredpros": "https://openrouter.ai/api/v1",
  "allenai": "https://openrouter.ai/api/v1",
  "anthropic": "https://api.anthropic.com",
  "arcee-ai": "https://api.arcee.ai/api/v1",
  "baidu": "https://aip.baidubce.com",
  "bytedance": "https://openrouter.ai/api/v1",
  "cohere": "https://api.cohere.ai/v1",
  "deepcogito": "https://openrouter.ai/api/v1",
  "deepseek": "https://api.deepseek.com",
  "google": "https://generativelanguage.googleapis.com/v1beta/openai/",
  "minimax": "https://api.minimax.chat/v1",
  "mistralai": "api.mistral.ai",
  "moonshotai": "https://api.moonshot.ai",
  "nousresearch": "https://inference-api.nousresearch.com/v1",
  "nvidia": "integrate.api.nvidia.com",
  "openai": "https://api.openai.com/v1",
  "openrouter": "https://openrouter.ai/api/v1",
  "perplexity": "https://api.perplexity.ai",
  "prime-intellect": "https://api.pinference.ai/api/v1",
  "qwen": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
  "stepfun-ai": "https://api.stepfun.com/v1",
  "x-ai": "https://api.x.ai/v1",
  "z-ai": "https://api.z.ai/api/paas/v4",
  "qwen-cli": "https://portal.qwen.ai/v1/",
  "cerebras": "https://api.cerebras.ai/v1",
  
  
  "alibaba": "https://dashscope.aliyuncs.com/api/v1",
  "amazon": "https://bedrock-runtime.us-east-1.amazonaws.com",
  "eleutherai": "https://openrouter.ai/api/v1",
  "gryphe": "https://api.together.xyz",
  "ibm-granite": "https://openrouter.ai/api/v1",
  "inflection": "https://api.inflection.ai",
  "mancer": "https://neuro.mancer.tech",
  "meta-llama": "https://api.llama.com/v1",
  "microsoft": "https://models.github.ai/inference",
  "meituan": "https://openrouter.ai/api/v1",
  "opengvlab": "https://openrouter.ai/api/v1",
  "tencent": "https://ai3d.intl.tencentcloudapi.com",
  "thudm": "https://openrouter.ai/api/v1",
  "xiaomi": "https://openrouter.ai/api/v1",

  "alpindale": "https://openrouter.ai/api/v1",
  "anthracite-org": "https://openrouter.ai/api/v1",
  "arliai": "https://openrouter.ai/api/v1",
  "cognitivecomputations": "https://openrouter.ai/api/v1",
  "essentialai": "https://openrouter.ai/api/v1",
  "inception": "https://openrouter.ai/api/v1",
  "kwaipilot": "https://openrouter.ai/api/v1",
  "liquid": "https://openrouter.ai/api/v1",
  "morph": "https://api.morphllm.com/v1",
  "neversleep": "https://openrouter.ai/api/v1",
  "nex-agi": "https://openrouter.ai/api/v1",
  "raifle": "https://openrouter.ai/api/v1",
  "relace": "https://openrouter.ai/api/v1",
  "sao10k": "https://openrouter.ai/api/v1",
  "switchpoint": "https://openrouter.ai/api/v1",
  "thedrummer": "https://openrouter.ai/api/v1",
  "tngtech": "https://openrouter.ai/api/v1",
  "undi95": "https://openrouter.ai/api/v1"
}



MODEL_COST = {
  "cerebras:zai-glm-4.6": {
    "input_per_million": 2.25,
    "output_per_million": 2.75
  },
  "cerebras:gpt-oss-120b": {
    "input_per_million": 0.35,
    "output_per_million": 0.75
  },
  "cerebras:llama-3.1-8b": {
    "input_per_million": 0.1,
    "output_per_million": 0.1
  },
  "cerebras:llama-3.3-70b": {
    "input_per_million": 0.85,
    "output_per_million": 1.2
  },
  "cerebras:qwen-3-32b": {
    "input_per_million": 0.4,
    "output_per_million": 0.8
  },
  "cerebras:qwen-3-235b-instruct": {
    "input_per_million": 0.6,
    "output_per_million": 1.2
  },
  "openai:gpt-5.2": {
    "input_per_million": 1.75,
    "output_per_million": 14.0
  },
  "openai:gpt-5.1": {
    "input_per_million": 1.25,
    "output_per_million": 10.0
  },
  "openai:gpt-5": {
    "input_per_million": 1.25,
    "output_per_million": 10.0
  },
  "openai:gpt-5-mini": {
    "input_per_million": 0.25,
    "output_per_million": 2.0
  },
  "openai:gpt-5-nano": {
    "input_per_million": 0.05,
    "output_per_million": 0.4
  },
  "openai:gpt-5.2-chat-latest": {
    "input_per_million": 1.75,
    "output_per_million": 14.0
  },
  "openai:gpt-5.1-chat-latest": {
    "input_per_million": 1.25,
    "output_per_million": 10.0
  },
  "openai:gpt-5-chat-latest": {
    "input_per_million": 1.25,
    "output_per_million": 10.0
  },
  "openai:gpt-5.1-codex-max": {
    "input_per_million": 1.25,
    "output_per_million": 10.0
  },
  "openai:gpt-5.1-codex": {
    "input_per_million": 1.25,
    "output_per_million": 10.0
  },
  "openai:gpt-5-codex": {
    "input_per_million": 1.25,
    "output_per_million": 10.0
  },
  "openai:gpt-5.2-pro": {
    "input_per_million": 21.0,
    "output_per_million": 168.0
  },
  "openai:gpt-5-pro": {
    "input_per_million": 15.0,
    "output_per_million": 120.0
  },
  "openai:gpt-4.1": {
    "input_per_million": 2.0,
    "output_per_million": 8.0
  },
  "openai:gpt-4.1-mini": {
    "input_per_million": 0.4,
    "output_per_million": 1.6
  },
  "openai:gpt-4.1-nano": {
    "input_per_million": 0.1,
    "output_per_million": 0.4
  },
  "openai:gpt-4o": {
    "input_per_million": 2.5,
    "output_per_million": 10.0
  },
  "openai:gpt-4o-2024-05-13": {
    "input_per_million": 5.0,
    "output_per_million": 15.0
  },
  "openai:gpt-4o-mini": {
    "input_per_million": 0.15,
    "output_per_million": 0.6
  },
  "openai:gpt-realtime": {
    "input_per_million": 4.0,
    "output_per_million": 16.0
  },
  "openai:gpt-realtime-mini": {
    "input_per_million": 0.6,
    "output_per_million": 2.4
  },
  "openai:gpt-4o-realtime-preview": {
    "input_per_million": 5.0,
    "output_per_million": 20.0
  },
  "openai:gpt-4o-mini-realtime-preview": {
    "input_per_million": 0.6,
    "output_per_million": 2.4
  },
  "openai:gpt-audio": {
    "input_per_million": 2.5,
    "output_per_million": 10.0
  },
  "openai:gpt-audio-mini": {
    "input_per_million": 0.6,
    "output_per_million": 2.4
  },
  "openai:gpt-4o-audio-preview": {
    "input_per_million": 2.5,
    "output_per_million": 10.0
  },
  "openai:gpt-4o-mini-audio-preview": {
    "input_per_million": 0.15,
    "output_per_million": 0.6
  },
  "openai:o1": {
    "input_per_million": 15.0,
    "output_per_million": 60.0
  },
  "openai:o1-pro": {
    "input_per_million": 150.0,
    "output_per_million": 600.0
  },
  "openai:o3-pro": {
    "input_per_million": 20.0,
    "output_per_million": 80.0
  },
  "openai:o3": {
    "input_per_million": 2.0,
    "output_per_million": 8.0
  },
  "openai:o3-deep-research": {
    "input_per_million": 10.0,
    "output_per_million": 40.0
  },
  "openai:o4-mini": {
    "input_per_million": 1.1,
    "output_per_million": 4.4
  },
  "openai:o4-mini-deep-research": {
    "input_per_million": 2.0,
    "output_per_million": 8.0
  },
  "openai:o3-mini": {
    "input_per_million": 1.1,
    "output_per_million": 4.4
  },
  "openai:o1-mini": {
    "input_per_million": 1.1,
    "output_per_million": 4.4
  },
  "openai:gpt-5.1-codex-mini": {
    "input_per_million": 0.25,
    "output_per_million": 2.0
  },
  "openai:codex-mini-latest": {
    "input_per_million": 1.5,
    "output_per_million": 6.0
  },
  "openai:gpt-5-search-api": {
    "input_per_million": 1.25,
    "output_per_million": 10.0
  },
  "openai:gpt-4o-mini-search-preview": {
    "input_per_million": 0.15,
    "output_per_million": 0.6
  },
  "openai:gpt-4o-search-preview": {
    "input_per_million": 2.5,
    "output_per_million": 10.0
  },
  "openai:computer-use-preview": {
    "input_per_million": 3.0,
    "output_per_million": 12.0
  },
  "openai:gpt-image-1.5": {
    "input_per_million": 5.0,
    "output_per_million": 10.0
  },
  "openai:chatgpt-image-latest": {
    "input_per_million": 5.0,
    "output_per_million": 10.0
  },
  "openai:gpt-image-1": {
    "input_per_million": 5.0,
    "output_per_million": 0.0
  },
  "openai:gpt-image-1-mini": {
    "input_per_million": 2.0,
    "output_per_million": 0.0
  },
  "google:gemini-3-pro-preview": {
    "input_per_million": 2.0,
    "output_per_million": 12.0
  },
  "google:gemini-3-flash-preview": {
    "input_per_million": 0.5,
    "output_per_million": 3.0
  },
  "google:gemini-3-pro-image-preview": {
    "input_per_million": 2.0,
    "output_per_million": 12.0
  },
  "google:gemini-2.5-pro": {
    "input_per_million": 1.25,
    "output_per_million": 10.0
  },
  "google:gemini-2.5-flash": {
    "input_per_million": 0.3,
    "output_per_million": 2.5
  },
  "google:gemini-2.5-flash-preview-09-2025": {
    "input_per_million": 0.3,
    "output_per_million": 2.5
  },
  "google:gemini-2.5-flash-lite": {
    "input_per_million": 0.1,
    "output_per_million": 0.4
  },
  "google:gemini-2.5-flash-lite-preview-09-2025": {
    "input_per_million": 0.1,
    "output_per_million": 0.4
  },
  "google:gemini-2.5-flash-image": {
    "input_per_million": 0.3,
    "output_per_million": 30.0
  },
  "google:gemini-2.0-flash": {
    "input_per_million": 0.1,
    "output_per_million": 0.4
  },
  "google:gemini-2.0-flash-lite": {
    "input_per_million": 0.075,
    "output_per_million": 0.3
  },
  "anthropic:claude-opus-4.1": {
    "input_per_million": 15.0,
    "output_per_million": 75.0
  },
  "anthropic:claude-sonnet-4": {
    "input_per_million": 3.0,
    "output_per_million": 15.0
  },
  "anthropic:claude-opus-4": {
    "input_per_million": 15.0,
    "output_per_million": 75.0
  },
  "anthropic:claude-sonnet-3.7": {
    "input_per_million": 3.0,
    "output_per_million": 15.0
  },
  "anthropic:claude-haiku-3.5": {
    "input_per_million": 0.8,
    "output_per_million": 4.0
  },
  "anthropic:claude-opus-3": {
    "input_per_million": 15.0,
    "output_per_million": 75.0
  },
  "anthropic:claude-haiku-3": {
    "input_per_million": 0.25,
    "output_per_million": 1.25
  },
  "mistralai:mistral-large-3": {
    "input_per_million": 0.5,
    "output_per_million": 1.5
  },
  "mistralai:mistral-medium-3": {
    "input_per_million": 0.4,
    "output_per_million": 2.0
  },
  "mistralai:magistral-medium": {
    "input_per_million": 2.0,
    "output_per_million": 5.0
  },
  "mistralai:ministral-3-3b": {
    "input_per_million": 0.1,
    "output_per_million": 0.1
  },
  "mistralai:ministral-3-8b": {
    "input_per_million": 0.15,
    "output_per_million": 0.15
  },
  "mistralai:ministral-3-14b": {
    "input_per_million": 0.2,
    "output_per_million": 0.2
  },
  "mistralai:codestral": {
    "input_per_million": 0.3,
    "output_per_million": 0.9
  },
  "mistralai:mistral-small-3.2": {
    "input_per_million": 0.1,
    "output_per_million": 0.3
  },
  "mistralai:mistral-small-creative": {
    "input_per_million": 0.1,
    "output_per_million": 0.3
  },
  "mistralai:magistral-small": {
    "input_per_million": 0.5,
    "output_per_million": 1.5
  },
  "mistralai:voxtral-small": {
    "input_per_million": 0.1,
    "output_per_million": 0.3
  },
  "mistralai:voxtral-mini": {
    "input_per_million": 0.04,
    "output_per_million": 0.04
  },
  "mistralai:pixtral-large": {
    "input_per_million": 2.0,
    "output_per_million": 6.0
  },
  "mistralai:pixtral-12b": {
    "input_per_million": 0.15,
    "output_per_million": 0.15
  },
  "mistralai:mistral-7b": {
    "input_per_million": 0.25,
    "output_per_million": 0.25
  },
  "mistralai:mixtral-8x7b": {
    "input_per_million": 0.7,
    "output_per_million": 0.7
  },
  "mistralai:mixtral-8x22b": {
    "input_per_million": 2.0,
    "output_per_million": 6.0
  },
  "anthropic:opus-4.5": {
    "input_per_million": 5.0,
    "output_per_million": 25.0
  },
  "anthropic:sonnet-4.5": {
    "input_per_million": 3.0,
    "output_per_million": 15.0
  },
  "anthropic:sonnet-4.5-long": {
    "input_per_million": 6.0,
    "output_per_million": 22.5
  },
  "anthropic:haiku-4.5": {
    "input_per_million": 1.0,
    "output_per_million": 5.0
  },
  "perplexity:sonar": {
    "input_per_million": 1.0,
    "output_per_million": 1.0
  },
  "perplexity:sonar-pro": {
    "input_per_million": 3.0,
    "output_per_million": 15.0
  },
  "perplexity:sonar-reasoning": {
    "input_per_million": 1.0,
    "output_per_million": 5.0
  },
  "perplexity:sonar-reasoning-pro": {
    "input_per_million": 2.0,
    "output_per_million": 8.0
  },
  "perplexity:sonar-deep-research": {
    "input_per_million": 2.0,
    "output_per_million": 8.0
  },
  "xai:grok-4.1-fast-reasoning": {
    "input_per_million": 0.2,
    "output_per_million": 0.5
  },
  "xai:grok-4.1-fast-non-reasoning": {
    "input_per_million": 0.2,
    "output_per_million": 0.5
  },
  "xai:grok-code-fast-1": {
    "input_per_million": 0.2,
    "output_per_million": 1.5
  },
  "xai:grok-4-fast-reasoning": {
    "input_per_million": 0.2,
    "output_per_million": 0.5
  },
  "xai:grok-4-fast-non-reasoning": {
    "input_per_million": 0.2,
    "output_per_million": 0.5
  },
  "xai:grok-4-0709": {
    "input_per_million": 3.0,
    "output_per_million": 15.0
  },
  "xai:grok-3-mini": {
    "input_per_million": 0.3,
    "output_per_million": 0.5
  },
  "xai:grok-3": {
    "input_per_million": 3.0,
    "output_per_million": 15.0
  },
  "xai:grok-2-vision-1212": {
    "input_per_million": 2.0,
    "output_per_million": 10.0
  },
  "xai:grok-2-image-1212": {
    "per_image": 0.07
  }
}

# print(len(MODEL_COST))
