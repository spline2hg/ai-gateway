from sqlalchemy import Column, Integer, String, create_engine, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from sqlalchemy.sql import func
from sqlalchemy import DateTime
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv

load_dotenv()

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to gateways
    gateways = relationship("Gateway", back_populates="user", cascade="all, delete-orphan")

class Gateway(Base):
    __tablename__ = "gateways"

    id = Column(String, primary_key=True)
    name = Column(String)
    secret_key = Column(String)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to user
    user = relationship("User", back_populates="gateways")
    

# Determine if we're in production
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()

# Create engine based on environment
if ENVIRONMENT == "production":
    # Use PostgreSQL in production
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is required in production")
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
else:
    # Use SQLite in development
    engine = create_engine(
        "sqlite:///./gateway1.db",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()