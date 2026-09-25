from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from datetime import datetime


# =========================================================
# FASTAPI
# =========================================================

app = FastAPI()


# Allow our frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =========================================================
# DATABASE
# =========================================================

def get_connection():
    connection = sqlite3.connect("expenses.db")
    connection.row_factory = sqlite3.Row
    return connection


def create_database():

    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL
        )
    """)

    connection.commit()
    connection.close()


create_database()


# =========================================================
# DATA MODEL
# =========================================================

class Expense(BaseModel):

    description: str
    category: str
    amount: float


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "Little Ledger backend is running!"
    }


# =========================================================
# GET ALL EXPENSES
# =========================================================

@app.get("/expenses")
def get_expenses():

    connection = get_connection()

    expenses = connection.execute(
        "SELECT * FROM expenses ORDER BY id DESC"
    ).fetchall()

    connection.close()

    return [dict(expense) for expense in expenses]


# =========================================================
# ADD EXPENSE
# =========================================================

@app.post("/expenses")
def add_expense(expense: Expense):

    connection = get_connection()

    date = datetime.now().isoformat()

    cursor = connection.execute(
        """
        INSERT INTO expenses
        (description, category, amount, date)
        VALUES (?, ?, ?, ?)
        """,
        (
            expense.description,
            expense.category,
            expense.amount,
            date
        )
    )

    connection.commit()

    expense_id = cursor.lastrowid

    connection.close()

    return {
        "message": "Expense added successfully!",
        "id": expense_id
    }


# =========================================================
# DELETE EXPENSE
# =========================================================

@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):

    connection = get_connection()

    connection.execute(
        "DELETE FROM expenses WHERE id = ?",
        (expense_id,)
    )

    connection.commit()
    connection.close()

    return {
        "message": "Expense deleted successfully!"
    }


# =========================================================
# EDIT EXPENSE
# =========================================================

@app.put("/expenses/{expense_id}")
def edit_expense(expense_id: int, expense: Expense):

    connection = get_connection()

    connection.execute(
        """
        UPDATE expenses
        SET description = ?,
            category = ?,
            amount = ?
        WHERE id = ?
        """,
        (
            expense.description,
            expense.category,
            expense.amount,
            expense_id
        )
    )

    connection.commit()
    connection.close()

    return {
        "message": "Expense updated successfully!"
    }