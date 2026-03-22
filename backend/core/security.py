from typing import Dict

# Dummy dependency to bypass auth for personal use
async def get_current_user() -> Dict[str, str]:
    return {"id": "1", "email": "personal@ollamagate.local"}
