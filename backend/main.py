from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime

app = FastAPI(title="Finance Tracker API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://localhost:5175"],
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
    
    # Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )
    ''')
    
    # Transactions Table
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
    
    # ===== WALLET TABLES =====
    # Wallet Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wallet (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            balance REAL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Wallet Transactions Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wallet_transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            type TEXT NOT NULL,
            category TEXT,
            description TEXT,
            date TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Future Bills Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS future_bills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            due_date TEXT NOT NULL,
            category TEXT,
            is_paid INTEGER DEFAULT 0,
            is_reminded INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Savings Goals Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS savings_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            target_amount REAL NOT NULL,
            current_amount REAL DEFAULT 0,
            deadline TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Monthly Budget Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS monthly_budget (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            month TEXT NOT NULL,
            category TEXT NOT NULL,
            budget_amount REAL NOT NULL,
            spent_amount REAL DEFAULT 0,
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

# ===== WALLET MODELS =====
class WalletTransactionCreate(BaseModel):
    amount: float
    type: str  # 'income', 'expense', 'add', 'withdraw', 'savings'
    category: str = None
    description: str = ""

class FutureBillCreate(BaseModel):
    title: str
    amount: float
    due_date: str
    category: str = None

class SavingsGoalCreate(BaseModel):
    name: str
    target_amount: float
    deadline: str = None

class BudgetCreate(BaseModel):
    month: str
    category: str
    budget_amount: float

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
    user_id = cursor.lastrowid
    
    # Create wallet for new user
    cursor.execute(
        "INSERT INTO wallet (user_id, balance) VALUES (?, ?)",
        (user_id, 0)
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
    
    # Save transaction
    cursor.execute(
        "INSERT INTO transactions (user_id, description, amount, type, date) VALUES (?, ?, ?, ?, ?)",
        (user_id, transaction.description, transaction.amount, transaction.type, transaction.date)
    )
    transaction_id = cursor.lastrowid
    
    # Update wallet
    cursor.execute("SELECT balance FROM wallet WHERE user_id = ?", (user_id,))
    wallet = cursor.fetchone()
    
    if transaction.type == "income":
        new_balance = wallet["balance"] + transaction.amount
        wallet_type = "income"
    else:
        if wallet["balance"] < transaction.amount:
            conn.close()
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        new_balance = wallet["balance"] - transaction.amount
        wallet_type = "expense"
    
    cursor.execute(
        "UPDATE wallet SET balance = ? WHERE user_id = ?",
        (new_balance, user_id)
    )
    
    # Wallet transaction record
    cursor.execute(
        """INSERT INTO wallet_transactions 
           (user_id, amount, type, description, date) 
           VALUES (?, ?, ?, ?, ?)""",
        (user_id, transaction.amount, wallet_type, transaction.description, transaction.date)
    )
    
    conn.commit()
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

@app.put("/api/transactions/{transaction_id}")
def update_transaction(transaction_id: int, transaction: TransactionCreate, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
        (transaction_id, user_id)
    )
    existing = cursor.fetchone()
    
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update wallet (reverse old, apply new)
    cursor.execute("SELECT balance FROM wallet WHERE user_id = ?", (user_id,))
    wallet = cursor.fetchone()
    balance = wallet["balance"]
    
    if existing["type"] == "income":
        balance -= existing["amount"]
    else:
        balance += existing["amount"]
    
    if transaction.type == "income":
        balance += transaction.amount
    else:
        if balance < transaction.amount:
            conn.close()
            raise HTTPException(status_code=400, detail="Insufficient wallet balance")
        balance -= transaction.amount
    
    cursor.execute(
        "UPDATE wallet SET balance = ? WHERE user_id = ?",
        (balance, user_id)
    )
    
    cursor.execute(
        """UPDATE transactions 
           SET description = ?, amount = ?, type = ?, date = ? 
           WHERE id = ? AND user_id = ?""",
        (transaction.description, transaction.amount, transaction.type, transaction.date, transaction_id, user_id)
    )
    conn.commit()
    conn.close()
    
    return {"message": "Transaction updated successfully"}

@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
        (transaction_id, user_id)
    )
    existing = cursor.fetchone()
    
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update wallet
    cursor.execute("SELECT balance FROM wallet WHERE user_id = ?", (user_id,))
    wallet = cursor.fetchone()
    balance = wallet["balance"]
    
    if existing["type"] == "income":
        balance -= existing["amount"]
    else:
        balance += existing["amount"]
    
    cursor.execute(
        "UPDATE wallet SET balance = ? WHERE user_id = ?",
        (balance, user_id)
    )
    
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
    
    cursor.execute(
        "SELECT balance FROM wallet WHERE user_id = ?",
        (user_id,)
    )
    wallet = cursor.fetchone()
    wallet_balance = wallet["balance"] if wallet else 0
    
    conn.close()
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense,
        "wallet_balance": wallet_balance
    }

# ===== WALLET ENDPOINTS =====

@app.get("/api/wallet")
def get_wallet(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT balance FROM wallet WHERE user_id = ?", (user_id,))
    wallet = cursor.fetchone()
    conn.close()
    
    return {"balance": wallet["balance"] if wallet else 0}

@app.get("/api/wallet/transactions")
def get_wallet_transactions(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM wallet_transactions WHERE user_id = ? ORDER BY id DESC",
        (user_id,)
    )
    transactions = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": t["id"],
            "amount": t["amount"],
            "type": t["type"],
            "category": t["category"],
            "description": t["description"],
            "date": t["date"]
        }
        for t in transactions
    ]

@app.post("/api/wallet/add")
def add_to_wallet(transaction: WalletTransactionCreate, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT balance FROM wallet WHERE user_id = ?", (user_id,))
    wallet = cursor.fetchone()
    
    if wallet:
        new_balance = wallet["balance"] + transaction.amount
        cursor.execute(
            "UPDATE wallet SET balance = ? WHERE user_id = ?",
            (new_balance, user_id)
        )
    else:
        new_balance = transaction.amount
        cursor.execute(
            "INSERT INTO wallet (user_id, balance) VALUES (?, ?)",
            (user_id, new_balance)
        )
    
    cursor.execute(
        """INSERT INTO wallet_transactions 
           (user_id, amount, type, category, description, date) 
           VALUES (?, ?, ?, ?, ?, ?)""",
        (user_id, transaction.amount, "add", transaction.category, transaction.description, 
         datetime.now().strftime("%Y-%m-%d"))
    )
    
    conn.commit()
    conn.close()
    
    return {"message": "Money added to wallet", "balance": new_balance}

@app.post("/api/wallet/withdraw")
def withdraw_from_wallet(transaction: WalletTransactionCreate, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT balance FROM wallet WHERE user_id = ?", (user_id,))
    wallet = cursor.fetchone()
    
    if not wallet or wallet["balance"] < transaction.amount:
        conn.close()
        raise HTTPException(status_code=400, detail="Insufficient balance")
    
    new_balance = wallet["balance"] - transaction.amount
    
    cursor.execute(
        "UPDATE wallet SET balance = ? WHERE user_id = ?",
        (new_balance, user_id)
    )
    
    cursor.execute(
        """INSERT INTO wallet_transactions 
           (user_id, amount, type, category, description, date) 
           VALUES (?, ?, ?, ?, ?, ?)""",
        (user_id, transaction.amount, "withdraw", transaction.category, transaction.description,
         datetime.now().strftime("%Y-%m-%d"))
    )
    
    conn.commit()
    conn.close()
    
    return {"message": "Money withdrawn", "balance": new_balance}

# ===== FUTURE BILLS =====

@app.post("/api/future-bills")
def add_future_bill(bill: FutureBillCreate, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        """INSERT INTO future_bills 
           (user_id, title, amount, due_date, category) 
           VALUES (?, ?, ?, ?, ?)""",
        (user_id, bill.title, bill.amount, bill.due_date, bill.category)
    )
    conn.commit()
    bill_id = cursor.lastrowid
    conn.close()
    
    return {"message": "Bill added", "id": bill_id}

@app.get("/api/future-bills")
def get_future_bills(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM future_bills WHERE user_id = ? AND is_paid = 0 ORDER BY due_date",
        (user_id,)
    )
    bills = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": b["id"],
            "title": b["title"],
            "amount": b["amount"],
            "due_date": b["due_date"],
            "category": b["category"],
            "is_paid": b["is_paid"]
        }
        for b in bills
    ]

@app.post("/api/future-bills/pay/{bill_id}")
def pay_future_bill(bill_id: int, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM future_bills WHERE id = ? AND user_id = ?",
        (bill_id, user_id)
    )
    bill = cursor.fetchone()
    
    if not bill:
        conn.close()
        raise HTTPException(status_code=404, detail="Bill not found")
    
    # Check wallet balance
    cursor.execute("SELECT balance FROM wallet WHERE user_id = ?", (user_id,))
    wallet = cursor.fetchone()
    
    if wallet["balance"] < bill["amount"]:
        conn.close()
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    
    # Deduct from wallet
    new_balance = wallet["balance"] - bill["amount"]
    cursor.execute(
        "UPDATE wallet SET balance = ? WHERE user_id = ?",
        (new_balance, user_id)
    )
    
    # Mark bill as paid
    cursor.execute(
        "UPDATE future_bills SET is_paid = 1 WHERE id = ?",
        (bill_id,)
    )
    
    # Add to wallet transactions
    cursor.execute(
        """INSERT INTO wallet_transactions 
           (user_id, amount, type, category, description, date) 
           VALUES (?, ?, ?, ?, ?, ?)""",
        (user_id, bill["amount"], "expense", bill["category"], f"Bill: {bill['title']}", 
         datetime.now().strftime("%Y-%m-%d"))
    )
    
    conn.commit()
    conn.close()
    
    return {"message": "Bill paid successfully", "balance": new_balance}

# ===== SAVINGS GOALS =====

@app.post("/api/savings-goals")
def add_savings_goal(goal: SavingsGoalCreate, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        """INSERT INTO savings_goals 
           (user_id, name, target_amount, deadline) 
           VALUES (?, ?, ?, ?)""",
        (user_id, goal.name, goal.target_amount, goal.deadline)
    )
    conn.commit()
    goal_id = cursor.lastrowid
    conn.close()
    
    return {"message": "Savings goal added", "id": goal_id}

@app.get("/api/savings-goals")
def get_savings_goals(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM savings_goals WHERE user_id = ?",
        (user_id,)
    )
    goals = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": g["id"],
            "name": g["name"],
            "target_amount": g["target_amount"],
            "current_amount": g["current_amount"],
            "deadline": g["deadline"],
            "progress": (g["current_amount"] / g["target_amount"]) * 100 if g["target_amount"] > 0 else 0
        }
        for g in goals
    ]

@app.post("/api/savings-goals/add-money/{goal_id}")
def add_to_savings_goal(goal_id: int, amount: float, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT * FROM savings_goals WHERE id = ? AND user_id = ?",
        (goal_id, user_id)
    )
    goal = cursor.fetchone()
    
    if not goal:
        conn.close()
        raise HTTPException(status_code=404, detail="Goal not found")
    
    cursor.execute("SELECT balance FROM wallet WHERE user_id = ?", (user_id,))
    wallet = cursor.fetchone()
    
    if wallet["balance"] < amount:
        conn.close()
        raise HTTPException(status_code=400, detail="Insufficient wallet balance")
    
    new_balance = wallet["balance"] - amount
    cursor.execute(
        "UPDATE wallet SET balance = ? WHERE user_id = ?",
        (new_balance, user_id)
    )
    
    new_current = goal["current_amount"] + amount
    cursor.execute(
        "UPDATE savings_goals SET current_amount = ? WHERE id = ?",
        (new_current, goal_id)
    )
    
    cursor.execute(
        """INSERT INTO wallet_transactions 
           (user_id, amount, type, description, date) 
           VALUES (?, ?, ?, ?, ?)""",
        (user_id, amount, "savings", f"Added to savings: {goal['name']}", 
         datetime.now().strftime("%Y-%m-%d"))
    )
    
    conn.commit()
    conn.close()
    
    return {"message": "Money added to savings goal", "current_amount": new_current}

# ===== MONTHLY BUDGET =====

@app.post("/api/budget")
def set_budget(budget: BudgetCreate, user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if budget exists for this month and category
    cursor.execute(
        "SELECT * FROM monthly_budget WHERE user_id = ? AND month = ? AND category = ?",
        (user_id, budget.month, budget.category)
    )
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute(
            "UPDATE monthly_budget SET budget_amount = ? WHERE id = ?",
            (budget.budget_amount, existing["id"])
        )
    else:
        cursor.execute(
            """INSERT INTO monthly_budget 
               (user_id, month, category, budget_amount) 
               VALUES (?, ?, ?, ?)""",
            (user_id, budget.month, budget.category, budget.budget_amount)
        )
    
    conn.commit()
    conn.close()
    
    return {"message": "Budget set successfully"}

@app.get("/api/budget")
def get_budget(user_id: int, month: str = None):
    conn = get_db()
    cursor = conn.cursor()
    
    if not month:
        month = datetime.now().strftime("%m/%Y")
    
    cursor.execute(
        "SELECT * FROM monthly_budget WHERE user_id = ? AND month = ?",
        (user_id, month)
    )
    budgets = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": b["id"],
            "category": b["category"],
            "budget_amount": b["budget_amount"],
            "spent_amount": b["spent_amount"],
            "remaining": b["budget_amount"] - b["spent_amount"],
            "percentage": (b["spent_amount"] / b["budget_amount"]) * 100 if b["budget_amount"] > 0 else 0
        }
        for b in budgets
    ]

@app.get("/api/budget/alert")
def get_budget_alert(user_id: int):
    conn = get_db()
    cursor = conn.cursor()
    
    current_month = datetime.now().strftime("%m/%Y")
    cursor.execute(
        "SELECT * FROM monthly_budget WHERE user_id = ? AND month = ?",
        (user_id, current_month)
    )
    budgets = cursor.fetchall()
    conn.close()
    
    alerts = []
    for b in budgets:
        if b["spent_amount"] > b["budget_amount"]:
            alerts.append({
                "category": b["category"],
                "budget": b["budget_amount"],
                "spent": b["spent_amount"],
                "exceeded_by": b["spent_amount"] - b["budget_amount"]
            })
    
    return {"alerts": alerts}

@app.get("/")
def root():
    return {"message": "Finance Tracker API is running!"}