# backend/app/main.py
import logging

from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from backend.app.routers.user.router import user_router
from backend.app.routers.session.router import session_router
from backend.app.routers.prompt.router import prompt_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MAIN
app = FastAPI()

# API v1
api_v1 = FastAPI()

api_v1.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_v1.include_router(user_router)
api_v1.include_router(session_router)
api_v1.include_router(prompt_router)


@app.get("/health")
async def health():
    return {"status": "ok"}


def main():
    import uvicorn

    app.mount("/api/v1", api_v1)
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
