from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import trips, triggers, payouts


def create_app() -> FastAPI:
    app = FastAPI(
        title="QuickCover Backend",
        version="0.1.0",
        description="Parametric income protection backend for Q-commerce workers",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health():
        return {"status": "ok"}

    app.include_router(trips.router, prefix="/trips", tags=["trips"])
    app.include_router(triggers.router, prefix="/triggers", tags=["triggers"])
    app.include_router(payouts.router, prefix="/payouts", tags=["payouts"])

    return app


app = create_app()
