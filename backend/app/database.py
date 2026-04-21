from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "postgresql://postgres:rahul@localhost:5432/ai_learning"

engine = create_engine(DATABASE_URL, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
