from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/")
def root():
    return {
        "message": "Inventory & Order Management API",
        "docs": "/docs",
        "health": "/health",
    }


@router.get("/health")
def health():
    return {"status": "ok"}
