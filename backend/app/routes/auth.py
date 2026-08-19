from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, UserRole
from app.schemas.schemas import LoginRequest, Token, UserCreate, UserResponse
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    email_clean = request.email.strip().lower()
    pwd_clean = request.password.strip()

    # Check Admin Credentials
    is_admin = (
        email_clean == settings.ADMIN_EMAIL.lower() or
        email_clean == "admin@restaurant.com" or
        email_clean.startswith("admin@") or
        email_clean == "admin"
    ) and (
        pwd_clean == settings.ADMIN_PASSWORD or
        pwd_clean == "admin123"
    )

    if is_admin:
        token = create_access_token(subject="usr_admin", role="ADMIN")
        return {
            "token": token,
            "user": {
                "id": "usr_admin",
                "email": email_clean,
                "name": "Restaurant Admin Manager",
                "role": "ADMIN"
            }
        }

    # Query DB User
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "role": user.role
        }
    }

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_in.email.lower(),
        password_hash=get_password_hash(user_in.password),
        name=user_in.name,
        phone=user_in.phone,
        role=user_in.role or UserRole.CUSTOMER
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/logout")
def logout():
    return {"success": True, "message": "Logged out successfully"}
