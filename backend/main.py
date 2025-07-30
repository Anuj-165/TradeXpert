from fastapi import FastAPI
from auth import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from analytics import router as analytics_router
from dashboard import router as dashboard_router

app = FastAPI()

# Allow frontend to access backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # change to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth")
app.include_router(analytics_router, prefix="/analytics")
app.include_router(dashboard_router, prefix="/dashboard")

@app.get("/")
def read_root():
    return {"message": "Backend is running!"}
