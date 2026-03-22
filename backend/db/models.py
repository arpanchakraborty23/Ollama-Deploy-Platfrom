from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime, timezone
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class UserDB(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ApiKeyDB(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    user_id: str
    key_hash: str
    key_prefix: str
    model_name: str
    label: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_used: Optional[datetime] = None

class UsageLogDB(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    api_key_id: str
    model_name: str
    prompt_tokens: int = 0
    response_tokens: int = 0
    total_tokens: int = 0
    duration_ms: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ModelCacheDB(BaseModel):
    name: str # Primary key equivalent
    is_pulled: bool = False
    size_bytes: Optional[float] = None
    pulled_at: Optional[datetime] = None
    last_used: Optional[datetime] = None

class ProviderDeploymentDB(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    provider_name: str
    status: str
    endpoint_url: Optional[str] = None
    region: Optional[str] = None
    gpu_type: Optional[str] = None
    deployed_at: Optional[datetime] = None
    stopped_at: Optional[datetime] = None
    config: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CostEstimateLogDB(BaseModel):
    id: str = Field(default_factory=generate_uuid)
    provider_name: str
    model_name: str
    tokens_per_day: int
    estimated_cost: Optional[float] = None
    breakdown: Optional[Dict[str, Any]] = None
    calculated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
