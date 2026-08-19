from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

@app.get("/")
def root():
    return {
        "status": "online",
        "restaurant": "INDO CHINESE",
        "tagline": "Where Indian Spice Meets Chinese Flavour",
        "address": "124 High Street, Hounslow, London TW3 1NA, UK",
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "indochinese-backend"}
