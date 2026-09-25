// =========================================================
// LITTLE LEDGER
// =========================================================


// =========================================================
// BACKEND URL
// =========================================================

const API_URL = "https://little-ledger-api.onrender.com";


// =========================================================
// HTML ELEMENTS
// =========================================================

const form = document.querySelector("form");

const descriptionInput =
    document.querySelector("#description");

const categoryInput =
    document.querySelector("#category");

const amountInput =
    document.querySelector("#amount");

const expenseList =
    document.querySelector("#expense-list");

const totalSpending =
    document.querySelector("#total-spending");

const highestExpense =
    document.querySelector("#highest-expense");

const foodTotal =
    document.querySelector("#food-total");

const travelTotal =
    document.querySelector("#travel-total");

const shoppingTotal =
    document.querySelector("#shopping-total");


// =========================================================
// VARIABLES
// =========================================================

let expenses = [];

let editingId = null;


// =========================================================
// GET ICON
// =========================================================

function getIcon(expense) {

    const name = expense.description.toLowerCase();

    const icons = {

        pizza: "🍕",
        burger: "🍔",
        coffee: "☕",
        tea: "🍵",
        momo: "🥟",
        noodles: "🍜",
        cake: "🍰",

        bus: "🚌",
        train: "🚆",
        uber: "🚕",
        taxi: "🚕",
        petrol: "⛽",
        fuel: "⛽",

        shoe: "👟",
        shoes: "👟",
        shirt: "👕",
        clothes: "👕",

        book: "📚",
        grocery: "🛒"
    };


    for (let word in icons) {

        if (name.includes(word)) {
            return icons[word];
        }
    }


    if (expense.category === "food") {
        return "🍴";
    }

    if (expense.category === "travel") {
        return "🚗";
    }

    if (expense.category === "shopping") {
        return "🛍️";
    }

    return "💰";
}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(date) {

    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


// =========================================================
// LOAD EXPENSES FROM BACKEND
// =========================================================

async function loadExpenses() {

    try {

        const response =
            await fetch(`${API_URL}/expenses`);

        expenses = await response.json();

        renderExpenses();
        updateSummary();

    }

    catch (error) {

        console.error(error);

        expenseList.innerHTML = `
            <p class="empty-message">
                Could not connect to the backend.
            </p>
        `;
    }
}


// =========================================================
// ADD / EDIT EXPENSE
// =========================================================

form.addEventListener("submit", async function(event) {

    event.preventDefault();


    const description =
        descriptionInput.value.trim();

    const category =
        categoryInput.value;

    const amount =
        Number(amountInput.value);


    if (description === "" || amount <= 0) {

        alert("Please enter a description and valid amount.");

        return;
    }


    const expenseData = {

        description: description,

        category: category,

        amount: amount
    };


    try {

        let response;


        // -------------------------------------------------
        // EDIT
        // -------------------------------------------------

        if (editingId !== null) {

            response = await fetch(
                `${API_URL}/expenses/${editingId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(expenseData)
                }
            );

        }


        // -------------------------------------------------
        // ADD
        // -------------------------------------------------

        else {

            response = await fetch(
                `${API_URL}/expenses`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(expenseData)
                }
            );
        }


        if (!response.ok) {
            throw new Error("Request failed");
        }


        // Reload data from database

        await loadExpenses();


        // Reset form

        form.reset();

        editingId = null;


        const button =
            form.querySelector("button");

        button.textContent = "Add expense";

    }


    catch (error) {

        console.error(error);

        alert("Something went wrong. Make sure the backend is running.");
    }

});


// =========================================================
// DISPLAY ALL EXPENSES
// =========================================================

function renderExpenses() {

    expenseList.innerHTML = "";


    if (expenses.length === 0) {

        expenseList.innerHTML = `
            <p class="empty-message">
                🌱<br>
                Your ledger is empty.<br>
                Add your first little expense.
            </p>
        `;

        return;
    }


    for (let expense of expenses) {

        displayExpense(expense);
    }
}


// =========================================================
// DISPLAY ONE EXPENSE
// =========================================================

function displayExpense(expense) {

    const expenseElement =
        document.createElement("div");

    expenseElement.classList.add("expense-item");


    const icon = getIcon(expense);


    expenseElement.innerHTML = `

        <div class="expense-info">

            <div class="expense-title">

                <span class="expense-icon">
                    ${icon}
                </span>

                <strong>
                    ${expense.description}
                </strong>

            </div>

            <small>
                ${expense.category} ·
                ${formatDate(expense.date)}
            </small>

        </div>


        <div class="expense-right">

            <strong class="expense-amount">
                ₹${expense.amount}
            </strong>

            <button
                class="edit-button"
                type="button">
                ✎
            </button>

            <button
                class="delete-button"
                type="button">
                ×
            </button>

        </div>
    `;


    expenseList.appendChild(expenseElement);


    // =====================================================
    // DELETE
    // =====================================================

    const deleteButton =
        expenseElement.querySelector(".delete-button");


    deleteButton.addEventListener(
        "click",
        async function() {

            try {

                const response =
                    await fetch(
                        `${API_URL}/expenses/${expense.id}`,
                        {
                            method: "DELETE"
                        }
                    );


                if (!response.ok) {
                    throw new Error("Delete failed");
                }


                await loadExpenses();

            }

            catch (error) {

                console.error(error);

                alert("Could not delete expense.");
            }

        }
    );


    // =====================================================
    // EDIT
    // =====================================================

    const editButton =
        expenseElement.querySelector(".edit-button");


    editButton.addEventListener(
        "click",
        function() {

            descriptionInput.value =
                expense.description;

            categoryInput.value =
                expense.category;

            amountInput.value =
                expense.amount;


            editingId = expense.id;


            const button =
                form.querySelector("button");

            button.textContent = "Update expense";


            descriptionInput.focus();
        }
    );
}


// =========================================================
// UPDATE SUMMARY
// =========================================================

function updateSummary() {

    let total = 0;

    let highest = 0;

    let food = 0;

    let travel = 0;

    let shopping = 0;


    for (let expense of expenses) {

        total += expense.amount;


        if (expense.amount > highest) {

            highest = expense.amount;
        }


        if (expense.category === "food") {

            food += expense.amount;
        }


        else if (expense.category === "travel") {

            travel += expense.amount;
        }


        else if (expense.category === "shopping") {

            shopping += expense.amount;
        }
    }


    totalSpending.textContent =
        `₹${total}`;

    highestExpense.textContent =
        `₹${highest}`;

    foodTotal.textContent =
        `₹${food}`;

    travelTotal.textContent =
        `₹${travel}`;

    shoppingTotal.textContent =
        `₹${shopping}`;
}


// =========================================================
// START APPLICATION
// =========================================================

loadExpenses();