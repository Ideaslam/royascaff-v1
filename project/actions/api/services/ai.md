# Services — Safqa API · AI

### SVC-AI-01 · ClaudeApiService [integration, external, AI]
- Status: done
- Methods: messages create; batches submit/poll; streaming helpers
- Deps: Anthropic SDK, workspace API key from Settings
- Side effects: external API

### SVC-AI-02 · ClaudeService [integration, external, AI]
- Status: done
- Methods: higher-level Claude helpers for controllers/legacy paths
- Deps: ClaudeApiService / SDK
- Side effects: external API

### SVC-AI-03 · CreativePromptService [domain, internal, AI]
- Status: done
- Methods: build legacy giant creative prompts from creative input
- Deps: CreativeConfigService, settings
- Side effects: none

### SVC-AI-04 · OpenAIProvider [integration, external, AI]
- Status: partial
- Methods: exposed via controller but throws "not configured"
- Deps: none (stub)
- Side effects: none
