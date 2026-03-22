from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    APP_NAME: str = "OllamaGate"
    ENVIRONMENT: str = "development"

    # Database
    MONGO_URI: str

    # Redis
    REDIS_URL: str

    # Auth (Bypassed for personal use)
    # JWT not needed


    # Ollama — updated at runtime when provider deploys
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"

    # Provider credentials (optional — only needed for that provider)
    RUNPOD_API_KEY: str | None = None
    AWS_REGION: str = "us-east-1"
    GCP_PROJECT: str | None = None
    AZURE_SUBSCRIPTION: str | None = None

    # Pricing overrides (optional — update if provider changes prices)
    MODAL_GPU_COST_PER_SECOND: float = 0.000533
    RUNPOD_GPU_COST_PER_SECOND: float = 0.00022
    AWS_LAMBDA_COST_PER_GB_SECOND: float = 0.0000166667
    GCP_RUN_CPU_COST_PER_SECOND: float = 0.00002400
    AZURE_CPU_COST_PER_SECOND: float = 0.000024

    class Config:
        env_file = ".env"

settings = Settings()
