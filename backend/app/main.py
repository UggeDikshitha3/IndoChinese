import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.core.config import settings
from app.database.session import engine, Base
from app.routes import auth, reservations, availability, tables, menu, gallery, restaurant, admin, contact

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="INDO CHINESE RESTAURANT API",
    description="Production-grade API for table reservations, digital menu, gallery, and administration for INDO CHINESE Restaurant in Hounslow, London.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes under /api
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(reservations.router, prefix=settings.API_V1_STR)
app.include_router(availability.router, prefix=settings.API_V1_STR)
app.include_router(tables.router, prefix=settings.API_V1_STR)
app.include_router(menu.router, prefix=settings.API_V1_STR)
app.include_router(gallery.router, prefix=settings.API_V1_STR)
app.include_router(restaurant.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(contact.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "indochinese-backend"}

# Static assets mount for menu pictures
if os.path.exists("src/assets"):
    app.mount("/src/assets", StaticFiles(directory="src/assets"), name="src_assets")
elif os.path.exists("../src/assets"):
    app.mount("/src/assets", StaticFiles(directory="../src/assets"), name="src_assets")

if os.path.exists("public"):
    app.mount("/public", StaticFiles(directory="public"), name="public_assets")
elif os.path.exists("../public"):
    app.mount("/public", StaticFiles(directory="../public"), name="public_assets")

# Serve Frontend if dist exists
dist_dir = "dist" if os.path.exists("dist") else ("../dist" if os.path.exists("../dist") else None)
if dist_dir and os.path.exists(os.path.join(dist_dir, "index.html")):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="dist_assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(dist_dir, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "status": "online",
            "restaurant": "INDO CHINESE",
            "tagline": "Where Indian Spice Meets Chinese Flavour",
            "address": "124 High Street, Hounslow, London TW3 1NA, UK",
            "docs": "/docs"
        }

