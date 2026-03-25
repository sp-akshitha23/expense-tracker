const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// 🔗 Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/expenseDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// 📦 Schema
const expenseSchema = new mongoose.Schema({
    title: String,
    amount: Number,
    category: String
});

const Expense = mongoose.model("Expense", expenseSchema);

let budgetLimit = 0;

// GET expenses
app.get("/expenses", async (req, res) => {
    const expenses = await Expense.find();
    res.json(expenses);
});

// ADD expense
app.post("/expenses", async (req, res) => {
    const { title, amount, category } = req.body;

    const allExpenses = await Expense.find();
    let total = allExpenses.reduce((sum, e) => sum + e.amount, 0);

    if (budgetLimit > 0 && (total + amount) > budgetLimit) {
        return res.status(400).json({ message: "Limit exceeded" });
    }

    const newExpense = new Expense({ title, amount, category });
    await newExpense.save();

    res.json({ message: "Expense added" });
});

// DELETE expense
app.delete("/expenses/:id", async (req, res) => {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// SET budget
app.post("/budget", (req, res) => {
    budgetLimit = req.body.limit;
    res.json({ message: "Budget set" });
});

// START server
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});