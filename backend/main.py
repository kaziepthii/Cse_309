from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3

app = FastAPI(title="Finance Tracker API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== DATABASE SETUP =====
def get_db():
    conn = sqlite3.connect("finance.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            description TEXT NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

# ===== MODELS =====
class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class TransactionCreate(BaseModel):
    description: str
    amount: float
    type: str
    date: str

# ===== AUTH ENDPOINTS =====

@app.post("/api/register")
def register(user: UserRegister):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM users WHERE username = ?", (user.username,))
    existing = cursor.fetchone()
    
    if existing:
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")
    
    cursor.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        (user.username, user.password)
    )
    conn.commit()
    conn.close()
    
    return {"message": "User registered successfully"}

@app.post("/api/login")
def login(user: UserLogin):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM users WHERE username = ? AND password = ?",
        (user.username, user.password)
    )
    db_user = cursor.fetchone()
    conn.close()
    
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {
        "message": "Login successful",
        "user_id": db_user["id"],
        "username": db_user["username"]
    }

# ===== TRANSACTION ENDPOINTS =====

@app.post("/api/transactions")
def add_transaction(transaction: TransactionCreate, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO transactions (user_id, description, amount, type, date) VALUES (?, ?, ?, ?, ?)",
        (user_id, transaction.description, transaction.amount, transaction.type, transaction.date)
    )
    conn.commit()
    transaction_id = cursor.lastrowid
    conn.close()
    
    return {"message": "Transaction added", "id": transaction_id}

@app.get("/api/transactions")
def get_transactions(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC",
        (user_id,)
    )
    transactions = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": t["id"],
            "description": t["description"],
            "amount": t["amount"],
            "type": t["type"],
            "date": t["date"]
        }
        for t in transactions
    ]

@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "DELETE FROM transactions WHERE id = ? AND user_id = ?",
        (transaction_id, user_id)
    )
    conn.commit()
    conn.close()
    
    return {"message": "Transaction deleted"}

@app.get("/api/summary")
def get_summary(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'income'",
        (user_id,)
    )
    total_income = cursor.fetchone()["total"] or 0
    
    cursor.execute(
        "SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type = 'expense'",
        (user_id,)
    )
    total_expense = cursor.fetchone()["total"] or 0
    
    conn.close()
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense
    }

@app.get("/")
def root():
    return {"message": "Finance Tracker API is running!"}